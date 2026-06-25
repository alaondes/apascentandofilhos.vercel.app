const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
app.use(express.static('dist'));
const server = app.listen(3001, async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully');
    await browser.close();
  } catch (err) {
    console.error('TEST ERROR:', err);
  } finally {
    server.close();
  }
});
