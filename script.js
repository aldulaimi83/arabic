import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let board;
let game = new Chess();
let mode = "local";
let roomId = null;
let roomListenerRef = null;
let playerColor = "white";

const statusEl = document.getElementById("status");
const roomInput = document.getElementById("roomInput");
const roomCodeEl = document.getElementById("roomCode");
const moveHistoryEl = document.getElementById("moveHistory");

function initBoard() {
  board = Chessboard("board", {
    draggable: true,
    position: "start",
    pieceTheme:
      "https://cdnjs.cloudflare.com/ajax/libs/chessboard.js/1.0.0/img/chesspieces/wikipedia/{piece}.png",
    onDragStart,
    onDrop,
    onSnapEnd
  });

  updateStatus();
  renderMoveHistory();
}

function onDragStart(source, piece) {
  if (game.game_over()) return false;

  if (
    (game.turn() === "w" && piece.startsWith("b")) ||
    (game.turn() === "b" && piece.startsWith("w"))
  ) {
    return false;
  }

  if (mode === "online") {
    const turnColor = game.turn() === "w" ? "white" : "black";
    if (turnColor !== playerColor) return false;
  }
}

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: "q"
  });

  if (move === null) return "snapback";

  board.position(game.fen(), true);
  updateStatus();
  renderMoveHistory();

  if (mode === "ai" && !game.game_over()) {
    setTimeout(makeAIMove, 300);
  }

  if (mode === "online" && roomId) {
    syncRoom();
  }
}

function onSnapEnd() {
  board.position(game.fen());
}

function makeAIMove() {
  const moves = game.moves();
  if (!moves.length) return;

  const move = moves[Math.floor(Math.random() * moves.length)];
  game.move(move);
  board.position(game.fen(), true);
  updateStatus();
  renderMoveHistory();
}

function updateStatus() {
  let text = "";

  if (game.in_checkmate()) {
    text = `Checkmate. ${game.turn() === "w" ? "Black" : "White"} wins.`;
  } else if (game.in_draw()) {
    text = "Draw.";
  } else {
    text = `${game.turn() === "w" ? "White" : "Black"} to move`;
    if (game.in_check()) text += " — Check!";
  }

  if (mode === "ai") text += " | Mode: AI";
  if (mode === "local") text += " | Mode: Local";
  if (mode === "online") text += ` | Mode: Online | You are ${playerColor}`;

  statusEl.textContent = text;
}

function renderMoveHistory() {
  const history = game.history();
  moveHistoryEl.innerHTML = "";

  history.forEach((move, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${move}`;
    moveHistoryEl.appendChild(li);
  });
}

function resetGame() {
  game.reset();
  board.start();
  updateStatus();
  renderMoveHistory();

  if (mode === "online" && roomId) {
    syncRoom();
  }
}

function startAI() {
  cleanupRoomListener();
  mode = "ai";
  roomId = null;
  roomCodeEl.textContent = "None";
  playerColor = "white";
  resetGame();
}

function startLocal() {
  cleanupRoomListener();
  mode = "local";
  roomId = null;
  roomCodeEl.textContent = "None";
  playerColor = "white";
  resetGame();
}

function flipBoard() {
  board.flip();
}

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function createRoom() {
  cleanupRoomListener();
  mode = "online";
  roomId = generateRoomId();
  playerColor = "white";
  roomCodeEl.textContent = roomId;

  game.reset();
  board.start();
  updateStatus();
  renderMoveHistory();

  const roomRef = ref(db, `rooms/${roomId}`);
  await set(roomRef, {
    fen: game.fen(),
    turn: game.turn(),
    createdAt: Date.now()
  });

  listenToRoom();
}

async function joinRoom() {
  const enteredRoom = roomInput.value.trim().toUpperCase();

  if (!enteredRoom) {
    alert("Enter a room code first.");
    return;
  }

  cleanupRoomListener();

  const roomRef = ref(db, `rooms/${enteredRoom}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    alert("Room not found.");
    return;
  }

  mode = "online";
  roomId = enteredRoom;
  playerColor = "black";
  roomCodeEl.textContent = roomId;

  const data = snapshot.val();
  if (data?.fen) {
    game.load(data.fen);
    board.position(data.fen, true);
  }

  updateStatus();
  renderMoveHistory();
  listenToRoom();
}

function syncRoom() {
  if (!roomId) return;

  const roomRef = ref(db, `rooms/${roomId}`);
  set(roomRef, {
    fen: game.fen(),
    turn: game.turn(),
    updatedAt: Date.now()
  });
}

function listenToRoom() {
  if (!roomId) return;

  cleanupRoomListener();

  roomListenerRef = ref(db, `rooms/${roomId}`);
  onValue(roomListenerRef, (snapshot) => {
    const data = snapshot.val();
    if (!data || !data.fen) return;

    if (game.fen() !== data.fen) {
      game.load(data.fen);
      board.position(data.fen, true);
      updateStatus();
      renderMoveHistory();
    }
  });
}

function cleanupRoomListener() {
  if (roomListenerRef) {
    off(roomListenerRef);
    roomListenerRef = null;
  }
}

document.getElementById("aiBtn").addEventListener("click", startAI);
document.getElementById("localBtn").addEventListener("click", startLocal);
document.getElementById("createRoomBtn").addEventListener("click", createRoom);
document.getElementById("joinRoomBtn").addEventListener("click", joinRoom);
document.getElementById("flipBtn").addEventListener("click", flipBoard);
document.getElementById("resetBtn").addEventListener("click", resetGame);

initBoard();
