import { test, expect } from "@playwright/test";

for (const width of [333, 390]) {
  test.describe(`mobile menu at ${width}px`, () => {
    test.use({
      viewport: { width, height: 844 },
      hasTouch: true,
      isMobile: true,
    });

    test("same-button taps close and reopen; Escape and navigation work", async ({
      page,
    }) => {
      await page.goto("/");
      const menu = page.getByRole("button", { name: /Menu/ });
      const nav = page.locator("#main-nav");
      await expect(nav).toBeHidden();
      for (let cycle = 0; cycle < 2; cycle++) {
        await menu.tap();
        await expect(menu).toHaveAttribute("aria-expanded", "true");
        await expect(nav).toBeVisible();
        await menu.tap();
        await expect(menu).toHaveAttribute("aria-expanded", "false");
        await expect(nav).toBeHidden();
      }
      await menu.tap();
      await page.keyboard.press("Escape");
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(nav).toBeHidden();
      await menu.tap();
      await nav.getByRole("link", { name: "Services", exact: true }).tap();
      await expect(page).toHaveURL(/\/services\/$/);
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(nav).toBeHidden();
      await menu.tap();
      await nav.getByRole("link", { name: "Request an estimate" }).tap();
      await expect(page).toHaveURL(/\/request-estimate\/$/);
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(
        page.getByRole("button", { name: "Sending unavailable" }),
      ).toBeDisabled();
    });

    test("toggle closes when touch blurs the link before click without focusing the button", async ({
      page,
    }) => {
      await page.goto("/");
      const menu = page.getByRole("button", { name: /Menu/ });
      await menu.tap();
      await expect(page.locator("#main-nav a").first()).toBeFocused();
      // Some touch browsers blur the focused link without focusing the tapped button.
      await menu.evaluate((button) =>
        button.addEventListener(
          "pointerdown",
          (event) => {
            event.preventDefault();
            document.activeElement.blur();
          },
          { once: true },
        ),
      );
      await menu.tap();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#main-nav")).toBeHidden();
    });
  });
}
