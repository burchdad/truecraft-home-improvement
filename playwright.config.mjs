import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 60000,
  workers: 2,
  use: {
    baseURL: `http://127.0.0.1:${process.env.PORT || 4173}`,
    browserName: "chromium",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm start",
    url: `http://127.0.0.1:${process.env.PORT || 4173}`,
    reuseExistingServer: true,
  },
  reporter: "list",
});
