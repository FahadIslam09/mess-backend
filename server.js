require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const memberRoutes = require('./routes/memberRoutes');
const depositRoutes = require('./routes/depositRoutes');
const mealRoutes = require('./routes/mealRoutes');
const bazarRoutes = require('./routes/bazarRoutes');
const reportRoutes = require('./routes/reportRoutes');
const managerRoutes = require('./routes/managerRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/bazar', bazarRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/manager', managerRoutes);

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