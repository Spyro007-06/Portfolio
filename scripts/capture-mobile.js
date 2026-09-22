const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--window-size=390,844',
    '--hide-scrollbars',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 4500));

  const res = await fetch('http://127.0.0.1:9226/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.url.includes('localhost:3000'));
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = id++;
      const h = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener('message', h);
          if (d.error) reject(d.error); else resolve(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  const sections = [
    { name: 'mobile_01_hero.png', id: 'hero' },
    { name: 'mobile_02_about.png', id: 'about' },
    { name: 'mobile_03_skills.png', id: 'skills' },
    { name: 'mobile_04_work.png', id: 'work' },
    { name: 'mobile_05_experience.png', id: 'experience' },
    { name: 'mobile_06_contact.png', id: 'contact' }
  ];

  for (const s of sections) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('${s.id}');
        if (el) {
          if (window.__LENIS__) {
            window.__LENIS__.scrollTo(el.offsetTop, { immediate: true });
          } else {
            window.scrollTo({ top: el.offsetTop, behavior: 'instant' });
          }
          const max = document.documentElement.scrollHeight - window.innerHeight;
          if (window.__WORLD_STATE__) {
            window.__WORLD_STATE__.globalProgress = Math.max(0, Math.min(1, el.offsetTop / max));
          }
          window.dispatchEvent(new Event('scroll'));
        }
      })()`
    });

    await new Promise(r => setTimeout(r, 1200));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(s.name, Buffer.from(shot.data, 'base64'));
    console.log(`Captured ${s.name}`);
  }

  ws.close();
  chrome.kill();
}

main().catch(console.error);
