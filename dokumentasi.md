# Dokumentasi Proyek Rakit Coffee

Proyek **Rakit Coffee** adalah sebuah aplikasi web pemesanan dan manajemen kafe/restoran (Point of Sale & Self-Order System). Aplikasi ini dibangun dengan menggunakan arsitektur Vanilla JavaScript yang modular dan Vite sebagai *build tool* serta *development server*.

## 1. Arsitektur & Teknologi Utama
- **Frontend Core:** HTML5, CSS3 (Vanilla), JavaScript (ES6+ Modules).
- **Bundler & Dev Server:** [Vite](https://vitejs.dev/) - Mengompilasi dan menjalankan aplikasi. `vite.config.js` diatur dengan mode *multi-page* (memiliki 3 *entry point* utama).
- **State Management (Database Mock):** Menggunakan `localStorage` browser yang diatur oleh modul `src/store.js` untuk menyimulasikan basis data persisten. Reaktivitas antar tab (Customer, Admin, Kitchen) ditangani melalui *event listener* `storage` (`window.dispatchEvent(new Event('storage'))`).
- **Dependencies Pihak Ketiga:**
  - `Chart.js` (dimuat via CDN di `admin.html`) untuk menampilkan grafik penjualan dan pesanan pada halaman admin.
  - `Cropper.js` (melalui NPM) untuk fitur pemotongan (*crop*) gambar menu pada halaman admin.

## 2. Struktur Folder
Struktur dari proyek Rakit Coffee dikelompokkan berdasarkan fungsionalitas dan peran pengguna:

```text
Rakit Coffee/
├── .git/                  # Git repository
├── node_modules/          # Dependencies (NPM)
├── dist/                  # Hasil build produksi Vite
├── src/                   # Source code JavaScript dan CSS
│   ├── css/
│   │   ├── design-system.css # Sistem desain utama (variabel CSS, reset, utilitas)
│   │   ├── admin.css         # Styling khusus halaman admin
│   │   ├── customer.css      # Styling khusus halaman customer
│   │   └── kitchen.css       # Styling khusus halaman dapur/kitchen
│   ├── admin.js           # Logika interaksi & fungsionalitas halaman Admin
│   ├── customer.js        # Logika antarmuka pelanggan (Menu, Keranjang, Status)
│   ├── kitchen.js         # Logika layar manajemen antrean dapur (Order preparation)
│   └── store.js           # Pengelola state lokal (Mock DB via localStorage)
├── index.html             # Entry point halaman Pelanggan (Self-Order)
├── admin.html             # Entry point halaman Admin (Dashboard, Kelola Menu)
├── kitchen.html           # Entry point halaman Dapur (Order Tracker)
├── package.json           # Konfigurasi dependensi dan skrip proyek
├── package-lock.json      # Lock file dependensi
├── vite.config.js         # Konfigurasi bundler Vite
└── PRD.md                 # Product Requirement Document (Dokumentasi persyaratan awal)
```

## 3. Aspek Frontend & Desain

Proyek ini dibangun tanpa *framework* CSS seperti Tailwind atau Bootstrap, melainkan mendefinisikan sistem desain mandiri.

### a. Sistem Desain (`design-system.css`)
- **Variabel CSS (`:root`):** Digunakan untuk konsistensi warna (Warna primer: Dark text, Surface: Cream, Aksen: Gold/Bronze), tipografi (*Playfair Display* untuk *heading*, *Inter* untuk *body*), radius batas (border-radius), bayangan (shadows), dan spasi.
- **Komponen Global:** Definisi class utilitas dasar seperti `.btn`, `.btn-primary`, `.btn-outline` untuk penggunaan *button* yang seragam. Serta menyertakan Google Fonts dan Material Symbols untuk iconografi.

### b. Antarmuka Pelanggan (`index.html` & `customer.js` & `customer.css`)
- Mengusung tampilan *Mobile First* yang elegan dan interaktif dengan nuansa warna kopi (Krem dan Emas/Bronze).
- Terdapat 3 bagian/view utama: 
  - **Menu (`#view-menu`):** Menampilkan daftar menu dengan tab navigasi kategori dinamis. Terdapat komponen *hero image*.
  - **Keranjang (`#view-cart`):** Formulir pemesanan dengan input nama, metode pembayaran (QRIS / VA), dan total harga.
  - **Status Pesanan (`#view-tracker`):** Memantau pesanan yang sedang aktif.
- Interaksi menu tambahan seperti "Customization Modal" dengan fitur modifikasi kuantitas (Quantity Selector) dan catatan tambahan.

### c. Antarmuka Admin (`admin.html` & `admin.js` & `admin.css`)
- Menyajikan **Dashboard Penjualan** komprehensif dengan metrik dan grafik interaktif (menggunakan `Chart.js`). Grafik mencakup "Total Pesanan" dan "Pendapatan".
- Memiliki filter waktu global (Harian, Bulanan, Tahunan, Rentang Waktu) untuk menyaring data riwayat.
- **Master Data Penjualan:** Tabel rekapitulasi penjualan dengan kemampuan *sorting* dan *filtering*. Terdapat modal untuk menampilkan *detail* dari suatu transaksi.
- **Kelola Menu:** Layar untuk operasi CRUD (Create, Read, Update, Delete) menu. Tersedia fitur pengunggahan gambar dengan fungsi *cropping* (via `Cropper.js`), harga, kategori, dan spesifikasi tambahan.

### d. Antarmuka Dapur / Kitchen (`kitchen.html` & `kitchen.js` & `kitchen.css`)
- Berfungsi sebagai *Kitchen Display System* (KDS).
- Layar ini bertugas menerima pesanan dari pelanggan secara *real-time* (didukung oleh tab-syncing melalui *storage events* di `store.js`).
- Petugas dapur dapat mengubah status dari setiap antrean makanan (Misal: "Diterima" -> "Dimasak" -> "Siap").

## 4. Pola Aliran Data (Data Flow)
1. **Penyimpanan:** Semua data master (Menu, Order, Kategori) disimpan dalam format JSON string di `localStorage`.
2. **Keterhubungan:** Saat pelanggan menyelesaikan pembayaran, data disisipkan ke dalam aray orders di local storage via metode `Store.addOrder()`. 
3. **Reaktivitas:** Pemanggilan fungsi `window.dispatchEvent(new Event('storage'))` akan memicu *event listener* pada berkas `admin.js` dan `kitchen.js` di tab peramban yang lain, sehingga UI pada halaman dapur dan admin langsung ter-*update* tanpa perlu me-*refresh* halaman.

## 5. Menjalankan Aplikasi
Aplikasi ini sudah dipasangkan dengan Vite.
1. Instal dependensi: `npm install`
2. Jalankan server dev: `npm run dev`
3. Aplikasi akan melayani 3 *endpoint*:
   - `/` atau `/index.html` (Pelanggan)
   - `/admin.html` (Admin)
   - `/kitchen.html` (Dapur)

---
*Dokumentasi ini dibuat otomatis berdasarkan hasil observasi dan kode sumber yang tersedia pada repositori Rakit Coffee.*
