/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 120000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,
    ignoreHTTPSErrors: true,
  },
  reporter: [["list"], ["html", { outputFolder: 'playwright-report' }]],
};
module.exports = config;
