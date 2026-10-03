// Rebuilds the two test PDFs from letter1.txt with headless Edge (Windows):
//   letter1.pdf       a normal PDF with a text layer
//   letter1-scan.pdf  the same letter as a slightly tilted image only, like a scan, with no text layer
// Usage: node tools/make-sample-pdfs.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const letter = fs.readFileSync(path.join(ROOT, 'letter1.txt'), 'utf8')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const textPage = `<!doctype html><meta charset=utf-8><style>@page{size:A4;margin:20mm}body{font:11pt/1.45 Arial,sans-serif;white-space:pre-wrap;color:#111;margin:0}</style><body>${letter}</body>`;
const scanSheet = `<!doctype html><meta charset=utf-8><body style="margin:0;padding:40px 0;background:#ddd"><div style="width:794px;margin:0 auto;background:#fff;padding:60px 70px;box-sizing:border-box;font:15px/1.55 Arial,sans-serif;white-space:pre-wrap;color:#222;transform:rotate(-1.2deg);transform-origin:center;box-shadow:0 2px 10px #0003">${letter}</div></body>`;

const PORT = 9335;
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(os.tmpdir(), 'courrier-pdf-edge')}`, 'about:blank'], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const load = async html => { await send('Page.setDocumentContent', { frameId: target.id, html }); await sleep(500); };

await send('Page.enable');

// 1. Text PDF
await load(textPage);
let pdf = await send('Page.printToPDF', { preferCSSPageSize: true });
fs.writeFileSync(path.join(ROOT, 'letter1.pdf'), Buffer.from(pdf.result.data, 'base64'));

// 2. Scan: photograph the tilted sheet as a JPEG, then print that image alone onto an A4 page
await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 1240, deviceScaleFactor: 1.5, mobile: false });
await load(scanSheet);
const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72 });
await send('Emulation.clearDeviceMetricsOverride');
await load(`<!doctype html><style>@page{size:A4;margin:0}body{margin:0}img{width:210mm;height:297mm;object-fit:cover;display:block}</style><img src="data:image/jpeg;base64,${shot.result.data}">`);
pdf = await send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true });
fs.writeFileSync(path.join(ROOT, 'letter1-scan.pdf'), Buffer.from(pdf.result.data, 'base64'));

ws.close(); edge.kill();
console.log('Wrote letter1.pdf and letter1-scan.pdf');
process.exit(0);
