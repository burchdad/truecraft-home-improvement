import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  for (const [width, height] of [
    [360, 844],
    [768, 844],
    [1024, 844],
    [740, 360],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    for (const route of ["/", "/our-work/", "/request-estimate/"]) {
      await page.goto("http://127.0.0.1:4173" + route);
      for (const img of await page.locator("img:visible").all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((i) => i.decode());
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `docs/qa/${route === "/" ? "home" : route.split("/")[1]}-${width}x${height}.jpg`,
        fullPage: true,
        quality: 75,
      });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
