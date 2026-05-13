import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-tests',
  timeout: 5000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
  },
});