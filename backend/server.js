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
