const express = require('express');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');
const categoryRoutes = require('./routes/category.routes');
const cmsRoutes = require('./routes/cms.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// ============================================================
// Middleware
// ============================================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' })); // 10mb untuk base64 gambar
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Health Check
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Rakit Coffee Backend',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cms', cmsRoutes);

// ============================================================
// 404 Handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint [${req.method}] ${req.path} tidak ditemukan.`,
  });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server.',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

module.exports = app;
