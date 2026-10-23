import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const routes = [
  "/",
  "/services/",
  "/our-work/",
  "/about/",
  "/request-estimate/",
  "/privacy/",
];
for (const width of [360, 390, 768, 1024, 1440])
  test(`routes, images, links and accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(
        await page.locator("meta[name=robots]").getAttribute("content"),
      ).toContain("noindex");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const image of await page.locator("img:visible").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty("complete", true);
        await expect
          .poll(() => image.evaluate((i) => i.naturalWidth))
          .toBeGreaterThan(0);
      }
      expect(
        await page
          .locator("img:visible")
          .evaluateAll((imgs) =>
            imgs.every((i) => i.complete && i.naturalWidth > 0),
          ),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
      for (const href of await page
        .locator("a")
        .evaluateAll((as) =>
          as
            .map((a) => a.getAttribute("href"))
            .filter((h) => h.startsWith("/")),
        )) {
        const r = await page.request.get(href);
        expect(r.status(), href).toBe(200);
      }
      if (
        [390, 1440].includes(width) &&
        ["/", "/our-work/", "/request-estimate/"].includes(route)
      ) {
        await page.evaluate(() => scrollTo(0, 0));
        await fs.mkdir("docs/qa", { recursive: true });
        await page.screenshot({
          path: `docs/qa/${route === "/" ? "home" : route.split("/")[1]}-${width}.png`,
          fullPage: true,
        });
      }
    }
  });
test("mobile menu keyboard, filters, service preselection and safe local form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: /Menu/ });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#main-nav a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.goto("/our-work/");
  await page.getByRole("button", { name: "Outdoors", exact: true }).click();
  await expect(page.locator("[data-category]:visible")).toHaveCount(4);
  await page.getByRole("button", { name: "All photographs" }).click();
  await expect(page.locator("[data-category]:visible")).toHaveCount(16);
  await page.goto("/services/");
  await expect(page.locator("#interiors").getByRole("link", { name: "Call to discuss your project" })).toHaveAttribute("href", "tel:+19032750361");
  await page.goto("/request-estimate/?project=interiors");
  await expect(page.locator("#project")).toHaveValue("interiors");
  let posts = 0;
  page.on("request", (r) => {
    if (r.method() === "POST") posts++;
  });
  await page.getByRole("button", { name: "Check details locally" }).click();
  await expect(page.locator("#error-summary")).toBeFocused();
  await expect(page.locator("#name")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Your name").fill("Synthetic test");
  await page.getByLabel("Preferred contact method").selectOption("email");
  await page.getByLabel("Email address").fill("test@example.invalid");
  await page.getByLabel("Town or ZIP").fill("Frankston");
  await page
    .getByLabel("Tell us about your project")
    .fill("Synthetic local validation only.");
  await page.getByRole("button", { name: "Check details locally" }).dblclick();
  await expect(page.getByRole("status")).toContainText(
    "Nothing was sent or saved",
  );
  await expect(
    page.getByRole("button", { name: "Sending unavailable" }),
  ).toBeDisabled();
  await expect(page.getByLabel("Your name")).toHaveValue("Synthetic test");
  expect(posts).toBe(0);
});
test("narrow landscape, enlarged text and script failure", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 740, height: 360 });
  for (const route of routes) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.evaluate(() => {
    document.styleSheets[0].insertRule("body { zoom: 2; }", 0);
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const nojs = await context.newPage();
  await nojs.goto("http://127.0.0.1:4173/request-estimate/");
  await expect(nojs.locator("#main-nav")).toBeVisible();
  await expect(
    nojs.getByRole("button", { name: "Sending unavailable" }),
  ).toBeDisabled();
  await expect(
    nojs.locator('a[href="tel:+19032750361"]').first(),
  ).toBeVisible();
  await context.close();
});
