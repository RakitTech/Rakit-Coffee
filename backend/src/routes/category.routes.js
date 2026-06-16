const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// ============================================================
// GET /api/categories
// Ambil semua kategori (mengembalikan array of strings)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    const categoryNames = categories.map(c => c.name);
    res.json(categoryNames);
  } catch (error) {
    console.error('[GET /categories]', error);
    res.status(500).json({ error: 'Gagal mengambil kategori.' });
  }
});

// ============================================================
// POST /api/categories
// Simpan/perbarui semua kategori (mengganti list lama dengan baru)
// ============================================================
router.post('/', async (req, res) => {
  try {
    const categories = req.body; // Array of strings: ['SIGNATURE', 'KOPI', ...]

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Body harus berupa array kategori.' });
    }

    // Melakukan penggantian list dalam sebuah transaksi
    await prisma.$transaction(async (tx) => {
      // 1. Hapus semua kategori lama
      await tx.category.deleteMany({});
      
      // 2. Buat kategori baru
      if (categories.length > 0) {
        await tx.category.createMany({
          data: categories.map((name, index) => ({ name: name.toUpperCase().trim(), sortOrder: index }))
        });
      }
    });

    res.json({ success: true, message: 'Kategori berhasil diperbarui.' });
  } catch (error) {
    console.error('[POST /categories]', error);
    res.status(500).json({ error: 'Gagal memperbarui kategori.' });
  }
});

module.exports = router;
