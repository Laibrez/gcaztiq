const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture page errors
  page.on('pageerror', error => {
    console.error('[PAGE ERROR]', error.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[CONSOLE ERROR]', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:8081/login');
    // Log in
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Go to Tax Center
    await page.goto('http://localhost:8081/tax-center');
    await page.waitForTimeout(2000);
    
    console.log("Done checking tax center.");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
})();
