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
      include: { recipes: true }
    });

    const stockItems = await prisma.stockItem.findMany();
    const stockMap = {};
    stockItems.forEach(s => { stockMap[s.id] = s.qty; });

    // Evaluasi ketersediaan berdasarkan stok
    const evaluatedMenus = menus.map(menu => {
      let stockAvailable = true;
      let remainingStock = null;

      if (menu.recipes && menu.recipes.length > 0) {
        const stocks = [];
        for (const recipe of menu.recipes) {
          const qtyInStock = stockMap[recipe.stockItemId] || 0;
          if (qtyInStock < recipe.qty) {
            stockAvailable = false;
          }
          stocks.push(Math.floor(qtyInStock / recipe.qty));
        }
        remainingStock = Math.min(...stocks);
      }
      
      // Evaluasi modifier jika memakai sistem stok di modifier
      let updatedModifierGroups = menu.modifierGroups || [];
      if (updatedModifierGroups.length > 0) {
        updatedModifierGroups = updatedModifierGroups.map(group => {
          return {
            ...group,
            options: group.options.map(opt => {
              let optAvailable = true;
              if (opt.stockItemId && opt.stockQty) {
                if ((stockMap[opt.stockItemId] || 0) < parseFloat(opt.stockQty)) {
                  optAvailable = false;
                }
              }
              return { ...opt, available: optAvailable };
            })
          };
        });
      }

      return {
        ...menu,
        modifierGroups: updatedModifierGroups,
        available: menu.available && stockAvailable, // Override available jika stok habis
        stockAvailable: stockAvailable, // Tambahkan ini agar frontend tahu alasan disabled
        remainingStock: remainingStock !== null ? Math.max(0, remainingStock) : null
      };
    });

    res.json(evaluatedMenus);
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
      include: { recipes: true }
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

// Tambah menu baru
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { id, name, category, desc, price, image, available = true, modifierGroups = [], trackStock = false, minStock = 0 } = req.body;

    if (!id || !name || !category || price === undefined) {
      return res.status(400).json({
        error: 'Field id, name, category, dan price wajib diisi.',
      });
    }

    if (trackStock) {
      const existingStock = await prisma.stockItem.findUnique({ where: { id } });
      if (!existingStock) {
        await prisma.stockItem.create({
          data: {
            id,
            name,
            unit: 'porsi',
            qty: 10, // default stock on creation
            minQty: parseFloat(minStock) || 0
          }
        });
      }
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
        recipes: trackStock ? {
          create: [{ stockItemId: id, qty: 1 }]
        } : undefined
      },
      include: { recipes: true }
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
    const { name, category, desc, price, image, available, modifierGroups, trackStock, minStock } = req.body;

    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Menu tidak ditemukan.' });
    }

    // Sync nama ke StockItem jika ada
    if (name !== undefined) {
      const stockExist = await prisma.stockItem.findUnique({ where: { id } });
      if (stockExist) {
        await prisma.stockItem.update({
          where: { id },
          data: { name }
        });
      }
    }

    if (trackStock !== undefined) {
      if (trackStock) {
        // Pastikan StockItem ada
        let stockItem = await prisma.stockItem.findUnique({ where: { id } });
        if (!stockItem) {
          await prisma.stockItem.create({
            data: {
              id,
              name: name || existing.name,
              unit: 'porsi',
              qty: 10,
              minQty: parseFloat(minStock) || 0
            }
          });
        } else if (minStock !== undefined) {
          await prisma.stockItem.update({
            where: { id },
            data: { minQty: parseFloat(minStock) || 0 }
          });
        }
      } else {
        // Hapus mapping stock jika dinonaktifkan
        await prisma.menuRecipe.deleteMany({ where: { menuId: id } });
        await prisma.stockTransaction.deleteMany({ where: { stockItemId: id } });
        await prisma.stockItem.deleteMany({ where: { id } });
      }
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
        ...(trackStock !== undefined && {
          recipes: trackStock ? {
            deleteMany: {},
            create: [{ stockItemId: id, qty: 1 }]
          } : {
            deleteMany: {}
          }
        })
      },
      include: { recipes: true }
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

    await prisma.stockTransaction.deleteMany({ where: { stockItemId: id } });
    await prisma.stockItem.deleteMany({ where: { id } });
    await prisma.menu.delete({ where: { id } });

    res.json({ success: true, message: 'Menu berhasil dihapus.' });
  } catch (error) {
    console.error('[DELETE /menus/:id]', error);
    res.status(500).json({ error: 'Gagal menghapus menu.' });
  }
});

module.exports = router;
