// src/lib/prisma.js
// Singleton Prisma Client — satu instance untuk seluruh aplikasi

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
