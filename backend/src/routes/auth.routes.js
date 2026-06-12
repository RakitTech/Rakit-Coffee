const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rakit-coffee-secret-key-ganti-ini';

// ============================================================
// POST /api/auth/login
// Otentikasi Admin
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kredensial default sesuai spesifikasi sistem
    if (username === 'admin' && password === 'admin123') {
      // Generate token JWT
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ success: true, token });
    }

    return res.status(401).json({ success: false, error: 'Username atau password salah.' });
  } catch (error) {
    console.error('[POST /auth/login]', error);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
