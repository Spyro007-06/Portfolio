import { chromium } from "playwright";
import fs from "fs";

async function run() {
  const browser = await chromium.launch({
    channel: "msedge",
    args: ["--use-gl=angle", "--use-angle=default"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3456", { waitUntil: "load" });
  await page.waitForTimeout(4000); // wait for 3D world to initialize

  const points = [
    { name: "01_signal", p: 0.045 },
    { name: "02_gate", p: 0.18 },
    { name: "03_archive_about", p: 0.28 },
    { name: "04_archive_bio", p: 0.30 },
    { name: "05_archive_exp", p: 0.33 },
    { name: "06_workshop_m1", p: 0.42 },
    { name: "07_workshop_dev", p: 0.445 },
    { name: "08_project_p1", p: 0.52 },
    { name: "09_project_p2", p: 0.575 },
    { name: "10_project_p3", p: 0.635 },
    { name: "11_project_p4", p: 0.69 },
    { name: "12_lab", p: 0.75 },
    { name: "13_observation", p: 0.89 },
    { name: "14_transmission", p: 0.98 },
  ];

  if (!fs.existsSync("audit_screens")) {
    fs.mkdirSync("audit_screens");
  }

  for (const pt of points) {
    await page.evaluate((targetProgress) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, targetProgress * max);
    }, pt.p);
    await page.waitForTimeout(1600); // let spring and shaders settle
    await page.screenshot({ path: `audit_screens/${pt.name}.png` });
    console.log(`Captured ${pt.name}`);
  }

  await page.close();

  // Mobile viewport audit (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto("http://localhost:3456", { waitUntil: "load" });
  await mobilePage.waitForTimeout(4000);

  const mobilePoints = [
    { name: "m_01_signal", p: 0.045 },
    { name: "m_02_about", p: 0.28 },
    { name: "m_03_project_p2", p: 0.575 },
    { name: "m_04_transmission", p: 0.98 },
  ];

  for (const pt of mobilePoints) {
    await mobilePage.evaluate((targetProgress) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, targetProgress * max);
    }, pt.p);
    await mobilePage.waitForTimeout(1600);
    await mobilePage.screenshot({ path: `audit_screens/${pt.name}.png` });
    console.log(`Captured ${pt.name}`);
  }

  await mobilePage.close();
  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
