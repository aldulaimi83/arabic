const SERVER_URL = "https://youooo-chess-backend.onrender.com";

/* =========================
   GLOBAL STATE
========================= */
let currentGame = "chess"; // chess | checkers
let currentSection = "play"; // play | academy

/* =========================
   CHESS STATE
========================= */
let socket = null;
let board = null;
let game = null;

let playMode = "local";
let roomId = null;
let playerColor = "white";
let isMyTurn = true;
let aiDifficulty = "easy";

const pieceValues = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

let currentLevel = "beginner";
let currentLessonId = null;
let currentLessonStepIndex = 0;
let lessonCompleted = {};
let lessonStars = {};
let lessonHintUsed = false;
let academyLocked = false;

/* =========================
   CHECKERS STATE
========================= */
let checkersMode = "local"; // local | ai
let checkersDifficulty = "easy";
let checkersBoardState = [];
let checkersCurrentPlayer = "red";
let selectedChecker = null;
let validMoves = [];
let pendingCheckerAi = null;

/* =========================
   DOM
========================= */
let statusEl;
let roomInput;
let roomCodeEl;
let moveHistoryEl;
let serverStateEl;
let playPanel;
let academyPanel;
let currentSectionLabel;
let lessonListEl;
let lessonTitleEl;
let lessonSummaryEl;
let coachBoxEl;
let lessonLevelTagEl;
let lessonTypeTagEl;
let lessonStarsTagEl;
let academyProgressBadgeEl;
let progressStatsEl;
let aiInfoEl;
let checkersAiInfoEl;

/* =========================
   LESSONS
========================= */
const lessons = [
  {
    id: "rook-lines",
    level: "beginner",
    type: "lesson",
    title: "Rook Moves in Straight Lines",
    summary: "A rook moves horizontally or vertically. Move the rook from a1 to a8.",
    fen: "8/8/8/8/8/8/8/R3K3 w - - 0 1",
    orientation: "white",
    coachIntro: "The rook is strongest on open files and ranks. It cannot move diagonally.",
    hints: ["Look straight up the board.", "Move the rook from a1 to a8."],
    completionText: "Great. You moved the rook in a straight line.",
    expectedMoves: [{ by: "user", from: "a1", to: "a8", note: "Exactly. Rooks travel in straight lines." }]
  },
  {
    id: "bishop-diagonal",
    level: "beginner",
    type: "lesson",
    title: "Bishop Moves Diagonally",
    summary: "A bishop moves on diagonals only. Move the bishop from c1 to h6.",
    fen: "8/8/8/8/8/8/8/2B1K3 w - - 0 1",
    orientation: "white",
    coachIntro: "Bishops stay on the same color squares for the entire game.",
    hints: ["Trace the diagonal from c1.", "The target square is h6."],
    completionText: "Nice. You used the bishop correctly on a diagonal.",
    expectedMoves: [{ by: "user", from: "c1", to: "h6", note: "Correct. Bishops slide diagonally." }]
  },
  {
    id: "knight-jump",
    level: "beginner",
    type: "lesson",
    title: "Knight Jumps in an L Shape",
    summary: "Knights move in an L shape and can jump over pieces. Move the knight from d4 to f5.",
    fen: "8/8/8/8/3N4/8/8/4K3 w - - 0 1",
    orientation: "white",
    coachIntro: "Knights move two squares one way and one square the other way.",
    hints: ["Think: two and one.", "From d4 the target is f5."],
    completionText: "Perfect. Knights are tricky because they jump.",
    expectedMoves: [{ by: "user", from: "d4", to: "f5", note: "Correct. The knight jumped in an L shape." }]
  },
  {
    id: "castle-king-safety",
    level: "beginner",
    type: "lesson",
    title: "Castling for King Safety",
    summary: "Castle kingside to bring the king to safety and connect your rook.",
    fen: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
    orientation: "white",
    coachIntro: "Castling is one of the most important opening habits for king safety.",
    hints: ["Move the king two squares toward the rook.", "White castles kingside by moving king e1 to g1."],
    completionText: "Well done. Castling keeps your king safer.",
    expectedMoves: [{ by: "user", from: "e1", to: "g1", note: "Good. That is kingside castling." }]
  },
  {
    id: "mate-in-one",
    level: "beginner",
    type: "puzzle",
    title: "Checkmate in One",
    summary: "Find the move that gives immediate checkmate.",
    fen: "6k1/5ppp/8/8/8/8/5PPP/6RK w - - 0 1",
    orientation: "white",
    coachIntro: "Look for forcing moves. Checks are the first thing to consider in tactics.",
    hints: ["Use the rook on g1.", "Move the rook to e1 for mate."],
    completionText: "Excellent. You found a simple mating net.",
    expectedMoves: [{ by: "user", from: "g1", to: "e1", note: "Correct. Re1# is checkmate." }]
  },
  {
    id: "fork-tactic",
    level: "intermediate",
    type: "puzzle",
    title: "Knight Fork",
    summary: "Use the knight to attack two important pieces at once.",
    fen: "4k3/8/8/3q4/8/2N5/8/4K3 w - - 0 1",
    orientation: "white",
    coachIntro: "Forks win material by attacking more than one target at the same time.",
    hints: ["The knight can check the king and hit the queen.", "Try b5+."],
    completionText: "Great tactical vision. Forks are powerful beginner-intermediate weapons.",
    expectedMoves: [{ by: "user", from: "c3", to: "b5", note: "Exactly. Nb5+ forks the king and queen." }]
  },
  {
    id: "pin-tactic",
    level: "intermediate",
    type: "puzzle",
    title: "Use a Pin",
    summary: "Pin the knight to the king with your bishop.",
    fen: "4k3/8/8/8/8/5n2/4b3/4K2B w - - 0 1",
    orientation: "white",
    coachIntro: "Pinned pieces often cannot move because they would expose something more valuable behind them.",
    hints: ["Your bishop on h1 can attack the king's diagonal.", "Move bishop to c6."],
    completionText: "Nice. A pin can completely freeze a defender.",
    expectedMoves: [{ by: "user", from: "h1", to: "c6", note: "Correct. The knight is pinned to the king." }]
  },
  {
    id: "opening-center",
    level: "intermediate",
    type: "lesson",
    title: "Fight for the Center",
    summary: "Play a strong central opening move.",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    orientation: "white",
    coachIntro: "In the opening, control the center, develop pieces, and protect your king.",
    hints: ["Push a central pawn two squares.", "e4 is the classical choice here."],
    completionText: "Good start. Central space helps all your pieces.",
    expectedMoves: [
      { by: "user", from: "e2", to: "e4", note: "Correct. e4 claims central space." },
      { by: "coach", from: "e7", to: "e5", note: "Black responds in the center too." },
      { by: "user", from: "g1", to: "f3", note: "Excellent. Develop a knight and attack e5." }
    ]
  },
  {
    id: "remove-defender",
    level: "advanced",
    type: "puzzle",
    title: "Remove the Defender",
    summary: "Eliminate the defender first, then win the target.",
    fen: "4k3/8/8/8/4q3/8/4R3/4K2Q w - - 0 1",
    orientation: "white",
    coachIntro: "Many advanced tactics start by removing the one piece that protects everything.",
    hints: ["Your rook can capture the queen.", "Play Rxe4+."],
    completionText: "Excellent. Removing the defender is a classic tactical idea.",
    expectedMoves: [{ by: "user", from: "e2", to: "e4", note: "Correct. You removed the strongest defender immediately." }]
  },
  {
    id: "back-rank",
    level: "advanced",
    type: "puzzle",
    title: "Back Rank Mate",
    summary: "Use the weak back rank to checkmate.",
    fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    orientation: "white",
    coachIntro: "If the king has no escape squares and the pawns trap it, heavy pieces become deadly.",
    hints: ["Use the rook on d1.", "Rd8+ is the winning move."],
    completionText: "Correct. Back-rank weaknesses decide many practical games.",
    expectedMoves: [{ by: "user", from: "d1", to: "d8", note: "Beautiful. Rd8# finishes the game." }]
  },
  {
    id: "queen-sac-mate",
    level: "expert",
    type: "puzzle",
    title: "Queen Sacrifice Pattern",
    summary: "A forcing attack sometimes requires a sacrifice. Find the first move.",
    fen: "6k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1",
    orientation: "white",
    coachIntro: "Expert players calculate forcing lines with checks, captures, and threats.",
    hints: ["Start with a checking move.", "Qa8+ is the move."],
    completionText: "Strong pattern recognition. Forcing lines are everything in tactical attacks.",
    expectedMoves: [{ by: "user", from: "f3", to: "a8", note: "Correct. A forcing queen check starts the sequence." }]
  },
  {
    id: "mate-net-sequence",
    level: "expert",
    type: "lesson",
    title: "Build a Mate Net",
    summary: "Play the forcing sequence to trap the king.",
    fen: "6k1/5ppp/8/8/8/5Q2/5PPP/4R1K1 w - - 0 1",
    orientation: "white",
    coachIntro: "When you attack, coordinate your pieces so every escape square disappears.",
    hints: ["Start with Re8+.", "Then use your queen if needed to finish the net."],
    completionText: "Excellent. You coordinated rook and queen to trap the king.",
    expectedMoves: [
      { by: "user", from: "e1", to: "e8", note: "Nice. Force the king to react." },
      { by: "coach", from: "g8", to: "h7", note: "The king tries to run." },
      { by: "user", from: "f3", to: "h3", note: "Perfect. Qh3 seals the mating net." }
    ]
  },
  {
    id: "opening-trainer",
    level: "beginner",
    type: "trainer",
    title: "Opening Trainer",
    summary: "Play healthy opening moves: center, development, king safety.",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    orientation: "white",
    coachIntro: "Openings are about center control, development, and king safety.",
    hints: ["Start with e4 or d4.", "Then develop a knight or bishop."],
    completionText: "Good opening principles.",
    expectedMoves: [
      { by: "user", from: "e2", to: "e4", note: "Nice. Central pawn first." },
      { by: "coach", from: "e7", to: "e5", note: "Black answers symmetrically." },
      { by: "user", from: "g1", to: "f3", note: "Good. Develop a knight." },
      { by: "coach", from: "b8", to: "c6", note: "Black develops too." },
      { by: "user", from: "f1", to: "c4", note: "Excellent. This is fast development." }
    ]
  },
  {
    id: "endgame-trainer",
    level: "advanced",
    type: "trainer",
    title: "Basic King and Pawn Endgame",
    summary: "Use your king actively and escort the pawn forward.",
    fen: "8/8/8/3k4/8/4K3/4P3/8 w - - 0 1",
    orientation: "white",
    coachIntro: "In endgames, the king becomes a fighting piece.",
    hints: ["Centralize the king.", "Move Kf4 first."],
    completionText: "Good endgame technique starts with king activity.",
    expectedMoves: [
      { by: "user", from: "e3", to: "f4", note: "Good. Bring the king forward." },
      { by: "coach", from: "d5", to: "e6", note: "Black steps closer." },
      { by: "user", from: "e2", to: "e4", note: "Nice. Advance the pawn with support." }
    ]
  },
  {
    id: "daily-challenge",
    level: "expert",
    type: "challenge",
    title: "Daily Challenge",
    summary: "Find the tactical winning move.",
    fen: "4k3/8/8/3q4/8/4N3/8/4K2Q w - - 0 1",
    orientation: "white",
    coachIntro: "Today's challenge: calculate forcing tactical ideas before moving.",
    hints: ["Use the knight and queen activity.", "Nd5 is the key move."],
    completionText: "Nice solve. Daily training sharpens tactical speed.",
    expectedMoves: [{ by: "user", from: "e3", to: "d5", note: "Correct. Nd5 hits key squares and wins tactically." }]
  }
];

/* =========================
   GENERAL HELPERS
========================= */
function safeSetStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setCurrentSection(section) {
  currentSection = section;
  document.getElementById("playTabBtn").classList.toggle("active", section === "play");
  document.getElementById("academyTabBtn").classList.toggle("active", section === "academy");
  playPanel.classList.toggle("active-panel", section === "play");
  academyPanel.classList.toggle("active-panel", section === "academy");
  updateVisibleControls();
  updateSectionLabel();
  updateStatus();
}

function setCurrentGame(gameName) {
  currentGame = gameName;
  document.getElementById("chessGameBtn").classList.toggle("active-game", gameName === "chess");
  document.getElementById("checkersGameBtn").classList.toggle("active-game", gameName === "checkers");

  document.getElementById("chessBoardWrap").classList.toggle("hidden", gameName !== "chess");
  document.getElementById("checkersBoardWrap").classList.toggle("hidden", gameName !== "checkers");

  updateVisibleControls();
  updateSectionLabel();
  updateStatus();
  renderMoveHistory();

  if (gameName === "checkers") {
    renderCheckersBoard();
  } else {
    clearSquareHighlights();
    if (board && window.dispatchEvent) {
      setTimeout(() => {
        try { board.resize(); } catch (e) {}
      }, 50);
    }
  }
}

function updateVisibleControls() {
  document.getElementById("chessPlayControls").classList.toggle("hidden", !(currentGame === "chess" && currentSection === "play"));
  document.getElementById("checkersPlayControls").classList.toggle("hidden", !(currentGame === "checkers" && currentSection === "play"));
  document.getElementById("chessAcademyControls").classList.toggle("hidden", !(currentGame === "chess" && currentSection === "academy"));
  document.getElementById("checkersAcademyControls").classList.toggle("hidden", !(currentGame === "checkers" && currentSection === "academy"));
}

function updateSectionLabel() {
  const gameName = currentGame === "chess" ? "Chess" : "Checkers";
  const sectionName = currentSection === "play" ? "Play Mode" : "Academy Mode";
  currentSectionLabel.textContent = `${gameName} • ${sectionName}`;
}

/* =========================
   CHESS PROGRESS
========================= */
function saveProgress() {
  localStorage.setItem("youooo_chess_academy_progress", JSON.stringify(lessonCompleted));
  localStorage.setItem("youooo_chess_academy_stars", JSON.stringify(lessonStars));
  localStorage.setItem("youooo_ai_difficulty", aiDifficulty);
  localStorage.setItem("youooo_checkers_ai_difficulty", checkersDifficulty);
}

function loadProgress() {
  try {
    lessonCompleted = JSON.parse(localStorage.getItem("youooo_chess_academy_progress")) || {};
  } catch (e) {
    lessonCompleted = {};
  }

  try {
    lessonStars = JSON.parse(localStorage.getItem("youooo_chess_academy_stars")) || {};
  } catch (e) {
    lessonStars = {};
  }

  aiDifficulty = localStorage.getItem("youooo_ai_difficulty") || "easy";
  checkersDifficulty = localStorage.getItem("youooo_checkers_ai_difficulty") || "easy";
}

function getLessonById(id) {
  return lessons.find((lesson) => lesson.id === id);
}

function getLessonsByLevel(level) {
  return lessons.filter((lesson) => lesson.level === level);
}

/* =========================
   CHESS HISTORY / STATUS
========================= */
function renderMoveHistory() {
  if (!moveHistoryEl) return;
  moveHistoryEl.innerHTML = "";

  if (currentGame === "chess") {
    if (!game) return;
    const history = game.history();
    history.forEach((move, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${move}`;
      moveHistoryEl.appendChild(li);
    });
    return;
  }

  const history = checkersBoardState._history || [];
  history.forEach((move, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${move}`;
    moveHistoryEl.appendChild(li);
  });
}

function updateAIInfo() {
  const map = {
    easy: "Easy uses weak move selection and shallow logic.",
    medium: "Medium uses board evaluation with shallow search.",
    hard: "Hard searches deeper and avoids many basic blunders.",
    expert: "Expert is the strongest browser-only version in this site."
  };
  if (aiInfoEl) aiInfoEl.textContent = map[aiDifficulty];
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.toggle("active-difficulty", btn.dataset.difficulty === aiDifficulty);
  });
}

function updateCheckersAIInfo() {
  const map = {
    easy: "Easy picks weaker moves often.",
    medium: "Medium prefers captures and promotion chances.",
    hard: "Hard values stronger captures and kings more.",
    expert: "Expert uses a stronger board evaluation in V1."
  };
  if (checkersAiInfoEl) checkersAiInfoEl.textContent = map[checkersDifficulty];
  document.querySelectorAll(".checkers-difficulty-btn").forEach((btn) => {
    btn.classList.toggle("active-difficulty", btn.dataset.difficulty === checkersDifficulty);
  });
}

function updateStatus() {
  if (currentGame === "checkers") {
    updateCheckersStatus();
    return;
  }

  if (!game) return;
  let text = "";

  if (game.in_checkmate()) {
    text = `Checkmate. ${game.turn() === "w" ? "Black" : "White"} wins.`;
  } else if (game.in_draw()) {
    text = "Draw.";
  } else {
    text = `${game.turn() === "w" ? "White" : "Black"} to move`;
    if (game.in_check()) text += " — Check!";
  }

  if (currentSection === "play") {
    if (playMode === "ai") text += ` | Play vs AI (${capitalize(aiDifficulty)})`;
    if (playMode === "local") text += " | 2 Players";
    if (playMode === "online") {
      text += ` | Online | You are ${playerColor}`;
      text += isMyTurn ? " | Your turn" : " | Opponent turn";
    }
  } else {
    const lesson = getLessonById(currentLessonId);
    if (lesson) text += ` | Academy | ${lesson.title}`;
  }

  safeSetStatus(text);
}

function updateCheckersStatus() {
  const side = checkersCurrentPlayer === "red" ? "Red" : "Black";
  let text = `${side} to move`;

  if (currentSection === "play") {
    if (checkersMode === "ai") text += ` | Play vs AI (${capitalize(checkersDifficulty)})`;
    else text += " | 2 Players";
  } else {
    text += " | Checkers Academy coming in V2";
  }

  const redCount = countCheckersPieces("red");
  const blackCount = countCheckersPieces("black");

  if (redCount === 0) text = "Black wins.";
  if (blackCount === 0) text = "Red wins.";

  safeSetStatus(text);
}

/* =========================
   CHESS VISUAL HELPERS
========================= */
function clearSquareHighlights() {
  if (typeof $ === "undefined") return;
  $("#board .square-55d63").removeClass("square-hint square-target");
}

function highlightSquares(from, to) {
  clearSquareHighlights();
  if (from) $(`#board .square-${from}`).addClass("square-hint");
  if (to) $(`#board .square-${to}`).addClass("square-target");
}

function applyBoardPosition() {
  if (board && game) board.position(game.fen(), true);
}

function setCoachMessage(text) {
  if (coachBoxEl) coachBoxEl.textContent = text;
}

/* =========================
   CHESS ONLINE
========================= */
function leaveOnlineRoom() {
  if (socket && roomId) socket.emit("leave-room", { roomId });
  roomId = null;
  playerColor = "white";
  isMyTurn = true;
  if (roomCodeEl) roomCodeEl.textContent = "None";
}

function resetGameLocal() {
  if (!game) game = new Chess();
  game.reset();

  if (board) {
    board.orientation("white");
    board.position("start", true);
  }

  isMyTurn = true;
  renderMoveHistory();
  clearSquareHighlights();
  updateStatus();
}

function startAI() {
  if (currentGame === "checkers") {
    startCheckersAI();
    return;
  }
  leaveOnlineRoom();
  playMode = "ai";
  setCurrentSection("play");
  setCurrentGame("chess");
  resetGameLocal();
}

function startLocal() {
  if (currentGame === "checkers") {
    startCheckersLocal();
    return;
  }
  leaveOnlineRoom();
  playMode = "local";
  setCurrentSection("play");
  setCurrentGame("chess");
  resetGameLocal();
}

function flipBoard() {
  if (currentGame === "chess") {
    if (board) board.flip();
  } else {
    checkersBoardState._flipped = !checkersBoardState._flipped;
    renderCheckersBoard();
  }
}

function randomRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function connectSocket() {
  if (socket) return;

  socket = io(SERVER_URL, {
    transports: ["websocket", "polling"]
  });

  socket.on("connect", () => {
    if (serverStateEl) serverStateEl.textContent = "Connected";
  });

  socket.on("disconnect", () => {
    if (serverStateEl) serverStateEl.textContent = "Disconnected";
  });

  socket.on("room-created", (data) => {
    setCurrentSection("play");
    setCurrentGame("chess");
    playMode = "online";
    roomId = data.roomId;
    playerColor = data.color;
    isMyTurn = data.color === "white";

    if (roomCodeEl) roomCodeEl.textContent = roomId;
    if (!game) game = new Chess();
    game.reset();

    if (board) {
      board.orientation("white");
      board.position("start", true);
    }

    clearSquareHighlights();
    renderMoveHistory();
    updateStatus();
  });

  socket.on("room-joined", (data) => {
    setCurrentSection("play");
    setCurrentGame("chess");
    playMode = "online";
    roomId = data.roomId;
    playerColor = data.color;

    if (roomCodeEl) roomCodeEl.textContent = roomId;
    if (!game) game = new Chess();
    game.reset();

    if (data.fen) game.load(data.fen);

    if (board) {
      board.orientation(playerColor === "black" ? "black" : "white");
      applyBoardPosition();
    }

    isMyTurn = playerColor === "white" ? game.turn() === "w" : game.turn() === "b";
    clearSquareHighlights();
    renderMoveHistory();
    updateStatus();
  });

  socket.on("opponent-joined", () => {
    setCoachMessage("Your online opponent joined the room.");
    updateStatus();
  });

  socket.on("move-played", (data) => {
    if (!game) game = new Chess();
    if (data.fen && data.fen !== game.fen()) {
      game.load(data.fen);
      applyBoardPosition();
      isMyTurn = true;
      clearSquareHighlights();
      renderMoveHistory();
      updateStatus();
    }
  });

  socket.on("room-reset", (data) => {
    if (!game) game = new Chess();
    if (data.fen) game.load(data.fen);
    else game.reset();

    applyBoardPosition();
    isMyTurn = playerColor === "white";
    clearSquareHighlights();
    renderMoveHistory();
    updateStatus();
  });

  socket.on("error-message", (message) => alert(message));
  socket.on("opponent-left", () => safeSetStatus("Opponent left the room."));
}

function createRoom() {
  if (currentGame !== "chess") {
    alert("Checkers online mode will come in V2.");
    return;
  }
  setCurrentSection("play");
  setCurrentGame("chess");
  connectSocket();
  const newRoomId = randomRoomCode();
  socket.emit("create-room", { roomId: newRoomId });
}

function joinRoom() {
  if (currentGame !== "chess") {
    alert("Checkers online mode will come in V2.");
    return;
  }
  setCurrentSection("play");
  setCurrentGame("chess");
  connectSocket();

  const enteredRoom = roomInput.value.trim().toUpperCase();
  if (!enteredRoom) {
    alert("Enter a room code first.");
    return;
  }

  socket.emit("join-room", { roomId: enteredRoom });
}

function resetOnlineGame() {
  if (!socket || !roomId) return;
  socket.emit("reset-room", { roomId });
}

/* =========================
   CHESS AI
========================= */
function evaluateBoard(chess) {
  const boardState = chess.board();
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (!piece) continue;
      const value = pieceValues[piece.type] || 0;
      score += piece.color === "w" ? value : -value;
    }
  }

  if (chess.in_checkmate()) return chess.turn() === "w" ? -999999 : 999999;
  if (chess.in_draw()) return 0;

  return score;
}

function minimax(chess, depth, alpha, beta, maximizingPlayer) {
  if (depth === 0 || chess.game_over()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves();

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(chess, difficulty) {
  const moves = chess.moves();
  if (!moves.length) return null;

  if (difficulty === "easy") {
    const weakPool = moves;
    return weakPool[Math.floor(Math.random() * weakPool.length)];
  }

  const depthMap = { medium: 1, hard: 2, expert: 3 };
  const depth = depthMap[difficulty] || 1;
  const maximizing = chess.turn() === "w";
  let bestMove = null;
  let bestValue = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    chess.move(move);
    const boardValue = minimax(chess, depth, -Infinity, Infinity, !maximizing);
    chess.undo();

    if (maximizing) {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  }

  return bestMove || moves[Math.floor(Math.random() * moves.length)];
}

function makeAIMove() {
  if (!game || !board) return;
  const bestMove = getBestMove(game, aiDifficulty);
  if (!bestMove) return;

  game.move(bestMove);
  applyBoardPosition();
  renderMoveHistory();
  updateStatus();
}

/* =========================
   CHESS ACADEMY
========================= */
function getCurrentLesson() {
  return getLessonById(currentLessonId);
}

function calculateStars() {
  return lessonHintUsed ? 2 : 3;
}

function markLessonComplete(lessonId) {
  lessonCompleted[lessonId] = true;
  const stars = calculateStars();
  lessonStars[lessonId] = Math.max(lessonStars[lessonId] || 0, stars);
  saveProgress();
  renderLessonList();
  renderProgress();
  updateLessonStars();
}

function updateLessonStars() {
  const stars = lessonStars[currentLessonId] || 0;
  if (lessonStarsTagEl) lessonStarsTagEl.textContent = `Stars: ${stars}`;
}

function renderProgress() {
  const total = lessons.length;
  const done = lessons.filter((l) => lessonCompleted[l.id]).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  academyProgressBadgeEl.textContent = `${percent}% Complete`;

  const levels = ["beginner", "intermediate", "advanced", "expert"];
  progressStatsEl.innerHTML = "";

  levels.forEach((level) => {
    const levelLessons = lessons.filter((l) => l.level === level);
    const levelDone = levelLessons.filter((l) => lessonCompleted[l.id]).length;
    const row = document.createElement("div");
    row.className = "progress-row";
    row.innerHTML = `<span>${capitalize(level)}</span><span>${levelDone}/${levelLessons.length} complete</span>`;
    progressStatsEl.appendChild(row);
  });

  const totalStars = Object.values(lessonStars).reduce((a, b) => a + b, 0);
  const totalRow = document.createElement("div");
  totalRow.className = "progress-row";
  totalRow.innerHTML = `<strong>Total</strong><strong>${done}/${total} lessons • ${totalStars} stars</strong>`;
  progressStatsEl.appendChild(totalRow);
}

function renderLessonList() {
  const levelLessons = getLessonsByLevel(currentLevel);
  lessonListEl.innerHTML = "";

  levelLessons.forEach((lesson, index) => {
    const stars = lessonStars[lesson.id] || 0;
    const item = document.createElement("div");
    item.className = "lesson-item";
    if (lesson.id === currentLessonId) item.classList.add("active-lesson");
    if (lessonCompleted[lesson.id]) item.classList.add("done");

    item.innerHTML = `
      <div class="lesson-item-title">${index + 1}. ${lesson.title}</div>
      <div class="lesson-item-meta">${capitalize(lesson.type)} • ${lessonCompleted[lesson.id] ? "Completed" : "Not completed"} • ⭐ ${stars}</div>
    `;

    item.addEventListener("click", () => loadLesson(lesson.id));
    lessonListEl.appendChild(item);
  });
}

function loadLesson(id) {
  const lesson = getLessonById(id);
  if (!lesson) return;

  leaveOnlineRoom();
  setCurrentSection("academy");
  setCurrentGame("chess");
  playMode = "local";
  currentLessonId = lesson.id;
  currentLessonStepIndex = 0;
  academyLocked = false;
  lessonHintUsed = false;

  if (!game) game = new Chess(lesson.fen);
  game.load(lesson.fen);

  if (board) {
    board.orientation(lesson.orientation || "white");
    applyBoardPosition();
  }

  lessonTitleEl.textContent = lesson.title;
  lessonSummaryEl.textContent = lesson.summary;
  lessonLevelTagEl.textContent = capitalize(lesson.level);
  lessonTypeTagEl.textContent = capitalize(lesson.type);
  setCoachMessage(lesson.coachIntro);

  clearSquareHighlights();
  renderMoveHistory();
  renderLessonList();
  renderProgress();
  updateLessonStars();
  updateStatus();

  const nextStep = lesson.expectedMoves[currentLessonStepIndex];
  if (nextStep && nextStep.by === "coach") {
    setTimeout(runCoachSteps, 500);
  }
}

function retryCurrentLesson() {
  if (!currentLessonId) return;
  loadLesson(currentLessonId);
}

function runCoachSteps() {
  const lesson = getCurrentLesson();
  if (!lesson || academyLocked) return;

  while (lesson.expectedMoves[currentLessonStepIndex] && lesson.expectedMoves[currentLessonStepIndex].by === "coach") {
    const step = lesson.expectedMoves[currentLessonStepIndex];
    const move = game.move({
      from: step.from,
      to: step.to,
      promotion: step.promotion || "q"
    });

    if (!move) {
      setCoachMessage("There was a lesson script problem. Retry the lesson.");
      return;
    }

    currentLessonStepIndex++;
    applyBoardPosition();
    renderMoveHistory();
    if (step.note) setCoachMessage(step.note);
  }

  updateStatus();

  if (currentLessonStepIndex >= lesson.expectedMoves.length) {
    finishLesson(lesson);
  }
}

function finishLesson(lesson) {
  academyLocked = true;
  markLessonComplete(lesson.id);
  const stars = lessonStars[lesson.id] || 0;
  setCoachMessage(`${lesson.completionText || "Lesson complete."} You earned ${stars} star${stars === 1 ? "" : "s"}.`);
  safeSetStatus(`Lesson complete: ${lesson.title}`);
}

function handleAcademyMove(source, target) {
  const lesson = getCurrentLesson();
  if (!lesson || academyLocked) return "snapback";

  const step = lesson.expectedMoves[currentLessonStepIndex];
  if (!step) return "snapback";

  if (step.by !== "user") {
    setCoachMessage("Wait for the coach move first.");
    return "snapback";
  }

  const attemptedMove = game.move({
    from: source,
    to: target,
    promotion: "q"
  });

  if (attemptedMove === null) return "snapback";

  const correct = source === step.from && target === step.to;
  if (!correct) {
    game.undo();
    setCoachMessage("Not the teaching move for this lesson. Use Hint if you want help.");
    highlightSquares(step.from, step.to);
    return "snapback";
  }

  currentLessonStepIndex++;
  applyBoardPosition();
  renderMoveHistory();
  clearSquareHighlights();
  if (step.note) setCoachMessage(step.note);
  updateStatus();

  if (currentLessonStepIndex >= lesson.expectedMoves.length) {
    finishLesson(lesson);
    return;
  }

  setTimeout(runCoachSteps, 500);
}

function showHint() {
  const lesson = getCurrentLesson();
  if (!lesson) {
    setCoachMessage("Choose a lesson first.");
    return;
  }

  const step = lesson.expectedMoves[currentLessonStepIndex];
  if (!step) {
    setCoachMessage("This lesson is already finished.");
    return;
  }

  lessonHintUsed = true;

  if (step.by === "user") {
    highlightSquares(step.from, step.to);
    setCoachMessage(lesson.hints?.[0] || `Try ${step.from} to ${step.to}.`);
  } else {
    setCoachMessage("The next move belongs to the coach line. Watch what happens.");
  }
}

function goToAdjacentLesson(direction) {
  const levelLessons = getLessonsByLevel(currentLevel);
  if (!levelLessons.length) return;

  let index = levelLessons.findIndex((l) => l.id === currentLessonId);
  if (index === -1) index = 0;
  index += direction;
  if (index < 0) index = 0;
  if (index >= levelLessons.length) index = levelLessons.length - 1;

  loadLesson(levelLessons[index].id);
}

function setLevel(level) {
  currentLevel = level;
  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.classList.toggle("active-level", btn.dataset.level === level);
  });

  const levelLessons = getLessonsByLevel(level);
  const fallbackLesson = levelLessons[0]?.id || null;

  if (!currentLessonId || !levelLessons.some((l) => l.id === currentLessonId)) {
    currentLessonId = fallbackLesson;
  }

  renderLessonList();
  if (currentLessonId) loadLesson(currentLessonId);
}

function loadSpecialLesson(id) {
  currentLevel = getLessonById(id).level;
  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.classList.toggle("active-level", btn.dataset.level === currentLevel);
  });
  loadLesson(id);
}

/* =========================
   CHESS DRAG
========================= */
function onDragStart(source, piece) {
  if (currentGame !== "chess") return false;
  if (!game) return false;
  if (game.game_over()) return false;

  if (
    (game.turn() === "w" && piece.startsWith("b")) ||
    (game.turn() === "b" && piece.startsWith("w"))
  ) {
    return false;
  }

  if (currentSection === "play" && playMode === "online") {
    if (!isMyTurn) return false;
    const turnColor = game.turn() === "w" ? "white" : "black";
    if (turnColor !== playerColor) return false;
  }

  if (currentSection === "academy") {
    const lesson = getCurrentLesson();
    if (!lesson || academyLocked) return false;
    const step = lesson.expectedMoves[currentLessonStepIndex];
    if (!step || step.by !== "user") return false;
  }

  return true;
}

function onDrop(source, target) {
  if (currentGame !== "chess") return "snapback";
  if (!game) return "snapback";

  if (currentSection === "academy") {
    return handleAcademyMove(source, target);
  }

  const move = game.move({
    from: source,
    to: target,
    promotion: "q"
  });

  if (move === null) return "snapback";

  applyBoardPosition();
  clearSquareHighlights();
  renderMoveHistory();
  updateStatus();

  if (playMode === "ai" && !game.game_over()) {
    setTimeout(makeAIMove, 250);
  }

  if (playMode === "online" && socket && roomId) {
    isMyTurn = false;
    socket.emit("move", {
      roomId,
      move: {
        from: source,
        to: target,
        promotion: "q"
      }
    });
    updateStatus();
  }
}

function onSnapEnd() {
  applyBoardPosition();
}

/* =========================
   CHECKERS LOGIC
========================= */
function createInitialCheckersBoard() {
  const arr = Array.from({ length: 8 }, () => Array(8).fill(null));

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) arr[r][c] = { color: "black", king: false };
    }
  }

  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) arr[r][c] = { color: "red", king: false };
    }
  }

  arr._history = [];
  arr._flipped = false;
  return arr;
}

function initCheckersGame() {
  checkersBoardState = createInitialCheckersBoard();
  checkersCurrentPlayer = "red";
  selectedChecker = null;
  validMoves = [];
  renderCheckersBoard();
  renderMoveHistory();
  updateCheckersStatus();
}

function startCheckersLocal() {
  setCurrentGame("checkers");
  setCurrentSection("play");
  checkersMode = "local";
  initCheckersGame();
}

function startCheckersAI() {
  setCurrentGame("checkers");
  setCurrentSection("play");
  checkersMode = "ai";
  initCheckersGame();
}

function insideBoard(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getCheckersDirections(piece) {
  if (piece.king) return [[1, -1], [1, 1], [-1, -1], [-1, 1]];
  return piece.color === "red" ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
}

function getCheckersMovesForPiece(r, c) {
  const piece = checkersBoardState[r][c];
  if (!piece) return [];

  const dirs = getCheckersDirections(piece);
  const moves = [];

  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    const jr = r + dr * 2;
    const jc = c + dc * 2;

    if (insideBoard(nr, nc) && !checkersBoardState[nr][nc]) {
      moves.push({ from: [r, c], to: [nr, nc], capture: null });
    } else if (
      insideBoard(jr, jc) &&
      checkersBoardState[nr]?.[nc] &&
      checkersBoardState[nr][nc].color !== piece.color &&
      !checkersBoardState[jr][jc]
    ) {
      moves.push({ from: [r, c], to: [jr, jc], capture: [nr, nc] });
    }
  }

  return moves;
}

function getAllCheckersMoves(color) {
  const all = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = checkersBoardState[r][c];
      if (piece && piece.color === color) {
        all.push(...getCheckersMovesForPiece(r, c));
      }
    }
  }
  return all;
}

function countCheckersPieces(color) {
  let count = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (checkersBoardState[r][c]?.color === color) count++;
    }
  }
  return count;
}

function maybePromoteChecker(r, c) {
  const piece = checkersBoardState[r][c];
  if (!piece || piece.king) return;

  if (piece.color === "red" && r === 0) piece.king = true;
  if (piece.color === "black" && r === 7) piece.king = true;
}

function coordToLabel(r, c) {
  const file = "abcdefgh"[c];
  const rank = 8 - r;
  return `${file}${rank}`;
}

function applyCheckersMove(move) {
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = checkersBoardState[fr][fc];
  checkersBoardState[fr][fc] = null;
  checkersBoardState[tr][tc] = piece;

  if (move.capture) {
    const [cr, cc] = move.capture;
    checkersBoardState[cr][cc] = null;
  }

  maybePromoteChecker(tr, tc);

  const pieceName = piece.king ? "K" : "M";
  const notation = `${piece.color} ${pieceName}: ${coordToLabel(fr, fc)} → ${coordToLabel(tr, tc)}${move.capture ? " x" : ""}`;
  checkersBoardState._history.push(notation);

  checkersCurrentPlayer = checkersCurrentPlayer === "red" ? "black" : "red";
  selectedChecker = null;
  validMoves = [];

  renderCheckersBoard();
  renderMoveHistory();
  updateCheckersStatus();

  if (checkersMode === "ai" && checkersCurrentPlayer === "black") {
    scheduleCheckersAi();
  }
}

function evaluateCheckersBoard(colorPerspective = "black") {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = checkersBoardState[r][c];
      if (!piece) continue;
      let value = piece.king ? 175 : 100;

      if (!piece.king) {
        value += piece.color === "black" ? r * 5 : (7 - r) * 5;
      }

      score += piece.color === colorPerspective ? value : -value;
    }
  }
  return score;
}

function chooseCheckersAiMove() {
  const moves = getAllCheckersMoves("black");
  if (!moves.length) return null;

  if (checkersDifficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    const snapshot = cloneCheckersBoard();
    simulateCheckersMove(move);
    let score = evaluateCheckersBoard("black");

    if (checkersDifficulty === "medium" && move.capture) score += 80;
    if (checkersDifficulty === "hard" && move.capture) score += 120;
    if (checkersDifficulty === "expert" && move.capture) score += 160;

    if (move.to[0] === 7) score += 60;

    restoreCheckersBoard(snapshot);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove || moves[Math.floor(Math.random() * moves.length)];
}

function cloneCheckersBoard() {
  const clone = checkersBoardState.map((row) =>
    row.map((cell) => (cell ? { color: cell.color, king: cell.king } : null))
  );
  clone._history = [...(checkersBoardState._history || [])];
  clone._flipped = !!checkersBoardState._flipped;
  clone._player = checkersCurrentPlayer;
  return clone;
}

function restoreCheckersBoard(snapshot) {
  checkersBoardState = snapshot.map((row) =>
    row.map((cell) => (cell ? { color: cell.color, king: cell.king } : null))
  );
  checkersBoardState._history = [...(snapshot._history || [])];
  checkersBoardState._flipped = !!snapshot._flipped;
  checkersCurrentPlayer = snapshot._player || "red";
}

function simulateCheckersMove(move) {
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = checkersBoardState[fr][fc];
  checkersBoardState[fr][fc] = null;
  checkersBoardState[tr][tc] = piece;
  if (move.capture) {
    const [cr, cc] = move.capture;
    checkersBoardState[cr][cc] = null;
  }
  maybePromoteChecker(tr, tc);
  checkersCurrentPlayer = checkersCurrentPlayer === "red" ? "black" : "red";
}

function scheduleCheckersAi() {
  if (pendingCheckerAi) clearTimeout(pendingCheckerAi);
  pendingCheckerAi = setTimeout(() => {
    const move = chooseCheckersAiMove();
    if (move) applyCheckersMove(move);
  }, 350);
}

function handleCheckersSquareClick(r, c) {
  if (currentGame !== "checkers" || currentSection !== "play") return;
  if (checkersMode === "ai" && checkersCurrentPlayer !== "red") return;

  const piece = checkersBoardState[r][c];

  if (selectedChecker) {
    const chosenMove = validMoves.find((m) => m.to[0] === r && m.to[1] === c);
    if (chosenMove) {
      applyCheckersMove(chosenMove);
      return;
    }
  }

  if (piece && piece.color === checkersCurrentPlayer) {
    selectedChecker = [r, c];
    validMoves = getCheckersMovesForPiece(r, c);
    renderCheckersBoard();
    return;
  }

  selectedChecker = null;
  validMoves = [];
  renderCheckersBoard();
}

function renderCheckersBoard() {
  const boardEl = document.getElementById("checkersBoard");
  if (!boardEl) return;

  boardEl.innerHTML = "";

  const flipped = !!checkersBoardState._flipped;
  const rows = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
  const cols = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

  for (const r of rows) {
    for (const c of cols) {
      const square = document.createElement("div");
      square.className = `checkers-square ${((r + c) % 2 === 0) ? "light" : "dark"}`;

      if (selectedChecker && selectedChecker[0] === r && selectedChecker[1] === c) {
        square.classList.add("selected");
      }

      if (validMoves.some((m) => m.to[0] === r && m.to[1] === c)) {
        square.classList.add("valid");
      }

      square.addEventListener("click", () => handleCheckersSquareClick(r, c));

      const piece = checkersBoardState[r][c];
      if (piece) {
        const pieceEl = document.createElement("div");
        pieceEl.className = `checkers-piece ${piece.color} ${piece.king ? "king" : ""}`;
        square.appendChild(pieceEl);
      }

      boardEl.appendChild(square);
    }
  }
}

/* =========================
   CHESS BOARD INIT
========================= */
function initBoard() {
  const boardElement = document.getElementById("board");
  if (!boardElement) {
    safeSetStatus("Error: board element not found");
    return;
  }

  if (typeof $ === "undefined") {
    safeSetStatus("Error: jQuery did not load");
    return;
  }

  if (typeof Chess === "undefined") {
    safeSetStatus("Error: chess.js did not load");
    return;
  }

  if (typeof Chessboard === "undefined") {
    safeSetStatus("Error: chessboard.js did not load");
    return;
  }

  game = new Chess();

  board = Chessboard("board", {
    draggable: true,
    position: "start",
    pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
    onDragStart,
    onDrop,
    onSnapEnd
  });

  renderMoveHistory();
  updateStatus();
}

/* =========================
   EVENTS
========================= */
function bindEvents() {
  document.getElementById("playTabBtn")?.addEventListener("click", () => {
    setCurrentSection("play");
    updateStatus();
  });

  document.getElementById("academyTabBtn")?.addEventListener("click", () => {
    setCurrentSection("academy");
    if (currentGame === "chess") {
      if (!currentLessonId) {
        const first = getLessonsByLevel(currentLevel)[0];
        if (first) loadLesson(first.id);
      } else {
        loadLesson(currentLessonId);
      }
    }
  });

  document.getElementById("chessGameBtn")?.addEventListener("click", () => {
    setCurrentGame("chess");
    updateStatus();
  });

  document.getElementById("checkersGameBtn")?.addEventListener("click", () => {
    setCurrentGame("checkers");
    updateStatus();
  });

  document.getElementById("aiBtn")?.addEventListener("click", startAI);
  document.getElementById("localBtn")?.addEventListener("click", startLocal);
  document.getElementById("createRoomBtn")?.addEventListener("click", createRoom);
  document.getElementById("joinRoomBtn")?.addEventListener("click", joinRoom);

  document.getElementById("checkersAiBtn")?.addEventListener("click", startCheckersAI);
  document.getElementById("checkersLocalBtn")?.addEventListener("click", startCheckersLocal);

  document.getElementById("flipBtn")?.addEventListener("click", flipBoard);

  document.getElementById("resetBtn")?.addEventListener("click", () => {
    if (currentGame === "checkers") {
      initCheckersGame();
      return;
    }

    if (currentSection === "academy") retryCurrentLesson();
    else if (playMode === "online") resetOnlineGame();
    else resetGameLocal();
  });

  document.getElementById("hintBtn")?.addEventListener("click", showHint);
  document.getElementById("retryLessonBtn")?.addEventListener("click", retryCurrentLesson);
  document.getElementById("prevLessonBtn")?.addEventListener("click", () => goToAdjacentLesson(-1));
  document.getElementById("nextLessonBtn")?.addEventListener("click", () => goToAdjacentLesson(1));

  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLevel(btn.dataset.level));
  });

  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      aiDifficulty = btn.dataset.difficulty;
      updateAIInfo();
      saveProgress();
      updateStatus();
    });
  });

  document.querySelectorAll(".checkers-difficulty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      checkersDifficulty = btn.dataset.difficulty;
      updateCheckersAIInfo();
      saveProgress();
      updateStatus();
    });
  });

  document.getElementById("openingTrainerBtn")?.addEventListener("click", () => loadSpecialLesson("opening-trainer"));
  document.getElementById("endgameTrainerBtn")?.addEventListener("click", () => loadSpecialLesson("endgame-trainer"));
  document.getElementById("dailyChallengeBtn")?.addEventListener("click", () => loadSpecialLesson("daily-challenge"));
  document.getElementById("reviewModeBtn")?.addEventListener("click", () => {
    const lesson = getCurrentLesson();
    if (!lesson) {
      setCoachMessage("Open a lesson first.");
      return;
    }
    const step = lesson.expectedMoves[currentLessonStepIndex];
    if (!step) {
      setCoachMessage("This lesson is already completed.");
      return;
    }
    setCoachMessage(`Review: the next correct move is ${step.from} to ${step.to}.`);
    highlightSquares(step.from, step.to);
  });
}

/* =========================
   STARTUP
========================= */
window.addEventListener("error", (e) => {
  safeSetStatus(`JS Error: ${e.message}`);
});

document.addEventListener("DOMContentLoaded", () => {
  statusEl = document.getElementById("status");
  roomInput = document.getElementById("roomInput");
  roomCodeEl = document.getElementById("roomCode");
  moveHistoryEl = document.getElementById("moveHistory");
  serverStateEl = document.getElementById("serverState");

  playPanel = document.getElementById("playPanel");
  academyPanel = document.getElementById("academyPanel");
  currentSectionLabel = document.getElementById("currentSectionLabel");
  lessonListEl = document.getElementById("lessonList");
  lessonTitleEl = document.getElementById("lessonTitle");
  lessonSummaryEl = document.getElementById("lessonSummary");
  coachBoxEl = document.getElementById("coachBox");
  lessonLevelTagEl = document.getElementById("lessonLevelTag");
  lessonTypeTagEl = document.getElementById("lessonTypeTag");
  lessonStarsTagEl = document.getElementById("lessonStarsTag");
  academyProgressBadgeEl = document.getElementById("academyProgressBadge");
  progressStatsEl = document.getElementById("progressStats");
  aiInfoEl = document.getElementById("aiInfo");
  checkersAiInfoEl = document.getElementById("checkersAiInfo");

  loadProgress();
  bindEvents();
  initBoard();
  connectSocket();
  initCheckersGame();

  renderProgress();
  updateAIInfo();
  updateCheckersAIInfo();
  setCurrentSection("play");
  setCurrentGame("chess");
  startLocal();
});
