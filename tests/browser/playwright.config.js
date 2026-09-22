const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'customer-paths.spec.js',
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8765',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'off'
  },
  webServer: {
    command: 'python3 -m http.server 8765 --bind 127.0.0.1 --directory ../..',
    url: 'http://127.0.0.1:8765/resources.html',
    reuseExistingServer: false,
    timeout: 15000
  }
});
