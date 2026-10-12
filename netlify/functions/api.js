const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('../../backend/src/config/db');
const documentRoutes = require('../../backend/src/routes/documentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in function middleware:', err);
  }
  next();
});

// API Routes
app.use('/api/docs', documentRoutes);
app.use('/.netlify/functions/api/docs', documentRoutes);

// Health check endpoint
app.get(['/api/health', '/.netlify/functions/api/health'], (req, res) => {
  res.json({ status: 'ok', service: 'STICKY PAD API' });
});

module.exports.handler = serverless(app);
