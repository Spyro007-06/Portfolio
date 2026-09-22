const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const tmpDir = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_audit_' + Date.now());
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

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('Page.navigate', { url: 'http://localhost:3000' });

  // Wait 4 seconds for loader to finish and hero to reveal
  await new Promise(r => setTimeout(r, 4000));

  const sections = [
    { id: 'hero', file: 'audit_01_hero.png', scrollExpr: '0' },
    { id: 'about', file: 'audit_02_about.png', scrollExpr: 'document.getElementById("about").offsetTop' },
    { id: 'skills', file: 'audit_03_skills.png', scrollExpr: 'document.getElementById("skills").offsetTop + window.innerHeight * 0.5' },
    { id: 'skills_active', file: 'audit_03b_skills.png', scrollExpr: 'document.getElementById("skills").offsetTop + window.innerHeight * 1.5' },
    { id: 'work', file: 'audit_04_work.png', scrollExpr: 'document.getElementById("work").offsetTop + window.innerHeight * 0.5' },
    { id: 'work_p2', file: 'audit_04b_work.png', scrollExpr: 'document.getElementById("work").offsetTop + window.innerHeight * 1.8' },
    { id: 'experience_start', file: 'audit_05_experience.png', scrollExpr: 'document.getElementById("experience").offsetTop + window.innerHeight * 0.2' },
    { id: 'experience_mid', file: 'audit_05b_experience.png', scrollExpr: 'document.getElementById("experience").offsetTop + window.innerHeight * 1.0' },
    { id: 'experience_end', file: 'audit_05c_experience.png', scrollExpr: 'document.getElementById("experience").offsetTop + window.innerHeight * 1.8' },
    { id: 'contact', file: 'audit_06_contact.png', scrollExpr: 'document.getElementById("contact").offsetTop' },
    { id: 'final_pullback', file: 'audit_07_final_pullback.png', scrollExpr: 'document.documentElement.scrollHeight - window.innerHeight' }
  ];

  for (const sec of sections) {
    console.log(`Scrolling to ${sec.id}...`);
    await sendSession('Runtime.evaluate', {
      expression: `(() => {
        const top = ${sec.scrollExpr};
        if (window.__LENIS__) {
          window.__LENIS__.scrollTo(top, { immediate: true });
        } else {
          window.scrollTo({ top, behavior: 'instant' });
        }
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (window.__WORLD_STATE__) {
          window.__WORLD_STATE__.globalProgress = Math.max(0, Math.min(1, top / max));
        }
        window.dispatchEvent(new Event('scroll'));
      })()`
    });

    // Wait 1.2s for camera and GSAP ScrollTrigger to settle
    await new Promise(r => setTimeout(r, 1200));

    const screenshot = await sendSession('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(sec.file, Buffer.from(screenshot.data, 'base64'));
    console.log(`Captured ${sec.file}`);
  }

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
