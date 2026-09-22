import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const CAPTURES_DIR = path.resolve("test-captures");

if (!fs.existsSync(CAPTURES_DIR)) {
  fs.mkdirSync(CAPTURES_DIR, { recursive: true });
}

async function run() {
  console.log("Launching Chrome...");
  const chrome = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-gpu",
    "--no-sandbox",
    "--window-size=1920,1080",
    "http://localhost:3000",
  ]);

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json`);
    const tabs = await listRes.json();
    const portfolioTab = tabs.find((t) => t.title.includes("Tharun") || t.url.includes("localhost:3000"));
    if (!portfolioTab) {
      throw new Error("Portfolio tab not found in Chrome tabs: " + JSON.stringify(tabs));
    }

    console.log("Connecting to tab:", portfolioTab.title, portfolioTab.webSocketDebuggerUrl);
    const ws = new WebSocket(portfolioTab.webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();
    const consoleLogs = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
      if (data.method === "Runtime.consoleAPICalled") {
        consoleLogs.push(data.params);
      }
      if (data.method === "Runtime.exceptionThrown") {
        console.error("PAGE EXCEPTION:", JSON.stringify(data.params));
      }
    };

    await new Promise((r) => (ws.onopen = r));

    function send(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send("Runtime.enable");
    await send("Page.enable");

    // Wait for canvas to mount and render
    console.log("Waiting for page load and WebGL initialization...");
    for (let i = 0; i < 20; i++) {
      const chk = await send("Runtime.evaluate", {
        expression: `!!document.querySelector('canvas')`,
        returnByValue: true,
      });
      if (chk.result?.value) {
        console.log(`Canvas mounted after ${i * 600}ms!`);
        break;
      }
      await new Promise((r) => setTimeout(r, 600));
    }
    await new Promise((r) => setTimeout(r, 1500));

    // Evaluate WebGL status
    const glInfo = await send("Runtime.evaluate", {
      expression: `(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { error: 'No canvas found' };
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        return {
          hasCanvas: true,
          width: canvas.width,
          height: canvas.height,
          hasGl: !!gl,
          glVendor: gl ? gl.getParameter(gl.VENDOR) : null,
          glRenderer: gl ? gl.getParameter(gl.RENDERER) : null,
        };
      })()`,
      returnByValue: true,
    });
    console.log("WebGL Status:", JSON.stringify(glInfo.result.value));

    // Test 10 shots
    const shots = [
      { name: "shot01_awakening", p: 0.00 },
      { name: "shot02_network", p: 0.12 },
      { name: "shot03_structure", p: 0.24 },
      { name: "shot04_architecture", p: 0.38 },
      { name: "shot05_transformation", p: 0.52 },
      { name: "shot06_environment", p: 0.66 },
      { name: "shot07_organic", p: 0.78 },
      { name: "shot08_disintegration", p: 0.88 },
      { name: "shot09_convergence", p: 0.94 },
      { name: "shot10_singularity", p: 0.98 },
    ];

    for (const shot of shots) {
      console.log(`Setting progress to ${shot.p} for ${shot.name}...`);
      await send("Runtime.evaluate", {
        expression: `(() => {
          // Find worldState and update
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo(0, max * ${shot.p});
          // Also directly force worldState if imported on window
          if (window.__WORLD_STATE__) {
            window.__WORLD_STATE__.globalProgress = ${shot.p};
          }
        })()`,
      });

      // Allow 400ms for Three.js render loop to damp to target
      await new Promise((r) => setTimeout(r, 500));

      const capture = await send("Page.captureScreenshot", { format: "png" });
      const buffer = Buffer.from(capture.data, "base64");
      const filePath = path.join(CAPTURES_DIR, `${shot.name}.png`);
      fs.writeFileSync(filePath, buffer);
      console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
    }

    console.log("Captures complete!");
    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
