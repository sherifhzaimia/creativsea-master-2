require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const authService = require('./services/auth.service');

// إعداد Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const app = express();
const port = process.env.PORT || 3000;

app.use(limiter);
app.use(express.json());
app.use(helmet());

// إعداد CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

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
  siteName: String,
  name: String,
  value: String,
  domain: String,
  path: String,
  expires: Number,
  httpOnly: Boolean,
  secure: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);

// مسار لجلب الجلسة
app.get("/get-session/:siteName", async (req, res) => {
  try {
    const { siteName } = req.params;
    const session = await Session.findOne({ siteName }).sort({ createdAt: -1 });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'No session found for this site' 
      });
    }

    res.json({ success: true, token: session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error fetching session' 
    });
  }
});

// دالة معالجة الجلسة
async function handleSession(req, res) {
  try {
    const { siteName } = req.params;
    const credentials = {
      username: process.env[`${siteName.toUpperCase()}_EMAIL`],
      password: process.env[`${siteName.toUpperCase()}_PASSWORD`]
    };

    console.log(`Starting session for ${siteName}...`);
    const result = await authService.login(siteName, credentials);
    
    // حذف الجلسات القديمة للموقع
    await Session.deleteMany({ siteName });

    // حفظ الجلسة الجديدة
    const sessionData = new Session({
      siteName,
      ...result.token
    });

    await sessionData.save();
    console.log(`Session saved for ${siteName}`);

    res.json({ success: true, token: sessionData });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error starting session' 
    });
  }
}

// مسار لبدء جلسة جديدة (يدعم GET و POST)
app.get("/start-session/:siteName", handleSession);
app.post("/start-session/:siteName", handleSession);

// مسار الصحة
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    sites: Object.keys(require('./config/sites'))
  });
});

// تنظيف الموارد عند إيقاف التطبيق
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...');
  await authService.cleanup();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
