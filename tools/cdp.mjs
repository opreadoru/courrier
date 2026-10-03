// Tiny headless-Edge driver for checking POCs: node cdp.mjs <url> <out.png> [js-to-run-after-load] [wait-ms] [width] [height] [js-after-wait]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [url, out, js = '', wait = '1000', width = '1400', height = '1000', js2 = ''] = process.argv.slice(2);
const profile = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'edge-profile');
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ['--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${profile}`, `--window-size=${width},${height}`, 'about:blank'], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try { target = (await (await fetch('http://127.0.0.1:9333/json')).json()).find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map(); const logs = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.consoleAPICalled') logs.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  if (m.method === 'Runtime.exceptionThrown') logs.push('EXCEPTION ' + m.params.exceptionDetails.exception?.description);
};
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +width, height: +height, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await sleep(1500);
if (js) console.log('js1 ->', await evalJs(js));
await sleep(+wait);
if (js2) console.log('js2 ->', await evalJs(js2));
await sleep(300);
const shot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(logs.join('\n'));
ws.close(); edge.kill();
process.exit(0);
