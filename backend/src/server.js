const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const documentRoutes = require('./routes/documentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Serve static frontend files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/docs', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'STICKY PAD API' });
});

// Fallback to index.html for single-page app routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Express server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STICKY PAD Express Web App running on port ${PORT}`);
  });
});
