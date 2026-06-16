// server.js
// Entry point — menjalankan server Express

require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/lib/prisma');

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    // Test koneksi database
    await prisma.$connect();
    console.log('✅ Database terkoneksi.');

    // Jalankan migrasi "stok per menu"
    console.log('🔄 Memulai migrasi stok berbasis menu...');
    const menus = await prisma.menu.findMany({ include: { recipes: true } });
    const menuIds = menus.map(m => m.id);

    // 1. Hapus transaksi stok lama yang tidak terhubung dengan menu
    await prisma.stockTransaction.deleteMany({
      where: {
        NOT: { stockItemId: { in: menuIds } }
      }
    });

    // 2. Hapus resep lama yang bukan mapping 1:1 menu-ke-dirinya-sendiri
    await prisma.menuRecipe.deleteMany({
      where: {
        NOT: {
          AND: [
            { menuId: { in: menuIds } },
            { stockItemId: { in: menuIds } }
          ]
        }
      }
    });

    // Hapus resep yang tidak match menuId == stockItemId
    const allRecipes = await prisma.menuRecipe.findMany();
    for (const recipe of allRecipes) {
      if (recipe.menuId !== recipe.stockItemId) {
        await prisma.menuRecipe.delete({ where: { id: recipe.id } });
      }
    }

    // 3. Hapus StockItem lama yang bukan menu
    await prisma.stockItem.deleteMany({
      where: {
        NOT: { id: { in: menuIds } }
      }
    });

    // 4. Pastikan setiap menu memiliki StockItem dan MenuRecipe (Lacak Stok aktif secara default)
    for (const menu of menus) {
      let stockItem = await prisma.stockItem.findUnique({ where: { id: menu.id } });
      if (!stockItem) {
        stockItem = await prisma.stockItem.create({
          data: {
            id: menu.id,
            name: menu.name,
            unit: 'porsi',
            qty: 20, // berikan stok default 20 agar tidak kosong
            minQty: 0
          }
        });
      } else {
        await prisma.stockItem.update({
          where: { id: menu.id },
          data: { name: menu.name }
        });
      }

      // Pastikan ada MenuRecipe 1:1
      const recipeExist = await prisma.menuRecipe.findFirst({
        where: { menuId: menu.id, stockItemId: menu.id }
      });
      if (!recipeExist) {
        await prisma.menuRecipe.create({
          data: {
            menuId: menu.id,
            stockItemId: menu.id,
            qty: 1
          }
        });
      }
    }
    console.log('✅ Migrasi stok berbasis menu selesai.');

    app.listen(PORT, () => {
      console.log(`🚀 Rakit Coffee Backend berjalan di http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Gagal terkoneksi ke database:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🛑 Server dihentikan.');
  process.exit(0);
});

main();
