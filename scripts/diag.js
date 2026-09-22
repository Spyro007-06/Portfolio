const { spawn } = require('child_process');
const fs = require('fs');

async function check() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1920,1080',
    'http://localhost:3000'
  ]);
  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch('http://127.0.0.1:9223/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.url.includes('localhost:3000'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
    const req = (m, p = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const handler = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener('message', handler);
          if (d.error) reject(d.error); else resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });

    const logs = [];
    ws.onmessage = (evt) => {
      const d = JSON.parse(evt.data);
      if (d.method === 'Runtime.consoleAPICalled') {
        logs.push(d.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
      }
      if (d.method === 'Runtime.exceptionThrown') {
        logs.push('EXCEPTION: ' + JSON.stringify(d.params));
      }
    };

    await new Promise(r => ws.onopen = r);
    await req('Runtime.enable');
    await req('Page.enable');
    await new Promise(r => setTimeout(r, 3000));

    console.log('--- BROWSER CONSOLE LOGS ---');
    console.log(logs.join('\n'));

    ws.close();
  } finally {
    chrome.kill();
  }
}
check().catch(console.error);
