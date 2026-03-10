import { eq, and } from 'drizzle-orm';
import { db, pool } from './db.js';
import { matches, commentary } from './db/schema.js';
import express from 'express';
import { matchesRouter } from './routes/matches.js';
import http from 'http';

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';
const server = http.createServer(app);

app.use(express.json());

app.use('/matches', matchesRouter);

const {broadcastMatchCreated} = attachWebSocketServer(server);
app.local.broadcastMatchCreated = broadcastMatchCreated;

app.get('/', (req, res) => {
  res.send('Welcome to the Sports Match API!');
});

server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}`: `http://${HOST}:${PORT}`;
  console.log(`Server is running on port ${baseUrl}`);
  console.log(`WebSocket server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});


