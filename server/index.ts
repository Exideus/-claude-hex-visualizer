import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import { scanSessions, watchSessions, type ClaudeSession } from './sessionScanner';

const PORT = process.env.PORT || 3847;

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

let currentSessions: ClaudeSession[] = [];

// Broadcast to all connected clients
function broadcast(data: object) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send current sessions to new client
  ws.send(
    JSON.stringify({
      type: 'init',
      sessions: currentSessions,
    })
  );

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// REST API endpoints
app.get('/api/sessions', async (_req, res) => {
  try {
    const sessions = await scanSessions();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan sessions' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', sessions: currentSessions.length });
});

// Start watching sessions
const stopWatching = watchSessions((sessions) => {
  console.log(`Found ${sessions.length} sessions`);
  currentSessions = sessions;

  // Broadcast update to all clients
  broadcast({
    type: 'init',
    sessions,
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔷 Claude HEX Visualizer                                ║
║                                                           ║
║   Server running at http://localhost:${PORT}               ║
║   WebSocket at ws://localhost:${PORT}                      ║
║                                                           ║
║   Scanning Claude Code sessions...                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  stopWatching();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopWatching();
  server.close();
  process.exit(0);
});
