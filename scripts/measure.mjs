import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const results = [];
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.addInitScript(() => {
      window.lab = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.lab.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (!e.hadRecentInput) window.lab.cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("http://127.0.0.1:4173/");
    await page.waitForTimeout(1500);
    results.push({
      width,
      ...(await page.evaluate(() => ({
        ...window.lab,
        initialTransferredBytes: performance
          .getEntriesByType("resource")
          .reduce((n, e) => n + e.transferSize, 0),
        requests: performance.getEntriesByType("resource").length,
      }))),
    });
    await page.screenshot({ path: `docs/qa/home-first-screen-${width}.png` });
    await page.close();
  }
  await fs.writeFile(
    "docs/qa/local-performance.json",
    JSON.stringify(
      {
        context:
          "Single Chromium run against loopback, cold page, no network/CPU throttling. Not Lighthouse, field CWV or an INP measurement.",
        results,
      },
      null,
      2,
    ),
  );
  console.log(results);
} finally {
  await browser.close();
}
