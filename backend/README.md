# Rakit Coffee — Backend

REST API backend untuk sistem QR Ordering Rakit Coffee. Dibangun dengan **Node.js + Express + Prisma + PostgreSQL**.

---

## Struktur Folder

```
backend/
├── prisma/
│   ├── schema.prisma     ← Definisi semua tabel database
│   └── seed.js           ← Data awal (menu & meja dari frontend Fathir)
├── src/
│   ├── lib/
│   │   └── prisma.js     ← Singleton Prisma Client
│   ├── routes/
│   │   ├── menu.routes.js   ← /api/menus
│   │   ├── order.routes.js  ← /api/orders
│   │   └── table.routes.js  ← /api/tables
│   └── app.js            ← Setup Express (middleware + routes)
├── server.js             ← Entry point server
├── .env                  ← Konfigurasi environment (buat dari .env.example)
├── .env.example          ← Template konfigurasi
└── package.json
```

---

## Setup & Menjalankan

### 1. Prasyarat
- **Node.js** v18+
- **PostgreSQL** (lokal atau cloud, misal: pgAdmin, Supabase, Neon)

### 2. Konfigurasi Database

Edit file `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rakit_coffee?schema=public"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

> Ganti `postgres`, password, `localhost:5432`, dan `rakit_coffee` sesuai konfigurasi PostgreSQL kamu.

### 3. Buat Database

Buka PostgreSQL client (seperti pgAdmin, psql) dan jalankan:
```sql
CREATE DATABASE rakit_coffee;
```

### 4. Jalankan Migrasi (Buat Semua Tabel)

```bash
npm run db:push
```

### 5. Isi Data Awal (Menu & Meja)

```bash
npm run db:seed
```

### 6. Jalankan Server

```bash
# Mode development (auto-restart)
npm run dev

# Mode production
npm start
```

Server akan berjalan di `http://localhost:3001`

---

## API Endpoints

### Health Check
```
GET  /health
```

### Menu
```
GET    /api/menus                    → Semua menu (support ?available=true)
GET    /api/menus/:id                → Detail satu menu
POST   /api/menus                    → Tambah menu (Admin)
PUT    /api/menus/:id                → Edit menu (Admin)
PATCH  /api/menus/:id/availability   → Toggle tersedia/habis (Admin)
DELETE /api/menus/:id                → Hapus menu (Admin)
```

### Orders
```
GET    /api/orders                          → Semua pesanan (support filter ?date, ?month, ?year)
GET    /api/orders/:id                      → Detail satu pesanan
POST   /api/orders                          → Buat pesanan baru (Customer checkout)
PATCH  /api/orders/:id/payment              → Konfirmasi bayar (Admin)
PATCH  /api/orders/:orderId/items/:itemId/status  → Update status item (Kitchen)
```

### Tables
```
GET    /api/tables            → Semua meja
GET    /api/tables/:number    → Detail satu meja
POST   /api/tables            → Tambah meja
PUT    /api/tables/:id        → Edit meja
DELETE /api/tables/:id        → Hapus meja
```

---

## Perintah Berguna

```bash
npm run db:migrate   # Buat migration baru
npm run db:push      # Push schema langsung ke DB (tanpa migration file)
npm run db:seed      # Isi data awal
npm run db:studio    # Buka Prisma Studio (GUI Database)
npm run db:reset     # Reset database dan jalankan ulang semua migration
```
