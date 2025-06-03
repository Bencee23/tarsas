
const boardSize = 36;
let board = [];
let players = [];
let currentPlayerIndex = 0;
let gameEnded = false;
let diceRoll = 0;

function shuffleBoard() {
  const cells = [];
  for (let i = 0; i < boardSize; i++) {
    const r = Math.random();
    let type = 'normal';
    if (r < 0.15) type = 'help';
    else if (r < 0.3) type = 'trap';
    else if (r < 0.45) type = 'dragon';
    cells.push({ type });
  }
  return cells;
}

function drawBoard() {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  board.forEach((cell, idx) => {
    const div = document.createElement('div');
    div.className = 'cell ' + (cell.type !== 'normal' ? cell.type : '');
    players.forEach((p, pi) => {
      if (p.pos === idx) {
        const marker = document.createElement('div');
        marker.textContent = '🐉';
        marker.className = 'player ' + p.class;
        marker.style.top = `${pi * 15}px`;
        div.appendChild(marker);
      }
    });
    boardDiv.appendChild(div);
  });
  updateScores();
}

function updateScores() {
  const scoreDiv = document.getElementById('scores');
  scoreDiv.innerHTML = players.map(p => `<span class="\${p.class}">\${p.name}: \${p.cards} kártya</span>`).join(' | ');
}

function log(msg) {
  const logDiv = document.getElementById('log');
  logDiv.innerHTML = `<div>> \${msg}</div>` + logDiv.innerHTML;
}

function rollDice(index) {
  if (gameEnded || index !== currentPlayerIndex) return;
  diceRoll = Math.floor(Math.random() * 6) + 1;
  document.getElementById('diceResult').textContent = `\${players[index].name} dobott: \${diceRoll}`;
  showDirectionButtons();
}

function showDirectionButtons() {
  const controls = document.getElementById('directionControls');
  controls.innerHTML = `<p>Irányválasztás:</p>
    <button onclick="movePlayer('up')">⬆️</button>
    <button onclick="movePlayer('left')">⬅️</button>
    <button onclick="movePlayer('right')">➡️</button>
    <button onclick="movePlayer('down')">⬇️</button>`;
}

function movePlayer(direction) {
  const player = players[currentPlayerIndex];
  for (let i = 0; i < diceRoll; i++) {
    if (direction === 'up') player.pos = (player.pos - 6 + boardSize) % boardSize;
    if (direction === 'down') player.pos = (player.pos + 6) % boardSize;
    if (direction === 'left') player.pos = (player.pos - 1 + boardSize) % boardSize;
    if (direction === 'right') player.pos = (player.pos + 1) % boardSize;
  }
  resolveCell(player);
  drawBoard();

  if (player.cards >= 10) {
    log(`\${player.name} nyert 10 sárkánykártyával!`);
    alert(`Játék vége! \${player.name} nyert!`);
    gameEnded = true;
    return;
  }

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  document.getElementById('directionControls').innerHTML = '';
}

function resolveCell(player) {
  const cell = board[player.pos];
  if (cell.type === 'dragon') {
    player.cards++;
    log(`\${player.name} talált egy sárkánykártyát! (+1)`);
  } else if (cell.type === 'help') {
    const effect = Math.floor(Math.random() * 3);
    if (effect === 0) {
      player.cards++;
      log(`\${player.name} segítséget kapott: +1 sárkánykártya.`);
    } else if (effect === 1) {
      for (let i = player.pos + 1; i < board.length; i++) {
        if (board[i].type === 'help') {
          player.pos = i;
          log(`\${player.name} előrelépett a következő segítségmezőre.`);
          break;
        }
      }
    } else {
      const richest = players.reduce((a, b) => a.cards > b.cards ? a : b);
      if (richest !== player) {
        [player.cards, richest.cards] = [richest.cards, player.cards];
        log(`\${player.name} kicserélte sárkánykártyáit \${richest.name}-val.`);
      }
    }
  } else if (cell.type === 'trap') {
    const effect = Math.floor(Math.random() * 3);
    if (effect === 0) {
      player.cards = Math.max(0, player.cards - 1);
      log(`\${player.name} veszített egy sárkánykártyát. (-1)`);
    } else if (effect === 1) {
      for (let i = player.pos + 1; i < board.length; i++) {
        if (board[i].type === 'trap') {
          player.pos = i;
          log(`\${player.name} tovább csúszott a következő hátráltatás mezőre.`);
          break;
        }
      }
    } else {
      const poorest = players.reduce((a, b) => a.cards < b.cards ? a : b);
      if (poorest !== player) {
        [player.cards, poorest.cards] = [poorest.cards, player.cards];
        log(`\${player.name} kénytelen volt cserélni a \${poorest.name}-val.`);
      }
    }
  }
}

function setupGame() {
  const numPlayers = Math.min(parseInt(prompt("Hány játékos játszik? (1-4)")) || 1, 4);
  const allPlayers = [
    { name: 'Tűzsárkány', pos: 0, cards: 0, class: 'p0' },
    { name: 'Vízsárkány', pos: 0, cards: 0, class: 'p1' },
    { name: 'Földsárkány', pos: 0, cards: 0, class: 'p2' },
    { name: 'Levegősárkány', pos: 0, cards: 0, class: 'p3' },
  ];
  players = allPlayers.slice(0, numPlayers);
  board = shuffleBoard();
  currentPlayerIndex = 0;
  gameEnded = false;

  const playerButtons = document.getElementById('playerButtons');
  playerButtons.innerHTML = '';
  players.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.textContent = `\${p.name} dob`;
    btn.className = p.class;
    btn.onclick = () => rollDice(i);
    btn.id = `btn\${i}`;
    playerButtons.appendChild(btn);
  });

  drawBoard();
}

setupGame();
