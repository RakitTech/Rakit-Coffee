const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses seeding bahan baku dan resep...");

  // 1. Buat Stock Items
  const stockItemsData = [
    { name: 'Biji Kopi House Blend', unit: 'gram', minQty: 1000, qty: 5000 },
    { name: 'Biji Kopi Single Origin', unit: 'gram', minQty: 500, qty: 2000 },
    { name: 'Susu Fresh Milk', unit: 'ml', minQty: 2000, qty: 10000 },
    { name: 'Sirup Gula Aren', unit: 'ml', minQty: 1000, qty: 5000 },
    { name: 'Sirup Vanilla', unit: 'ml', minQty: 500, qty: 2000 },
    { name: 'Uji Matcha Powder', unit: 'gram', minQty: 500, qty: 2000 },
    { name: 'Selai Strawberry', unit: 'gram', minQty: 500, qty: 2000 },
    { name: 'Kentang Goreng (Frozen)', unit: 'gram', minQty: 2000, qty: 10000 },
    { name: 'Sosis Sapi', unit: 'pcs', minQty: 50, qty: 200 },
    { name: 'Nugget Ayam', unit: 'pcs', minQty: 50, qty: 200 },
    { name: 'Singkong Keju (Frozen)', unit: 'gram', minQty: 1000, qty: 5000 },
    { name: 'Keju Parut', unit: 'gram', minQty: 500, qty: 2000 },
    { name: 'Pisang', unit: 'pcs', minQty: 20, qty: 100 },
    { name: 'Saus Coklat', unit: 'ml', minQty: 500, qty: 2000 },
    { name: 'Roti Tawar Tebal', unit: 'slice', minQty: 20, qty: 100 },
    { name: 'Selai Srikaya', unit: 'gram', minQty: 500, qty: 2000 },
    { name: 'Cireng (Frozen)', unit: 'pcs', minQty: 50, qty: 300 },
    { name: 'Tahu Putih', unit: 'pcs', minQty: 20, qty: 100 },
    { name: 'Dimsum Ayam (Frozen)', unit: 'pcs', minQty: 50, qty: 300 },
    { name: 'Dada Ayam Fillet', unit: 'gram', minQty: 2000, qty: 10000 },
    { name: 'Nasi Putih', unit: 'porsi', minQty: 10, qty: 50 },
    { name: 'Croissant Mentega', unit: 'pcs', minQty: 10, qty: 50 },
    { name: 'Croissant Cokelat', unit: 'pcs', minQty: 10, qty: 50 },
    { name: 'Dough Pizza', unit: 'slice', minQty: 10, qty: 50 },
    { name: 'Keju Mozarella', unit: 'gram', minQty: 1000, qty: 5000 },
    { name: 'Pepperoni Sapi', unit: 'slice', minQty: 50, qty: 200 },
    { name: 'Oat Milk', unit: 'ml', minQty: 1000, qty: 5000 }, // For modifiers
    { name: 'Extra Shot Espresso', unit: 'shot', minQty: 20, qty: 100 }
  ];

  const stocks = {};
  for (const item of stockItemsData) {
    let stock = await prisma.stockItem.findFirst({ where: { name: item.name } });
    if (!stock) {
      stock = await prisma.stockItem.create({ data: item });
    }
    stocks[item.name] = stock.id;
  }
  console.log("Stock Items berhasil dibuat.");

  // 2. Fetch all menus
  const menus = await prisma.menu.findMany();
  console.log(`Ditemukan ${menus.length} menu di database.`);

  const recipeMap = {
    'Classic Cappuccino': [
      { stockName: 'Biji Kopi House Blend', qty: 18 },
      { stockName: 'Susu Fresh Milk', qty: 150 }
    ],
    'V60 Manual Brew': [
      { stockName: 'Biji Kopi Single Origin', qty: 15 }
    ],
    'Mix Platter': [
      { stockName: 'Kentang Goreng (Frozen)', qty: 100 },
      { stockName: 'Sosis Sapi', qty: 2 },
      { stockName: 'Nugget Ayam', qty: 4 }
    ],
    'French Fries': [
      { stockName: 'Kentang Goreng (Frozen)', qty: 150 }
    ],
    'Cassava Cheese': [
      { stockName: 'Singkong Keju (Frozen)', qty: 150 },
      { stockName: 'Keju Parut', qty: 20 }
    ],
    'Pisang Goreng Coklat': [
      { stockName: 'Pisang', qty: 2 },
      { stockName: 'Saus Coklat', qty: 30 }
    ],
    'Roti Bakar Kaya': [
      { stockName: 'Roti Tawar Tebal', qty: 2 },
      { stockName: 'Selai Srikaya', qty: 30 }
    ],
    'Cireng Bumbu Rujak': [
      { stockName: 'Cireng (Frozen)', qty: 8 }
    ],
    'Tahu Cabe Garam': [
      { stockName: 'Tahu Putih', qty: 2 }
    ],
    'Dimsum Ayam': [
      { stockName: 'Dimsum Ayam (Frozen)', qty: 4 }
    ],
    'Katsu Ayam': [
      { stockName: 'Dada Ayam Fillet', qty: 150 },
      { stockName: 'Nasi Putih', qty: 1 }
    ],
    'Fried Chicken': [
      { stockName: 'Dada Ayam Fillet', qty: 150 },
      { stockName: 'Nasi Putih', qty: 1 }
    ],
    'Butter Croissant': [
      { stockName: 'Croissant Mentega', qty: 1 }
    ],
    'Chocolate Croissant': [
      { stockName: 'Croissant Cokelat', qty: 1 }
    ],
    'Matcha Sakura Latte': [
      { stockName: 'Uji Matcha Powder', qty: 15 },
      { stockName: 'Susu Fresh Milk', qty: 200 }
    ],
    'Strawberry Fresh Milk': [
      { stockName: 'Susu Fresh Milk', qty: 200 },
      { stockName: 'Selai Strawberry', qty: 40 }
    ],
    'Pizza Slice Mozarella': [
      { stockName: 'Dough Pizza', qty: 1 },
      { stockName: 'Keju Mozarella', qty: 30 }
    ],
    'Slice Pepperoni': [
      { stockName: 'Dough Pizza', qty: 1 },
      { stockName: 'Keju Mozarella', qty: 20 },
      { stockName: 'Pepperoni Sapi', qty: 5 }
    ],
    'Gula Aren Latte': [
      { stockName: 'Biji Kopi House Blend', qty: 18 },
      { stockName: 'Susu Fresh Milk', qty: 120 },
      { stockName: 'Sirup Gula Aren', qty: 25 }
    ]
  };

  // 3. Buat Recipes & Update Modifiers
  for (const menu of menus) {
    const recipes = recipeMap[menu.name];
    if (recipes) {
      // Hapus resep lama jika ada
      await prisma.menuRecipe.deleteMany({ where: { menuId: menu.id } });
      
      // Buat resep baru
      for (const r of recipes) {
        if (stocks[r.stockName]) {
          await prisma.menuRecipe.create({
            data: {
              menuId: menu.id,
              stockItemId: stocks[r.stockName],
              qty: r.qty
            }
          });
        }
      }
      console.log(`Resep untuk ${menu.name} berhasil dibuat.`);
    }

    // 4. Update Modifiers to link to Stock (Contoh: Susu Oat)
    if (menu.modifierGroups && Array.isArray(menu.modifierGroups)) {
      let modifierUpdated = false;
      const updatedModifiers = menu.modifierGroups.map(group => {
        return {
          ...group,
          options: group.options.map(opt => {
            if (opt.name.toLowerCase().includes('oat') && stocks['Oat Milk']) {
              modifierUpdated = true;
              return { ...opt, stockItemId: stocks['Oat Milk'], stockQty: 150 };
            }
            if (opt.name.toLowerCase().includes('extra shot') && stocks['Extra Shot Espresso']) {
              modifierUpdated = true;
              return { ...opt, stockItemId: stocks['Extra Shot Espresso'], stockQty: 1 };
            }
            return opt;
          })
        };
      });

      if (modifierUpdated) {
        await prisma.menu.update({
          where: { id: menu.id },
          data: { modifierGroups: updatedModifiers }
        });
        console.log(`Modifier untuk ${menu.name} berhasil diupdate.`);
      }
    }
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
