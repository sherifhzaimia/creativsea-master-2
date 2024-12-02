const puppeteer = require('puppeteer');
const sites = require('../config/sites');

let browser;

async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
      headless: true
    });
  }
  return browser;
}

async function login(siteName, credentials) {
  console.log(`Starting login process for ${siteName}...`);
  const site = sites[siteName];
  
  if (!site) {
    throw new Error(`Site configuration not found for ${siteName}`);
  }

  try {
    const browser = await initBrowser();
    const page = await browser.newPage();
    
    // Set a reasonable navigation timeout
    page.setDefaultNavigationTimeout(30000);

    console.log(`Navigating to ${site.loginUrl}...`);
    await page.goto(site.loginUrl, { waitUntil: 'networkidle0' });

    // Wait for form elements
    await page.waitForSelector(site.selectors.username);
    await page.waitForSelector(site.selectors.password);
    await page.waitForSelector(site.selectors.loginButton);

    console.log('Entering credentials...');
    await page.type(site.selectors.username, credentials.username);
    await page.type(site.selectors.password, credentials.password);

    // Click login button and wait for navigation
    await Promise.all([
      site.waitForNavigation ? page.waitForNavigation({ waitUntil: 'networkidle0' }) : Promise.resolve(),
      page.click(site.selectors.loginButton)
    ]);

    console.log('Getting cookies...');
    const cookies = await page.cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === site.cookies.session);

    if (!sessionCookie) {
      throw new Error(`Session cookie not found for ${siteName}`);
    }

    await page.close();
    return { token: sessionCookie };
  } catch (error) {
    console.error(`Login error for ${siteName}:`, error);
    throw error;
  }
}

async function cleanup() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

module.exports = {
  login,
  cleanup
};
