// Courrier POC server: serves the page and proxies /api/* to the local Ollama, so the browser never hits CORS.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 5179;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.js': 'text/javascript' };

http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const upstream = await fetch('http://localhost:11434' + req.url, { method: req.method, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
    res.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') || 'application/json' });
    for await (const c of upstream.body) res.write(c);
    return res.end();
  }
  const urlPath = req.url.split('?')[0];
  const file = path.resolve(ROOT, '.' + (urlPath === '/' ? '/index.html' : decodeURIComponent(urlPath)));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`Courrier on http://localhost:${PORT}`));
