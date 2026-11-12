#!/usr/bin/env node
/**
 * Renders catalogue.html to PDF using a locally installed Chromium browser
 * (Microsoft Edge or Google Chrome) in headless mode. Produces:
 *
 *   Zauq-Frames-Catalogue-2026.pdf                 A4 (210 × 297 mm) — email, screen, office printing
 *   Zauq-Frames-Catalogue-2026-PRINT-3mm-bleed.pdf 216 × 303 mm — for a print shop (trim to A4)
 *
 *   node catalogue/build-pdf.mjs
 *
 * Set CHROME_PATH to use a specific browser. Needs internet access for Google Fonts.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(here, 'catalogue.html');
const MM_PER_INCH = 25.4;
const VARIANTS = [
  { file: 'Zauq-Frames-Catalogue-2026.pdf', bleedMm: 0 },
  { file: 'Zauq-Frames-Catalogue-2026-PRINT-3mm-bleed.pdf', bleedMm: 3 },
];

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browserPath = candidates.find((p) => fs.existsSync(p));
if (!browserPath) {
  console.error('No Edge/Chrome found. Set CHROME_PATH to a Chromium-based browser.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9400 + Math.floor(Math.random() * 400);
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zauq-pdf-'));
const browser = spawn(
  browserPath,
  ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`, 'about:blank'],
  { stdio: 'ignore' },
);

async function connect() {
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
    } catch {
      // browser still starting
    }
  }
  if (!target) throw new Error('Browser did not start.');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));
  let nextId = 1;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;
  return { ws, send, evaluate };
}

async function main() {
  const { ws, send, evaluate } = await connect();
  await send('Page.enable');
  await send('Page.navigate', { url: pathToFileURL(input).href });

  // Wait for the document, images and every brand font.
  const ready = `document.readyState === 'complete' && document.fonts.status === 'loaded' &&
    [...document.images].every((img) => img.complete && img.naturalWidth > 0) &&
    document.fonts.check('400 20px "Bricolage Grotesque"') && document.fonts.check('800 20px "Bricolage Grotesque"') &&
    document.fonts.check('italic 20px "Instrument Serif"')`;
  let ok = false;
  for (let i = 0; i < 240 && !ok; i++) {
    await sleep(250);
    ok = await evaluate(ready);
  }
  if (!ok) console.warn('⚠ Fonts or images did not all load (offline?). Output may use fallback fonts.');
  await evaluate('document.fonts.ready.then(() => true)');

  for (const { file, bleedMm } of VARIANTS) {
    await evaluate(`document.documentElement.style.setProperty('--bleed', '${bleedMm}mm')`);
    await sleep(400);

    // Report any page (or its content box) whose content spills over.
    const overflowing = await evaluate(`[...document.querySelectorAll('.page')].map((p, i) => {
      const boxes = [p, ...p.querySelectorAll('.content')];
      return boxes.some((b) => b.scrollHeight > b.clientHeight + 1) ? i + 1 : null;
    }).filter(Boolean)`);
    if (overflowing.length) console.warn(`⚠ ${file}: content overflows on page(s) ${overflowing.join(', ')}`);

    const pageCount = await evaluate(`document.querySelectorAll('.page').length`);
    const { data } = await send('Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: false,
      paperWidth: (210 + 2 * bleedMm) / MM_PER_INCH,
      paperHeight: (297 + 2 * bleedMm) / MM_PER_INCH,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    });
    const output = path.join(here, file);
    fs.writeFileSync(output, Buffer.from(data, 'base64'));
    console.log(`✓ ${pageCount} pages, ${210 + 2 * bleedMm} × ${297 + 2 * bleedMm} mm → ${output}`);
  }

  ws.close();
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  browser.kill();
  await sleep(800);
  try {
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    // Edge can hold the temp profile briefly on Windows; it is in the OS temp folder, so leaving it is harmless.
  }
}
