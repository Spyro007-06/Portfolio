const { spawn } = require('child_process');

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=9223', '--no-first-run', 'http://localhost:3000'
  ]);
  
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://127.0.0.1:9223/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.url.includes('3000'));
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      returnByValue: true,
      expression: `(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ids = ['hero', 'about', 'skills', 'work', 'experience', 'contact'];
        return {
          totalScrollable: max,
          sections: ids.map(id => {
            const el = document.getElementById(id);
            return {
              id,
              offsetTop: el ? el.offsetTop : 0,
              offsetHeight: el ? el.offsetHeight : 0,
              startProgress: el ? Number((el.offsetTop / max).toFixed(4)) : 0,
              endProgress: el ? Number(((el.offsetTop + el.offsetHeight) / max).toFixed(4)) : 0
            };
          })
        };
      })()`
    }
  }));

  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id === 1) {
      console.log(JSON.stringify(d.result.result.value, null, 2));
      chrome.kill();
      process.exit(0);
    }
  };
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
