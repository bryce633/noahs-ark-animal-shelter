import http from 'node:http';
import { handleRequest } from './app.js';
import { config } from './config.js';
import './db.js'; // ensures schema is created before the server starts accepting requests

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error('[fatal request error]', error);
    if (!res.writableEnded) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

server.listen(config.port, () => {
  console.log(`Adoption center backend listening on http://localhost:${config.port}`);
  console.log(`Database file: ${config.databasePath}`);
});
