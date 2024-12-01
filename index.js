require('dotenv').config();
const puppeteer = require("puppeteer");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require('express-rate-limit');

// إعداد Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقائق
  max: 100 // الحد الأقصى للطلبات لكل IP
});

const app = express();
const port = process.env.PORT || 3000;

// تطبيق Rate Limiter
app.use(limiter);

// إعداد CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

// إضافة Helmet لتحسين الأمان
const helmet = require('helmet');
app.use(helmet());

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// إنشاء نموذج للجلسات
const sessionSchema = new mongoose.Schema({
  name: String,
  value: String,
  domain: String,
  path: String,
  expires: Number,
  httpOnly: Boolean,
  secure: Boolean,
  createdAt: Date
});

const Session = mongoose.model('Session', sessionSchema);

async function extractSessionToken(res) {
  let browser;
  try {
    browser = await puppeteer.launch({
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

    const page = await browser.newPage();
    
    // إضافة User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    console.log('Navigating to login page...');
    await page.goto("https://creativsea.com/my-account/", {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    console.log('Entering credentials...');
    await page.type("#username", process.env.CREATIVSEA_EMAIL);
    await page.type("#password", process.env.CREATIVSEA_PASSWORD);

    await Promise.all([
      page.click('button[name="login"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 })
    ]);

    const cookies = await page.cookies();
    console.log('Got cookies successfully');

    await Session.deleteMany({});
    console.log("Old sessions deleted");

    const sessionToken = cookies.find(
      (cookie) => cookie.name === "wordpress_logged_in_69f5389998994e48cb1f2b3bcad30e49"
    );

    if (sessionToken) {
      const sessionData = new Session({
        name: sessionToken.name,
        value: sessionToken.value,
        domain: sessionToken.domain,
        path: sessionToken.path,
        expires: sessionToken.expires,
        httpOnly: sessionToken.httpOnly,
        secure: sessionToken.secure,
        createdAt: new Date()
      });

      await sessionData.save();
      console.log("Session token saved successfully");
      res.json({ success: true, token: sessionData });
    } else {
      throw new Error('Session token not found');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred during the process' 
    });
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

// نقطة النهاية الجديدة لجلب أحدث بيانات الجلسة
app.get("/get-session", async (req, res) => {
  try {
    // استرجاع أحدث جلسة من قاعدة البيانات
    const sessionData = await Session.findOne().sort({ _id: -1 });

    if (sessionData) {
      res.json({ success: true, session: sessionData });
    } else {
      res.json({ success: false, message: "No session data found." });
    }
  } catch (error) {
    console.error("Error retrieving session data:", error);
    res.status(500).json({ success: false, message: "Error retrieving session data." });
  }
});

app.get("/start-session", (req, res) => {
  extractSessionToken(res);
});

// إضافة مسار الصحة
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
     });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
