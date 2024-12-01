const puppeteer = require('puppeteer');
const sites = require('../config/sites');

class AuthService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
      ]
    });
  }

  async login(siteName, credentials) {
    try {
      const siteConfig = sites[siteName];
      if (!siteConfig) {
        throw new Error(`Site configuration not found for: ${siteName}`);
      }

      if (!this.browser) {
        await this.initBrowser();
      }

      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      console.log(`Navigating to ${siteConfig.name} login page...`);
      await page.goto(siteConfig.loginUrl, {
        waitUntil: "networkidle2",
        timeout: 120000,
      });

      console.log('Entering credentials...');
      await page.type(siteConfig.selectors.username, credentials.username);
      await page.type(siteConfig.selectors.password, credentials.password);

      if (siteConfig.waitForNavigation) {
        await Promise.all([
          page.click(siteConfig.selectors.loginButton),
          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 })
        ]);
      } else {
        await page.click(siteConfig.selectors.loginButton);
      }

      const cookies = await page.cookies();
      console.log('Got cookies successfully');

      const sessionToken = cookies.find(
        (cookie) => cookie.name === siteConfig.cookies.session
      );

      await page.close();

      if (!sessionToken) {
        throw new Error('Session token not found');
      }

      return {
        success: true,
        token: sessionToken
      };

    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new AuthService();
