const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const game = new Game();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const { type, payload } = JSON.parse(message);
    
    switch (type) {
      case 'init':
        // Handle game initialization
        game.placeCharacters(payload.player, payload.positions);
        break;
      case 'move':
        // Handle player move
        if (game.isValidMove(payload.character, payload.move)) {
          game.processMove(payload.player, payload.character, payload.move);
          game.switchTurn();
          broadcastGameState();
        } else {
          ws.send(JSON.stringify({ type: 'invalidMove' }));
        }
        break;
    }
  });
});

function broadcastGameState() {
  const state = { type: 'gameState', payload: game.board };
  wss.clients.forEach((client) => client.send(JSON.stringify(state)));
}

server.listen(8080, () => console.log('Server running on port 8080'));
// Event handler for game initialization
function handleInit(ws, payload) {
    // Initialize the game with the given payload (e.g., player positions)
    game.init(payload);
    const gameState = game.getGameState();
    
    // Send the initial game state back to the client
    ws.send(JSON.stringify({ type: 'gameState', payload: gameState }));
}

// Event handler for processing moves
function handleMove(ws, payload) {
    // Process the move in the game logic
    const { valid, updatedGameState, error } = game.processMove(payload);

    if (valid) {
        // Broadcast the updated game state to all connected clients
        broadcastGameState(updatedGameState);
        
        // Check if the game is over
        if (game.isGameOver()) {
            broadcastGameOver(game.getWinner());
        }
    } else {
        // Notify the client about the invalid move
        ws.send(JSON.stringify({ type: 'invalidMove', payload: { error } }));
    }
}

// Helper function to broadcast the game state to all connected clients
function broadcastGameState(gameState) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'gameState', payload: gameState }));
        }
    });
}

// Helper function to broadcast the game over event
function broadcastGameOver(winner) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'gameOver', payload: { winner } }));
        }
    });
}
