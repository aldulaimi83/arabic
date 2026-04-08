/* ════════════════════════════════════════════════════════════
   YOUOOO GAMES — Chess · Checkers · Gems Crush · 2048
   ════════════════════════════════════════════════════════════ */
'use strict';

const db = firebase.database();

function getPlayerId() {
  let id = localStorage.getItem('youooo_pid');
  if (!id) { id = Math.random().toString(36).slice(2,10); localStorage.setItem('youooo_pid', id); }
  return id;
}
function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
}

// ── HUB NAVIGATION ───────────────────────────────────────────
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', () => showView(card.dataset.game));
});
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.target));
});

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'chess')    requestAnimationFrame(()=>requestAnimationFrame(initChessView));
  if (name === 'checkers') initCheckersView();
  if (name === 'gems')     initGemsView();
  if (name === 't2048')    initT2048View();
}

// ════════════════════════════════════════════════════════════
// ██████  CHESS
// ════════════════════════════════════════════════════════════
let chessGame = null, chessBoard = null;
let chessMode = 'ai', chessDiff = 'medium';
let chessOnlineColor = 'w', chessRoomCode = null, chessOnlineRef = null;
const CVALS = {p:100,n:320,b:330,r:500,q:900,k:20000};

function initChessView() {
  if (chessBoard) { chessBoard.destroy(); chessBoard = null; }
  chessGame = new Chess();
  chessBoard = Chessboard('chessboard', {
    draggable: true, position: 'start',
    pieceTheme: 'https://raw.githubusercontent.com/oakmac/chessboardjs/master/website/img/chesspieces/wikipedia/{piece}.png',
    onDragStart: chOnDragStart, onDrop: chOnDrop,
    onSnapEnd: () => chessBoard.position(chessGame.fen()),
  });
  chessBoard.resize();
  updateChessStatus(); clearChessMoveHistory();
  document.getElementById('chessDiffCard').style.display = '';
}

function chOnDragStart(src, piece) {
  if (chessGame.game_over()) return false;
  if (chessMode === 'ai' && chessGame.turn() === 'b') return false;
  if (chessMode === 'online' && piece[0] !== chessOnlineColor) return false;
  if (chessGame.turn() === 'w' && piece[0] === 'b') return false;
  if (chessGame.turn() === 'b' && piece[0] === 'w') return false;
  return true;
}

function chOnDrop(src, tgt) {
  const m = chessGame.move({from:src,to:tgt,promotion:'q'});
  if (!m) return 'snapback';
  addChessMove(m.san);
  updateChessStatus();
  if (chessMode === 'ai') setTimeout(makeChessAiMove, 350);
  if (chessMode === 'online' && chessRoomCode) syncChessMove();
}

function makeChessAiMove() {
  if (chessGame.game_over()) return;
  const depth = {easy:1,medium:2,hard:3,expert:4}[chessDiff] || 2;
  if (chessDiff === 'easy') {
    const moves = chessGame.moves();
    chessGame.move(moves[Math.floor(Math.random()*moves.length)]);
  } else { chBestMove(depth); }
  chessBoard.position(chessGame.fen());
  addChessMove(chessGame.history().slice(-1)[0]);
  updateChessStatus();
}

function chBestMove(depth) {
  const moves = chessGame.moves({verbose:true});
  let best = null, bestScore = -Infinity;
  for (const m of moves) {
    chessGame.move(m);
    const s = -chNegamax(depth-1, -Infinity, Infinity);
    chessGame.undo();
    if (s > bestScore) { bestScore = s; best = m; }
  }
  if (best) chessGame.move(best);
}

function chNegamax(depth, alpha, beta) {
  if (depth === 0 || chessGame.game_over()) return chEval();
  let score = -Infinity;
  for (const m of chessGame.moves({verbose:true})) {
    chessGame.move(m);
    score = Math.max(score, -chNegamax(depth-1, -beta, -alpha));
    chessGame.undo();
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }
  return score;
}

function chEval() {
  let s = 0;
  const turn = chessGame.turn();
  for (const row of chessGame.board()) {
    for (const p of row) {
      if (!p) continue;
      const v = CVALS[p.type] || 0;
      s += p.color === turn ? v : -v;
    }
  }
  if (chessGame.in_checkmate()) s -= 100000;
  if (chessGame.in_check()) s -= 50;
  return s;
}

function updateChessStatus() {
  const el = document.getElementById('chessStatus'); if (!el) return;
  if (chessGame.in_checkmate()) el.textContent = `Checkmate! ${chessGame.turn()==='w'?'Black':'White'} wins! 🏆`;
  else if (chessGame.in_draw()) el.textContent = 'Draw! 🤝';
  else if (chessGame.in_check()) el.textContent = `${chessGame.turn()==='w'?'White':'Black'} is in check! ⚠️`;
  else el.textContent = `${chessGame.turn()==='w'?'White ♙':'Black ♟'}'s turn`;
}

function addChessMove(san) {
  const el = document.getElementById('chessMoveHistory'); if (!el || !san) return;
  const li = document.createElement('li'); li.textContent = san;
  el.appendChild(li); el.scrollTop = el.scrollHeight;
}
function clearChessMoveHistory() {
  const el = document.getElementById('chessMoveHistory'); if (el) el.innerHTML = '';
}

document.querySelectorAll('[data-chess-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-chess-mode]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); chessMode = btn.dataset.chessMode;
    const diffCard = document.getElementById('chessDiffCard');
    if (chessMode==='ai') { diffCard.style.display=''; initChessView(); }
    else if (chessMode==='local') { diffCard.style.display='none'; initChessView(); }
    else if (chessMode==='create') { diffCard.style.display='none'; openRoomModal('create','chess'); }
    else if (chessMode==='join') { diffCard.style.display='none'; openRoomModal('join','chess'); }
  });
});

document.querySelectorAll('[data-chess-diff]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-chess-diff]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); chessDiff = btn.dataset.chessDiff;
  });
});

document.getElementById('chessResetBtn').addEventListener('click', initChessView);
document.getElementById('chessFlipBtn').addEventListener('click', () => { if (chessBoard) chessBoard.flip(); });

function syncChessMove() {
  db.ref(`rooms/chess/${chessRoomCode}`).update({ fen: chessGame.fen(), turn: chessGame.turn() });
}
function listenChessRoom(code, myColor) {
  chessOnlineColor = myColor === 'white' ? 'w' : 'b';
  chessRoomCode = code; chessMode = 'online';
  if (chessOnlineRef) chessOnlineRef.off();
  chessOnlineRef = db.ref(`rooms/chess/${code}`);
  chessOnlineRef.on('value', snap => {
    const d = snap.val(); if (!d) return;
    if (d.fen && d.fen !== chessGame.fen()) {
      chessGame.load(d.fen); chessBoard.position(chessGame.fen()); updateChessStatus();
    }
    if (d.status === 'playing') document.getElementById('chessOnlineBadge').classList.remove('hidden');
  });
}

// ════════════════════════════════════════════════════════════
// ██████  CHECKERS
// ════════════════════════════════════════════════════════════
let ck = {
  board:[], turn:'red', selected:null, validMoves:[],
  mode:'ai', diff:'medium', redCap:0, blackCap:0,
  onlineColor:null, roomCode:null, onlineRef:null
};

function initCheckersView() {
  ck.board = [];
  for (let r=0;r<8;r++) {
    ck.board[r] = [];
    for (let c=0;c<8;c++) {
      if ((r+c)%2!==0) {
        if (r<3) ck.board[r][c]={color:'black',king:false};
        else if (r>4) ck.board[r][c]={color:'red',king:false};
        else ck.board[r][c]=null;
      } else ck.board[r][c]=null;
    }
  }
  ck.turn='red'; ck.selected=null; ck.validMoves=[];
  ck.redCap=0; ck.blackCap=0;
  renderCheckers(); updateCkStatus();
  document.getElementById('ckRedCaptures').textContent='0';
  document.getElementById('ckBlackCaptures').textContent='0';
}

function renderCheckers() {
  const grid = document.getElementById('checkersGrid'); if (!grid) return;
  grid.innerHTML = '';
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const cell = document.createElement('div');
    const isDark = (r+c)%2!==0;
    cell.className = `ck-cell ${isDark?'dark':'light'}`;
    const isValidMove = ck.validMoves.some(m=>m.tr===r&&m.tc===c);
    const isJump = ck.validMoves.some(m=>m.tr===r&&m.tc===c&&m.jump);
    if (isValidMove) cell.classList.add(isJump?'valid-jump':'valid-move');
    const piece = ck.board[r][c];
    if (piece) {
      const p = document.createElement('div');
      p.className = `ck-piece ${piece.color}${piece.king?' king':''}`;
      if (ck.selected&&ck.selected.r===r&&ck.selected.c===c) p.classList.add('selected');
      cell.appendChild(p);
    }
    cell.addEventListener('click', ()=>onCkClick(r,c));
    grid.appendChild(cell);
  }
}

function onCkClick(r, c) {
  if (ck.mode==='online'&&ck.turn!==ck.onlineColor) return;
  const piece = ck.board[r][c];
  const isValidDest = ck.validMoves.some(m=>m.tr===r&&m.tc===c);
  if (isValidDest&&ck.selected) { applyCkMove(ck.validMoves.find(m=>m.tr===r&&m.tc===c)); return; }
  if (piece&&piece.color===ck.turn) {
    ck.selected={r,c}; ck.validMoves=getCkMoves(r,c,ck.board);
    const allJumps=getAllCkJumps(ck.turn,ck.board);
    if (allJumps.length>0) ck.validMoves=ck.validMoves.filter(m=>m.jump);
    renderCheckers(); return;
  }
  ck.selected=null; ck.validMoves=[]; renderCheckers();
}

function getCkMoves(r,c,board) {
  const piece=board[r][c]; if (!piece) return [];
  const dirs=piece.color==='red'?[[-1,-1],[-1,1]]:[[1,-1],[1,1]];
  if (piece.king) dirs.push(...(piece.color==='red'?[[1,-1],[1,1]]:[[-1,-1],[-1,1]]));
  const moves=[],jumps=[];
  for (const [dr,dc] of dirs) {
    const nr=r+dr,nc=c+dc;
    if (nr<0||nr>7||nc<0||nc>7) continue;
    if (!board[nr][nc]) moves.push({fr:r,fc:c,tr:nr,tc:nc,jump:false});
    else if (board[nr][nc].color!==piece.color) {
      const jr=nr+dr,jc=nc+dc;
      if (jr>=0&&jr<=7&&jc>=0&&jc<=7&&!board[jr][jc])
        jumps.push({fr:r,fc:c,tr:jr,tc:jc,cr:nr,cc:nc,jump:true});
    }
  }
  return jumps.length?jumps:moves;
}

function getAllCkMoves(color,board) {
  const all=[];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++)
    if (board[r][c]?.color===color) all.push(...getCkMoves(r,c,board));
  const jumps=all.filter(m=>m.jump);
  return jumps.length?jumps:all;
}

function getAllCkJumps(color,board) {
  const all=[];
  for (let r=0;r<8;r++) for (let c=0;c<8;c++)
    if (board[r][c]?.color===color) all.push(...getCkMoves(r,c,board).filter(x=>x.jump));
  return all;
}

function applyCkMove(move) {
  const b=deepCopyBoard(ck.board);
  const piece=b[move.fr][move.fc];
  b[move.tr][move.tc]=piece; b[move.fr][move.fc]=null;
  if (move.jump) {
    b[move.cr][move.cc]=null;
    if (piece.color==='red') { ck.redCap++; document.getElementById('ckRedCaptures').textContent=ck.redCap; }
    else { ck.blackCap++; document.getElementById('ckBlackCaptures').textContent=ck.blackCap; }
  }
  if (piece.color==='red'&&move.tr===0) piece.king=true;
  if (piece.color==='black'&&move.tr===7) piece.king=true;
  ck.board=b;
  if (move.jump) {
    const moreJumps=getCkMoves(move.tr,move.tc,ck.board).filter(m=>m.jump);
    if (moreJumps.length>0) {
      ck.selected={r:move.tr,c:move.tc}; ck.validMoves=moreJumps;
      renderCheckers(); updateCkStatus();
      if (ck.mode==='online'&&ck.onlineColor===ck.turn) syncCkBoard();
      return;
    }
  }
  ck.turn=ck.turn==='red'?'black':'red';
  ck.selected=null; ck.validMoves=[];
  if (ck.mode==='online'&&ck.onlineColor) syncCkBoard();
  renderCheckers(); updateCkStatus(); checkCkGameOver();
  if (!ckIsGameOver()&&ck.mode==='ai'&&ck.turn==='black') setTimeout(makeCkAiMove,500);
}

function deepCopyBoard(board) { return board.map(row=>row.map(cell=>cell?{...cell}:null)); }
function ckIsGameOver() { return getAllCkMoves('red',ck.board).length===0||getAllCkMoves('black',ck.board).length===0; }
function checkCkGameOver() {
  const el=document.getElementById('ckStatus'); if (!el) return;
  if (getAllCkMoves('red',ck.board).length===0) el.textContent='⚫ Black wins! 🏆';
  else if (getAllCkMoves('black',ck.board).length===0) el.textContent='🔴 Red wins! 🏆';
}
function updateCkStatus() {
  const el=document.getElementById('ckStatus'); if (!el) return;
  if (!ckIsGameOver()) el.textContent=`${ck.turn==='red'?'🔴 Red':'⚫ Black'}'s turn`;
}

function makeCkAiMove() {
  if (ck.mode!=='ai'||ckIsGameOver()) return;
  const moves=getAllCkMoves('black',ck.board); if (!moves.length) return;
  let move;
  if (ck.diff==='easy') move=moves[Math.floor(Math.random()*moves.length)];
  else if (ck.diff==='medium') { const j=moves.filter(m=>m.jump); move=j.length?j[Math.floor(Math.random()*j.length)]:moves[Math.floor(Math.random()*moves.length)]; }
  else move=ckMinimaxMove(3);
  ck.selected=null; ck.validMoves=[]; applyCkMove(move);
}

function ckMinimaxMove(depth) {
  const moves=getAllCkMoves('black',ck.board);
  let best=null,bestScore=-Infinity;
  for (const m of moves) {
    const saved=deepCopyBoard(ck.board),savedTurn=ck.turn,savedRed=ck.redCap,savedBlack=ck.blackCap;
    applyCkMoveSimulate(m,ck.board);
    const score=-ckMinimax(ck.board,depth-1,-Infinity,Infinity,'red');
    ck.board=saved; ck.turn=savedTurn; ck.redCap=savedRed; ck.blackCap=savedBlack;
    if (score>bestScore) { bestScore=score; best=m; }
  }
  return best||moves[0];
}

function applyCkMoveSimulate(move,board) {
  const piece=board[move.fr][move.fc];
  board[move.tr][move.tc]=piece?{...piece}:null; board[move.fr][move.fc]=null;
  if (move.jump&&board[move.cr]) board[move.cr][move.cc]=null;
  if (piece) {
    if (piece.color==='red'&&move.tr===0) piece.king=true;
    if (piece.color==='black'&&move.tr===7) piece.king=true;
  }
}

function ckMinimax(board,depth,alpha,beta,color) {
  const moves=getAllCkMoves(color,board);
  if (depth===0||!moves.length) return ckEvalBoard(board);
  let score=-Infinity;
  for (const m of moves) {
    const b2=deepCopyBoard(board); applyCkMoveSimulate(m,b2);
    const s=-ckMinimax(b2,depth-1,-beta,-alpha,color==='red'?'black':'red');
    score=Math.max(score,s); alpha=Math.max(alpha,s);
    if (alpha>=beta) break;
  }
  return score;
}

function ckEvalBoard(board) {
  let score=0;
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
    const p=board[r][c]; if (!p) continue;
    score+=p.color==='black'?(p.king?3:1):-(p.king?3:1);
  }
  return score;
}

document.querySelectorAll('[data-ck-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-ck-mode]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); ck.mode=btn.dataset.ckMode;
    const diffCard=document.getElementById('ckDiffCard');
    if (ck.mode==='ai') { diffCard.style.display=''; initCheckersView(); }
    else if (ck.mode==='local') { diffCard.style.display='none'; initCheckersView(); }
    else if (ck.mode==='create') { diffCard.style.display='none'; openRoomModal('create','checkers'); }
    else if (ck.mode==='join') { diffCard.style.display='none'; openRoomModal('join','checkers'); }
  });
});
document.querySelectorAll('[data-ck-diff]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-ck-diff]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); ck.diff=btn.dataset.ckDiff;
  });
});
document.getElementById('ckResetBtn').addEventListener('click', initCheckersView);

function syncCkBoard() {
  if (!ck.roomCode) return;
  db.ref(`rooms/checkers/${ck.roomCode}`).update({board:JSON.stringify(ck.board),turn:ck.turn});
}
function listenCkRoom(code,myColor) {
  ck.onlineColor=myColor; ck.roomCode=code; ck.mode='online';
  if (ck.onlineRef) ck.onlineRef.off();
  ck.onlineRef=db.ref(`rooms/checkers/${code}`);
  ck.onlineRef.on('value',snap=>{
    const d=snap.val(); if (!d) return;
    if (d.board) {
      const incoming=JSON.parse(d.board);
      if (JSON.stringify(incoming)!==JSON.stringify(ck.board)) {
        ck.board=incoming; ck.turn=d.turn; ck.selected=null; ck.validMoves=[];
        renderCheckers(); updateCkStatus();
      }
    }
    if (d.status==='playing') document.getElementById('ckOnlineBadge').classList.remove('hidden');
  });
}

// ════════════════════════════════════════════════════════════
// ██████  ONLINE ROOM MODAL
// ════════════════════════════════════════════════════════════
let _roomGame = null;

function openRoomModal(type,game) {
  _roomGame=game;
  const modal=document.getElementById('roomModal');
  modal.classList.remove('hidden');
  document.getElementById('createRoomPanel').classList.add('hidden');
  document.getElementById('joinRoomPanel').classList.add('hidden');
  document.getElementById('roomError').classList.add('hidden');
  if (type==='create') {
    document.getElementById('createRoomPanel').classList.remove('hidden');
    const code=genRoomCode();
    document.getElementById('displayRoomCode').textContent=code;
    document.getElementById('waitingText').textContent='Waiting for opponent...';
    createOnlineRoom(game,code);
  } else {
    document.getElementById('joinRoomPanel').classList.remove('hidden');
    document.getElementById('joinCodeInput').value='';
  }
}

function createOnlineRoom(game,code) {
  const ref=db.ref(`rooms/${game}/${code}`);
  const initData={game,status:'waiting',players:{host:getPlayerId(),guest:null},hostColor:'white'};
  if (game==='chess') initData.fen=new Chess().fen();
  if (game==='checkers') { initCheckersView(); initData.board=JSON.stringify(ck.board); initData.turn='red'; }
  ref.set(initData);
  ref.child('players/guest').on('value',snap=>{
    if (snap.val()) {
      document.getElementById('waitingText').textContent='Opponent joined! Starting...';
      ref.update({status:'playing'});
      setTimeout(()=>{
        document.getElementById('roomModal').classList.add('hidden');
        if (game==='chess') { chessMode='online'; listenChessRoom(code,'white'); }
        if (game==='checkers') listenCkRoom(code,'red');
      },1000);
    }
  });
}

document.getElementById('confirmJoinBtn').addEventListener('click',()=>{
  const code=document.getElementById('joinCodeInput').value.trim().toUpperCase();
  if (code.length<4) return;
  const ref=db.ref(`rooms/${_roomGame}/${code}`);
  ref.once('value',snap=>{
    const d=snap.val();
    if (!d||d.status!=='waiting') { document.getElementById('roomError').classList.remove('hidden'); return; }
    ref.child('players/guest').set(getPlayerId());
    ref.update({status:'playing'});
    document.getElementById('roomModal').classList.add('hidden');
    if (_roomGame==='chess') { chessMode='online'; listenChessRoom(code,'black'); }
    if (_roomGame==='checkers') { ck.board=JSON.parse(d.board); ck.turn=d.turn; renderCheckers(); updateCkStatus(); listenCkRoom(code,'black'); }
  });
});

document.getElementById('closeRoomModal').addEventListener('click',()=>{
  document.getElementById('roomModal').classList.add('hidden');
  if (_roomGame==='chess') { chessMode='ai'; document.querySelector('[data-chess-mode="ai"]').click(); }
  if (_roomGame==='checkers') { ck.mode='ai'; document.querySelector('[data-ck-mode="ai"]').click(); }
});

document.getElementById('copyRoomCodeBtn').addEventListener('click',()=>{
  const code=document.getElementById('displayRoomCode').textContent;
  navigator.clipboard.writeText(code).catch(()=>{});
  document.getElementById('copyRoomCodeBtn').textContent='Copied!';
  setTimeout(()=>document.getElementById('copyRoomCodeBtn').textContent='Copy Code',1500);
});

// ════════════════════════════════════════════════════════════
// ██████  GEMS CRUSH  (Match-3)
// ════════════════════════════════════════════════════════════
const GEMS_SIZE  = 8;
const GEMS_TYPES = 6;
const GEMS_LEVELS = [500, 1200, 2200, 3500, 5500, 8000];

let gemsGrid     = [];   // 2D array of gem type (0-5) or null
let gemsSelected = null; // {r,c}
let gemsScore    = 0;
let gemsLevel    = 1;
let gemsMoves    = 20;
let gemsBest     = 0;
let gemsAnimating= false;
let gemsLevelTarget = GEMS_LEVELS[0];
let gemsWon      = false;

function initGemsView() {
  gemsBest = parseInt(localStorage.getItem('gems_best') || '0');
  document.getElementById('gemsBest').textContent = `Best: ${gemsBest}`;
  gemsNewGame();
}

function gemsNewGame() {
  gemsScore = 0; gemsLevel = 1; gemsMoves = 20;
  gemsLevelTarget = GEMS_LEVELS[0]; gemsSelected = null; gemsWon = false;
  document.getElementById('gemsOverlay').classList.add('hidden');
  gemsBuildGrid();
  gemsUpdateUI();
  gemsRender();
}

function gemsBuildGrid() {
  gemsGrid = [];
  for (let r=0;r<GEMS_SIZE;r++) {
    gemsGrid[r] = [];
    for (let c=0;c<GEMS_SIZE;c++) {
      let type;
      do { type = Math.floor(Math.random()*GEMS_TYPES); }
      while (gemsWouldMatch(r,c,type));
      gemsGrid[r][c] = type;
    }
  }
}

function gemsWouldMatch(r,c,type) {
  if (c>=2 && gemsGrid[r][c-1]===type && gemsGrid[r][c-2]===type) return true;
  if (r>=2 && gemsGrid[r-1]?.[c]===type && gemsGrid[r-2]?.[c]===type) return true;
  return false;
}

function gemsRender() {
  const board = document.getElementById('gemsBoard');
  if (!board) return;
  board.innerHTML = '';
  for (let r=0;r<GEMS_SIZE;r++) for (let c=0;c<GEMS_SIZE;c++) {
    const cell = document.createElement('div');
    const type = gemsGrid[r][c];
    cell.className = `gem-cell gem-${type}`;
    cell.dataset.r = r; cell.dataset.c = c;
    cell.addEventListener('click', () => gemsOnClick(r, c));
    board.appendChild(cell);
  }
}

function gemsOnClick(r, c) {
  if (gemsAnimating || gemsWon) return;
  if (gemsMoves <= 0) return;

  if (!gemsSelected) {
    gemsSelected = {r, c};
    gemsRender();
    const cell = gemsGetCell(r, c);
    if (cell) cell.classList.add('selected');
    return;
  }

  const {r: sr, c: sc} = gemsSelected;
  gemsSelected = null;

  // Same cell — deselect
  if (sr === r && sc === c) { gemsRender(); return; }

  // Must be adjacent
  const dist = Math.abs(sr-r) + Math.abs(sc-c);
  if (dist !== 1) {
    // Re-select new cell if clicking non-adjacent
    gemsSelected = {r, c};
    gemsRender();
    gemsGetCell(r, c)?.classList.add('selected');
    return;
  }

  // Attempt swap
  gemsSwapTiles(sr, sc, r, c);
}

function gemsGetCell(r, c) {
  return document.querySelector(`#gemsBoard .gem-cell[data-r="${r}"][data-c="${c}"]`);
}

function gemsSwapTiles(r1, c1, r2, c2) {
  // Swap in grid
  [gemsGrid[r1][c1], gemsGrid[r2][c2]] = [gemsGrid[r2][c2], gemsGrid[r1][c1]];
  const matches = gemsFindMatches();

  if (matches.length === 0) {
    // Swap back — no match
    [gemsGrid[r1][c1], gemsGrid[r2][c2]] = [gemsGrid[r2][c2], gemsGrid[r1][c1]];
    gemsRender();
    // Shake effect
    const c1el = gemsGetCell(r1,c1), c2el = gemsGetCell(r2,c2);
    [c1el,c2el].forEach(el => { if(el){el.classList.add('swapping');setTimeout(()=>el.classList.remove('swapping'),220);} });
    return;
  }

  gemsMoves--;
  gemsAnimating = true;
  gemsRender();
  setTimeout(() => gemsClearAndCascade(), 50);
}

function gemsFindMatches() {
  const matched = new Set();
  // Horizontal
  for (let r=0;r<GEMS_SIZE;r++) {
    let run=1;
    for (let c=1;c<GEMS_SIZE;c++) {
      if (gemsGrid[r][c]!==null && gemsGrid[r][c]===gemsGrid[r][c-1]) {
        run++;
      } else {
        if (run>=3) for (let k=c-run;k<c;k++) matched.add(`${r},${k}`);
        run=1;
      }
    }
    if (run>=3) for (let k=GEMS_SIZE-run;k<GEMS_SIZE;k++) matched.add(`${r},${k}`);
  }
  // Vertical
  for (let c=0;c<GEMS_SIZE;c++) {
    let run=1;
    for (let r=1;r<GEMS_SIZE;r++) {
      if (gemsGrid[r][c]!==null && gemsGrid[r][c]===gemsGrid[r-1][c]) {
        run++;
      } else {
        if (run>=3) for (let k=r-run;k<r;k++) matched.add(`${k},${c}`);
        run=1;
      }
    }
    if (run>=3) for (let k=GEMS_SIZE-run;k<GEMS_SIZE;k++) matched.add(`${k},${c}`);
  }
  return [...matched].map(s=>{ const [r,c]=s.split(','); return {r:+r,c:+c}; });
}

function gemsClearAndCascade() {
  const matches = gemsFindMatches();
  if (matches.length === 0) {
    gemsAnimating = false;
    gemsUpdateUI();
    gemsCheckLevelEnd();
    return;
  }

  // Score: 10 per gem, bonus for 4+ matches
  const pts = matches.length <= 3 ? matches.length*10 : matches.length*10 + (matches.length-3)*15;
  gemsScore += pts;

  // Animate pop
  matches.forEach(({r,c}) => {
    const cell = gemsGetCell(r,c);
    if (cell) cell.classList.add('matched');
    gemsGrid[r][c] = null;
  });

  setTimeout(() => {
    gemsApplyGravity();
    gemsFillEmpty();
    gemsRender();
    // Cascade: check for new matches
    setTimeout(() => gemsClearAndCascade(), 300);
  }, 300);
}

function gemsApplyGravity() {
  for (let c=0;c<GEMS_SIZE;c++) {
    let empty = GEMS_SIZE-1;
    for (let r=GEMS_SIZE-1;r>=0;r--) {
      if (gemsGrid[r][c] !== null) {
        gemsGrid[empty][c] = gemsGrid[r][c];
        if (empty !== r) gemsGrid[r][c] = null;
        empty--;
      }
    }
  }
}

function gemsFillEmpty() {
  for (let r=0;r<GEMS_SIZE;r++) for (let c=0;c<GEMS_SIZE;c++) {
    if (gemsGrid[r][c] === null) gemsGrid[r][c] = Math.floor(Math.random()*GEMS_TYPES);
  }
}

function gemsUpdateUI() {
  document.getElementById('gemsScore').textContent = gemsScore.toLocaleString();
  document.getElementById('gemsMoves').textContent = gemsMoves;
  document.getElementById('gemsLevelNum').textContent = gemsLevel;
  document.getElementById('gemsTargetTxt').textContent = `Target: ${gemsLevelTarget.toLocaleString()}`;
  const pct = Math.min(100, (gemsScore / gemsLevelTarget) * 100);
  document.getElementById('gemsProgressFill').style.width = `${pct}%`;
  if (gemsScore > gemsBest) {
    gemsBest = gemsScore;
    localStorage.setItem('gems_best', gemsBest);
    document.getElementById('gemsBest').textContent = `Best: ${gemsBest.toLocaleString()}`;
  }
}

function gemsCheckLevelEnd() {
  if (gemsScore >= gemsLevelTarget) {
    // Level complete
    const nextLevel = gemsLevel + 1;
    const icon = document.getElementById('gemsOverIcon');
    const title = document.getElementById('gemsOverTitle');
    const scoreEl = document.getElementById('gemsOverScore');
    const nextBtn = document.getElementById('gemsNextBtn');
    const retryBtn = document.getElementById('gemsRetryBtn');

    icon.textContent = '🏆';
    title.textContent = `Level ${gemsLevel} Complete!`;
    scoreEl.textContent = `Score: ${gemsScore.toLocaleString()} pts`;
    nextBtn.style.display = nextLevel <= GEMS_LEVELS.length ? '' : 'none';
    retryBtn.textContent = 'Play Again';
    document.getElementById('gemsOverlay').classList.remove('hidden');
    gemsWon = true;

    nextBtn.onclick = () => {
      gemsLevel = nextLevel;
      gemsLevelTarget = GEMS_LEVELS[gemsLevel-1] || GEMS_LEVELS[GEMS_LEVELS.length-1] * gemsLevel;
      gemsMoves = 20 + (gemsLevel-1)*2;
      gemsSelected = null; gemsWon = false;
      document.getElementById('gemsOverlay').classList.add('hidden');
      gemsBuildGrid();
      gemsUpdateUI(); gemsRender();
    };

  } else if (gemsMoves <= 0) {
    // Out of moves
    document.getElementById('gemsOverIcon').textContent = '💔';
    document.getElementById('gemsOverTitle').textContent = 'Out of Moves!';
    document.getElementById('gemsOverScore').textContent = `Score: ${gemsScore.toLocaleString()} pts — Need ${gemsLevelTarget.toLocaleString()}`;
    document.getElementById('gemsNextBtn').style.display = 'none';
    document.getElementById('gemsRetryBtn').textContent = 'Try Again';
    document.getElementById('gemsOverlay').classList.remove('hidden');
    gemsWon = true;
  }
}

document.getElementById('gemsNewGameBtn').addEventListener('click', gemsNewGame);
document.getElementById('gemsRetryBtn').addEventListener('click', gemsNewGame);

// ════════════════════════════════════════════════════════════
// ██████  2048
// ════════════════════════════════════════════════════════════
const T_SIZE = 4;
let tGrid = [], tScore = 0, tBest = 0, tGameOver = false, tWon = false, tKeptGoing = false;

function initT2048View() {
  tBest = parseInt(localStorage.getItem('t2048_best') || '0');
  document.getElementById('t2048Best').textContent = `Best: ${tBest.toLocaleString()}`;
  t2048NewGame();
}

function t2048NewGame() {
  tGrid = Array.from({length:T_SIZE}, () => Array(T_SIZE).fill(0));
  tScore = 0; tGameOver = false; tWon = false; tKeptGoing = false;
  document.getElementById('t2048Overlay').classList.add('hidden');
  t2048AddRandom(); t2048AddRandom();
  t2048UpdateScore();
  t2048Render();
}

function t2048AddRandom() {
  const empty = [];
  for (let r=0;r<T_SIZE;r++) for (let c=0;c<T_SIZE;c++) if (!tGrid[r][c]) empty.push({r,c});
  if (!empty.length) return;
  const {r,c} = empty[Math.floor(Math.random()*empty.length)];
  tGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function t2048Render() {
  const container = document.getElementById('t2048Tiles');
  if (!container) return;
  container.innerHTML = '';
  for (let r=0;r<T_SIZE;r++) for (let c=0;c<T_SIZE;c++) {
    if (!tGrid[r][c]) continue;
    const tile = document.createElement('div');
    tile.className = `t2048-tile t-${Math.min(tGrid[r][c],2048)}`;
    tile.textContent = tGrid[r][c].toLocaleString();
    // Position using grid
    tile.style.gridRow = r+1;
    tile.style.gridColumn = c+1;
    container.appendChild(tile);
  }
}

function t2048Slide(row) {
  const filtered = row.filter(v=>v);
  const merged = [];
  let i=0, gained=0;
  while (i<filtered.length) {
    if (i+1<filtered.length && filtered[i]===filtered[i+1]) {
      const val = filtered[i]*2;
      merged.push(val);
      gained += val;
      i += 2;
    } else { merged.push(filtered[i]); i++; }
  }
  while (merged.length<T_SIZE) merged.push(0);
  return {row:merged, gained};
}

function t2048Move(dir) {
  if (tGameOver) return;
  let moved=false, totalGained=0;
  const prev = JSON.stringify(tGrid);

  if (dir==='left') {
    for (let r=0;r<T_SIZE;r++) {
      const {row,gained}=t2048Slide(tGrid[r]);
      tGrid[r]=row; totalGained+=gained;
    }
  } else if (dir==='right') {
    for (let r=0;r<T_SIZE;r++) {
      const {row,gained}=t2048Slide([...tGrid[r]].reverse());
      tGrid[r]=row.reverse(); totalGained+=gained;
    }
  } else if (dir==='up') {
    for (let c=0;c<T_SIZE;c++) {
      const col=tGrid.map(r=>r[c]);
      const {row,gained}=t2048Slide(col);
      row.forEach((v,r)=>tGrid[r][c]=v); totalGained+=gained;
    }
  } else if (dir==='down') {
    for (let c=0;c<T_SIZE;c++) {
      const col=tGrid.map(r=>r[c]).reverse();
      const {row,gained}=t2048Slide(col);
      row.reverse().forEach((v,r)=>tGrid[r][c]=v); totalGained+=gained;
    }
  }

  moved = JSON.stringify(tGrid) !== prev;
  if (!moved) return;

  tScore += totalGained;
  t2048AddRandom();
  t2048UpdateScore();
  t2048Render();

  // Check win
  if (!tWon && !tKeptGoing) {
    const flat = tGrid.flat();
    if (flat.includes(2048)) {
      tWon = true;
      document.getElementById('t2048OverIcon').textContent = '🏆';
      document.getElementById('t2048OverTitle').textContent = 'You reached 2048!';
      document.getElementById('t2048OverScore').textContent = `Score: ${tScore.toLocaleString()}`;
      document.getElementById('t2048ContinueBtn').style.display = '';
      document.getElementById('t2048Overlay').classList.remove('hidden');
      return;
    }
  }

  // Check game over
  if (!t2048HasMoves()) {
    tGameOver = true;
    document.getElementById('t2048OverIcon').textContent = '😓';
    document.getElementById('t2048OverTitle').textContent = 'Game Over!';
    document.getElementById('t2048OverScore').textContent = `Score: ${tScore.toLocaleString()}`;
    document.getElementById('t2048ContinueBtn').style.display = 'none';
    document.getElementById('t2048Overlay').classList.remove('hidden');
  }
}

function t2048HasMoves() {
  for (let r=0;r<T_SIZE;r++) for (let c=0;c<T_SIZE;c++) {
    if (!tGrid[r][c]) return true;
    if (c+1<T_SIZE && tGrid[r][c]===tGrid[r][c+1]) return true;
    if (r+1<T_SIZE && tGrid[r][c]===tGrid[r+1][c]) return true;
  }
  return false;
}

function t2048UpdateScore() {
  document.getElementById('t2048Score').textContent = tScore.toLocaleString();
  if (tScore > tBest) {
    tBest = tScore; localStorage.setItem('t2048_best', tBest);
    document.getElementById('t2048Best').textContent = `Best: ${tBest.toLocaleString()}`;
  }
}

// Keyboard controls
document.addEventListener('keydown', e => {
  const view = document.querySelector('.view.active');
  if (!view || view.id !== 'view-t2048') return;
  const map = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
  if (map[e.key]) { e.preventDefault(); t2048Move(map[e.key]); }
});

// Touch/swipe controls
(function() {
  let tx=0,ty=0;
  document.addEventListener('touchstart', e=>{
    const v=document.querySelector('.view.active');
    if (!v||v.id!=='view-t2048') return;
    tx=e.touches[0].clientX; ty=e.touches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchend', e=>{
    const v=document.querySelector('.view.active');
    if (!v||v.id!=='view-t2048') return;
    const dx=e.changedTouches[0].clientX-tx;
    const dy=e.changedTouches[0].clientY-ty;
    if (Math.max(Math.abs(dx),Math.abs(dy))<30) return;
    if (Math.abs(dx)>Math.abs(dy)) t2048Move(dx>0?'right':'left');
    else t2048Move(dy>0?'down':'up');
  }, {passive:true});
})();

document.getElementById('t2048NewBtn').addEventListener('click', t2048NewGame);
document.getElementById('t2048RetryBtn').addEventListener('click', t2048NewGame);
document.getElementById('t2048ContinueBtn').addEventListener('click', ()=>{
  tKeptGoing=true; tWon=false;
  document.getElementById('t2048Overlay').classList.add('hidden');
});
