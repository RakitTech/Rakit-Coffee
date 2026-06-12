const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Helper generator ID format
function generateOrderId() {
  return 'ORD-' + Math.floor(1000 + Math.random() * 9000);
}

function generateItemId() {
  return 'ITM-' + Math.floor(10000 + Math.random() * 90000);
}

// ============================================================
// GET /api/orders
// Ambil semua pesanan
// ============================================================
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    // Sesuaikan format agar persis seperti objek JavaScript di store.js
    const formatted = orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      table: o.table,
      total: o.total,
      status: o.status,
      timestamp: o.timestamp.toISOString(),
      completedAt: o.completedAt ? o.completedAt.toISOString() : null,
      items: o.items.map((i) => ({
        itemId: i.itemId,
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        modifierTotal: i.modifierTotal,
        selectedModifiers: i.selectedModifiers,
        note: i.note,
        status: i.status,
        completedAt: i.completedAt ? i.completedAt.toISOString() : null,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[GET /orders]', error);
    res.status(500).json({ error: 'Gagal mengambil data pesanan.' });
  }
});

// ============================================================
// POST /api/orders
// Buat pesanan baru
// ============================================================
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;

    if (!orderData.customerName || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Field customerName dan items wajib diisi.' });
    }

    let orderId = generateOrderId();
    let attempt = 0;
    while (attempt < 5) {
      const existing = await prisma.order.findUnique({ where: { id: orderId } });
      if (!existing) break;
      orderId = generateOrderId();
      attempt++;
    }

    let calculatedTotal = 0;
    const itemsToCreate = orderData.items.map((item) => {
      const itemId = generateItemId();
      const itemFinalPrice = (item.price || 0) + (item.modifierTotal || 0);
      calculatedTotal += itemFinalPrice * (item.qty || 1);

      return {
        itemId: itemId,
        id: item.id || null,
        name: item.name,
        price: parseInt(item.price) || 0,
        qty: parseInt(item.qty) || 1,
        modifierTotal: parseInt(item.modifierTotal) || 0,
        selectedModifiers: item.selectedModifiers || [],
        note: item.note || null,
        status: 'Diterima',
      };
    });

    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        customerName: orderData.customerName,
        table: orderData.table || '12',
        total: calculatedTotal,
        status: 'Diterima',
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: true,
      },
    });

    // Format response agar persis seperti format yang di-resolve oleh Store.addOrder()
    const responseData = {
      id: newOrder.id,
      customerName: newOrder.customerName,
      table: newOrder.table,
      total: newOrder.total,
      status: newOrder.status,
      timestamp: newOrder.timestamp.toISOString(),
      completedAt: null,
      items: newOrder.items.map((i) => ({
        itemId: i.itemId,
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        modifierTotal: i.modifierTotal,
        selectedModifiers: i.selectedModifiers,
        note: i.note,
        status: i.status,
        completedAt: null,
      })),
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error('[POST /orders]', error);
    res.status(500).json({ error: 'Gagal membuat pesanan.' });
  }
});

// ============================================================
// PATCH /api/orders/:id/status
// Update status keseluruhan pesanan (Diterima -> Dimasak -> Siap)
// ============================================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    const completedAt = status === 'Siap' ? new Date() : null;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        completedAt,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('[PATCH /orders/:id/status]', error);
    res.status(500).json({ error: 'Gagal memperbarui status pesanan.' });
  }
});

// ============================================================
// PATCH /api/orders/:orderId/items/:itemId/status
// Update status item spesifik dalam pesanan
// ============================================================
router.patch('/:orderId/items/:itemId/status', async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const item = await prisma.orderItem.findFirst({
      where: { itemId: itemId, orderId: orderId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item pesanan tidak ditemukan.' });
    }

    const now = new Date();
    const completedAt = status === 'Siap' ? now : null;

    // 1. Update status item
    await prisma.orderItem.update({
      where: { itemId: itemId },
      data: {
        status,
        completedAt,
      },
    });

    // 2. Ambil semua item dari order tersebut untuk kalkulasi status order otomatis
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: orderId },
    });

    const allSiap = allItems.every((i) => i.status === 'Siap');
    const anyDimasak = allItems.some((i) => i.status === 'Dimasak' || i.status === 'Siap');

    let newOrderStatus = null;
    const currentOrder = await prisma.order.findUnique({ where: { id: orderId } });

    if (allSiap) {
      newOrderStatus = 'Siap';
    } else if (anyDimasak && currentOrder.status === 'Diterima') {
      newOrderStatus = 'Dimasak';
    }

    if (newOrderStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newOrderStatus,
          completedAt: newOrderStatus === 'Siap' ? now : currentOrder.completedAt,
        },
      });
    }

    res.json({ success: true, message: 'Status item berhasil diperbarui.' });
  } catch (error) {
    console.error('[PATCH /orders/:orderId/items/:itemId/status]', error);
    res.status(500).json({ error: 'Gagal memperbarui status item.' });
  }
});

module.exports = router;
