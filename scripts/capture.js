const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'http://localhost:3000';
const outputFile = process.argv[3] || 'screenshot.png';

async function main() {
  const tmpDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_shot_' + Date.now());
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1920,1080',
    '--hide-scrollbars',
    'about:blank'
  ], { stdio: 'ignore' });

  // wait for CDP port
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to connect to Chrome CDP');
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, (res) => {
        if (res.error) reject(res.error);
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  function sendSession(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, (res) => {
        if (res.error) reject(res.error);
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
    });
  }

  const consoleLogs = [];
  ws.addEventListener('message', (evt) => {
    const m = JSON.parse(evt.data);
    if (m.method === 'Runtime.consoleAPICalled') {
      consoleLogs.push(`[Console ${m.params.type}]: ${m.params.args.map(a => a.value || JSON.stringify(a)).join(' ')}`);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      consoleLogs.push(`[Exception]: ${JSON.stringify(m.params.exceptionDetails)}`);
    }
  });

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.addEventListener('error', (e) => {
        console.error('WINDOW_ERROR:', e.message, e.filename, e.lineno, e.colno, e.error ? e.error.stack : '');
      });
    `
  });
  await sendSession('Page.navigate', { url });
  const scrollY = parseFloat(process.argv[4] || '0');

  // Wait 4.5 seconds for complete loading screen exit and hero animation reveal
  await new Promise(r => setTimeout(r, 4500));

  if (scrollY > 0) {
    await sendSession('Runtime.evaluate', {
      expression: `window.scrollTo(0, ${scrollY});`
    });
    // Wait for ScrollTrigger and R3F to update
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('--- BROWSER LOGS ---');
  consoleLogs.forEach(l => console.log(l));
  console.log('--------------------');

  const evalRes = await sendSession('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelector('canvas');
      const debug = {};
      if (window.__WORLD_STATE__) {
        debug.worldState = window.__WORLD_STATE__;
      }
      return {
        hasCanvas: !!canvas,
        canvasWidth: canvas ? canvas.width : 0,
        canvasHeight: canvas ? canvas.height : 0,
        debug
      };
    })()`,
    returnByValue: true
  });
  console.log('DOM Canvas State:', JSON.stringify(evalRes.result?.value, null, 2));

  const screenshot = await sendSession('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outputFile, Buffer.from(screenshot.data, 'base64'));
  console.log(`Saved screenshot to ${outputFile}`);

  ws.close();
  chrome.kill();
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {}
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
