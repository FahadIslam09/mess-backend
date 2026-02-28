require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // নতুন যুক্ত হলো

// Import Routes
const memberRoutes = require('./routes/memberRoutes');
const depositRoutes = require('./routes/depositRoutes');
const mealRoutes = require('./routes/mealRoutes');
const bazarRoutes = require('./routes/bazarRoutes');
const reportRoutes = require('./routes/reportRoutes');
const managerRoutes = require('./routes/managerRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ==========================================
// --- SECURITY: LOGIN API ---
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { pin } = req.body;
    
    // .env ফাইলের পিনের সাথে চেক করা
    if (pin === process.env.SECRET_PIN) {
        // পিন মিললে একটি ডিজিটাল টোকেন তৈরি করে ফ্রন্টএন্ডে পাঠানো হবে (৩০ দিনের মেয়াদ)
        const token = jwt.sign({ role: 'manager' }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid PIN' });
    }
});

// ==========================================
// --- UPTIME ROBOT / HEALTH CHECK ROUTE ---
// ==========================================
// UptimeRobot এর GET এবং HEAD রিকোয়েস্ট অ্যালাউ করা হলো
app.get('/', (req, res) => res.status(200).send('Mess Management Backend is running perfectly! 🚀'));
app.head('/', (req, res) => res.status(200).send());

// ==========================================
// --- SECURITY: GLOBAL AUTH MIDDLEWARE ---
// ==========================================
// এই গার্ড চেক করবে ইউজারের কাছে আসল টোকেন আছে কি না!
const protect = (req, res, next) => {
    // GET রিকোয়েস্ট (শুধু ডেটা দেখার জন্য) সবার জন্য উন্মুক্ত থাকবে
    if (req.method === 'GET') return next(); 
    
    // লগিন করার রাউটটিও সবার জন্য উন্মুক্ত থাকবে
    if (req.path === '/api/auth/login') return next();

    // কেউ যদি ডেটা এডিট, ডিলিট বা অ্যাড করতে চায় (POST, PUT, DELETE), তবে টোকেন চেক করবে
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1]; // "Bearer {token}" থেকে শুধু টোকেনটা নেওয়া
            jwt.verify(token, process.env.JWT_SECRET); // টোকেন ভেরিফাই করা
            next(); // টোকেন সঠিক হলে তাকে কাজ করতে দেওয়া হবে
        } catch (error) {
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// গার্ডটিকে পুরো অ্যাপে চালু করে দেওয়া হলো
app.use(protect);

// UptimeRobot বা Health Check এর জন্য রুট (/)
app.get('/', (req, res) => {
    res.status(200).send('Mess Management Backend is running perfectly! 🚀');
});

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/bazar', bazarRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/settings', settingRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));