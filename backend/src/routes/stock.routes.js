const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Ambil semua stok
router.get('/items', async (req, res) => {
  try {
    const items = await prisma.stockItem.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tambah stok item baru
router.post('/items', async (req, res) => {
  try {
    const { name, unit, minQty } = req.body;
    const newItem = await prisma.stockItem.create({
      data: { name, unit, minQty: parseFloat(minQty) || 0, qty: 0 }
    });
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update stok item
router.put('/items/:id', async (req, res) => {
  try {
    const { name, unit, minQty } = req.body;
    const updated = await prisma.stockItem.update({
      where: { id: req.params.id },
      data: { name, unit, minQty: parseFloat(minQty) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hapus stok item
router.delete('/items/:id', async (req, res) => {
  try {
    await prisma.stockItem.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ambil riwayat transaksi stok
router.get('/transactions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }
    
    const transactions = await prisma.stockTransaction.findMany({
      where: dateFilter.gte ? { date: dateFilter } : {},
      include: {
        stockItem: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tambah transaksi stok (Masuk/Keluar)
router.post('/transactions', async (req, res) => {
  try {
    const { stockItemId, type, qty, notes } = req.body;
    
    const parsedQty = parseFloat(qty);
    if (!['IN', 'OUT'].includes(type)) throw new Error('Invalid type');

    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const t = await tx.stockTransaction.create({
        data: {
          stockItemId,
          type,
          qty: parsedQty,
          notes
        }
      });
      
      // Update item quantity
      const item = await tx.stockItem.findUnique({ where: { id: stockItemId } });
      const newQty = type === 'IN' ? item.qty + parsedQty : item.qty - parsedQty;
      
      await tx.stockItem.update({
        where: { id: stockItemId },
        data: { qty: newQty }
      });
      
      return t;
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ambil resep/bahan untuk menu tertentu
router.get('/recipes/:menuId', async (req, res) => {
  try {
    const recipes = await prisma.menuRecipe.findMany({
      where: { menuId: req.params.menuId },
      include: { stockItem: true }
    });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tambah resep/bahan ke menu
router.post('/recipes', async (req, res) => {
  try {
    const { menuId, stockItemId, qty } = req.body;
    const recipe = await prisma.menuRecipe.create({
      data: {
        menuId,
        stockItemId,
        qty: parseFloat(qty)
      },
      include: { stockItem: true }
    });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update resep/bahan menu
router.put('/recipes/:id', async (req, res) => {
  try {
    const { stockItemId, qty } = req.body;
    const recipe = await prisma.menuRecipe.update({
      where: { id: req.params.id },
      data: {
        stockItemId,
        qty: parseFloat(qty)
      },
      include: { stockItem: true }
    });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hapus resep/bahan dari menu
router.delete('/recipes/:id', async (req, res) => {
  try {
    await prisma.menuRecipe.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
