const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  // Initialize game for Player A
  ws.send(JSON.stringify({
    type: 'init',
    payload: {
      player: 'A',
      positions: ['P1', 'H1', 'H2', 'P1', 'P1']
    }
  }));
};

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);

  switch (type) {
    case 'gameState':
      renderBoard(payload);
      break;
    case 'invalidMove':
      alert('Invalid move, please try again.');
      break;
  }
};

function renderBoard(board) {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = ''; // Clear the board

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';
      cellDiv.textContent = cell ? `${cell.player}-${cell.char}` : '';
      boardDiv.appendChild(cellDiv);
    });
  });
}
