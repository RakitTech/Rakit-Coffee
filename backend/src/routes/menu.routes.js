const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// ============================================================
// GET /api/menus
// Ambil semua menu
// ============================================================
router.get('/', async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { createdAt: 'asc' },
    });

    res.json(menus); // Kirim langsung array menu (kompatibel dengan JSON.parse(localStorage.getItem('rakit_menu')))
  } catch (error) {
    console.error('[GET /menus]', error);
    res.status(500).json({ error: 'Gagal mengambil data menu.' });
  }
});

// ============================================================
// GET /api/menus/:id
// Ambil satu menu berdasarkan ID
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: req.params.id },
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu tidak ditemukan.' });
    }

    res.json(menu);
  } catch (error) {
    console.error('[GET /menus/:id]', error);
    res.status(500).json({ error: 'Gagal mengambil data menu.' });
  }
});

// ============================================================
// POST /api/menus
// Tambah menu baru
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { id, name, category, desc, price, image, available = true, modifierGroups = [] } = req.body;

    if (!id || !name || !category || price === undefined) {
      return res.status(400).json({
        error: 'Field id, name, category, dan price wajib diisi.',
      });
    }

    const newMenu = await prisma.menu.create({
      data: {
        id,
        name,
        category,
        desc: desc || null,
        price: parseInt(price),
        image: image || null,
        available: Boolean(available),
        modifierGroups: modifierGroups || [],
      },
    });

    res.status(201).json(newMenu);
  } catch (error) {
    console.error('[POST /menus]', error);
    res.status(500).json({ error: 'Gagal menambahkan menu.' });
  }
});

// ============================================================
// PUT /api/menus/:id
// Edit data menu
// ============================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, desc, price, image, available, modifierGroups } = req.body;

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Menu tidak ditemukan.' });
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(desc !== undefined && { desc }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(image !== undefined && { image }),
        ...(available !== undefined && { available: Boolean(available) }),
        ...(modifierGroups !== undefined && { modifierGroups }),
      },
    });

    res.json(updatedMenu);
  } catch (error) {
    console.error('[PUT /menus/:id]', error);
    res.status(500).json({ error: 'Gagal memperbarui menu.' });
  }
});

// ============================================================
// DELETE /api/menus/:id
// Hapus menu
// ============================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Menu tidak ditemukan.' });
    }

    await prisma.menu.delete({ where: { id } });

    res.json({ success: true, message: 'Menu berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /menus/:id]', error);
    res.status(500).json({ error: 'Gagal menghapus menu.' });
  }
});

module.exports = router;
