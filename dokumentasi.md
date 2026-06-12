# Dokumentasi Serah Terima (Backend Handoff) - Rakit Coffee

Dokumen ini disusun khusus sebagai panduan komprehensif bagi **Tim Backend** yang akan melanjutkan pengembangan proyek **Rakit Coffee**. Aplikasi ini saat ini beroperasi penuh secara fungsional di sisi *frontend* dengan menggunakan **Vanilla JavaScript** dan menyimulasikan basis data (*database*) melalui `localStorage`.

Tugas utama tim backend nantinya adalah mengganti simulasi penyimpanan lokal tersebut dengan integrasi ke **REST API sungguhan** dan **Sistem Database Relasional/NoSQL**.

---

## 1. Arsitektur & Tumpukan Teknologi Saat Ini (Frontend)

- **Core:** HTML5, CSS3 (Vanilla tanpa framework), JavaScript (ES6 Modules).
- **Bundler & Dev Server:** Vite (`vite.config.js` diatur untuk mendukung *multi-page routing*).
- **Library Tambahan:**
  - `Chart.js` (Visualisasi data penjualan dan analitik di halaman Admin).
  - `Cropper.js` (Fitur pemotongan gambar secara interaktif saat Admin menambahkan menu).
- **Pusat Logika Data (State Management):** Semua aliran data (CRUD Menu, Transaksi, Pengaturan Tema) dipusatkan di dalam satu file, yaitu `src/store.js`.

---

## 2. Struktur Halaman & Alur Pengguna (User Flow)

Sistem terdiri dari beberapa portal/halaman yang memiliki peran spesifik:

1. **Halaman Pelanggan (`index.html`):** 
   Aplikasi *Self-Order*. Pelanggan menelusuri menu, memilih variasi pesanan (*custom modifiers*), memasukkan ke keranjang, menginput nama, dan menekan checkout.
2. **Halaman Dapur/KDS (`kitchen.html`):**
   Layar pemantauan (Kitchen Display System) untuk para staf dapur. Menerima pesanan secara real-time, lalu mengubah status dari `Diterima` -> `Dimasak` -> `Siap`.
3. **Portal Login (`login.html`):**
   Halaman perlindungan untuk masuk ke dalam dasbor manajemen.
4. **Dasbor Admin:** Terbagi menjadi 4 sub-halaman:
   - **Dashboard Penjualan (`admin.html`):** Grafik pendapatan, rangkuman status pesanan, dan tabel riwayat transaksi (Bisa difilter berdasarkan tanggal/bulan/tahun).
   - **Dashboard Menu (`admin-analytics.html`):** Analitik spesifik seputar performa menu (Menu terlaris, pendapatan per menu).
   - **Kelola Menu (`admin-manage.html`):** Manajemen CRUD Kategori dan Menu. Termasuk upload gambar, penentuan harga, dan pengaturan spesifikasi kustom (Misal: ukuran, tingkat gula).
   - **Tampilan Pelanggan/CMS (`admin-cms.html`):** Pengaturan *Content Management System*. Admin bisa mengganti warna aksen tema, jenis font (tipografi), teks hero, dan gambar hero. Perubahan ini akan langsung direfleksikan secara dinamis ke seluruh sistem.

---

## 3. Strategi Migrasi untuk Tim Backend

Desain kode *frontend* ini sudah disiapkan dengan sangat modular untuk mempermudah pekerjaan Anda. Anda **tidak perlu mengutak-atik logika UI/HTML**. Fokus pekerjaan Anda hanya satu: **Melakukan Refactor pada file `src/store.js`**.

Saat ini, `store.js` menggunakan fungsi asinkron (mengembalikan `Promise`) yang mensimulasikan jeda jaringan (via `setTimeout`) sebelum membaca/menulis ke `localStorage`. 
**Langkah Migrasi:** Anda hanya perlu mengubah isi setiap metode di `store.js` agar menggunakan fungsi `fetch()` atau `axios` ke URL *endpoint* API yang Anda bangun. Karena arsitekturnya sudah menggunakan `async/await`, UI di frontend akan langsung otomatis menunggu *response* dari server Anda tanpa perlu modifikasi tambahan pada UI.

---

## 4. Skema Data (Database Schema Suggestions)

Berikut adalah struktur representasi JSON yang di-*generate* oleh frontend saat ini. Anda disarankan untuk merancang tabel/koleksi database yang kompatibel dengan struktur ini.

### a. Tabel Kategori (`categories`)
```json
[
  { "id": "cat-1", "name": "Kopi" },
  { "id": "cat-2", "name": "Non Kopi" }
]
```

### b. Tabel Menu (`menu`)
Frontend mendukung pengaturan tambahan (Modifier Groups) dinamis per menu.
```json
{
  "id": "menu-uuid-1234",
  "name": "Caramel Macchiato",
  "category": "Kopi",
  "price": 28000,
  "desc": "Espresso dengan sirup karamel dan susu.",
  "image": "https://url-ke-aws-s3-anda.com/image.jpg",
  "isAvailable": true,
  "modifierGroups": [
    {
      "name": "Pilihan Ukuran",
      "required": true,
      "options": [
        { "name": "Regular", "priceDiff": 0 },
        { "name": "Large", "priceDiff": 5000 }
      ]
    }
  ]
}
```

### c. Tabel Pesanan (`orders`)
Pencatatan status pesanan dan detil modifikasi yang dipilih pelanggan.
```json
{
  "id": "ORD-123456",
  "customerName": "Budi",
  "status": "Diterima", // Enum: Diterima | Dimasak | Siap
  "timestamp": "2026-06-12T03:00:00.000Z",
  "totalPrice": 33000,
  "paymentMethod": "qris",
  "items": [
    {
      "id": "menu-uuid-1234",
      "name": "Caramel Macchiato",
      "price": 28000,
      "qty": 1,
      "selectedModifiers": [
        { "group": "Pilihan Ukuran", "option": "Large", "priceDiff": 5000 }
      ],
      "note": "Jangan terlalu manis"
    }
  ]
}
```

### d. Tabel Pengaturan / CMS (`settings`)
Ini adalah konfigurasi tema global yang memengaruhi desain CSS dan estetika aplikasi.
```json
{
  "themeColor": "#AF8C53", // Warna hex yang disuntikkan langsung ke CSS Variables
  "fontFamily": "'Playfair Display', serif",
  "heroTitleFont": "'Playfair Display', serif",
  "heroSubtitleFont": "'Inter', sans-serif",
  "heroTitleColor": "#ffeec5",
  "heroSubtitleColor": "#ffffff",
  "heroTitle": "Rasa Otentik, \nKualitas Terbaik",
  "heroSubtitle": "Nikmati kopi...",
  "heroImage": "https://url-gambar-banner.com/banner.jpg"
}
```

---

## 5. Peringatan Teknis & Hal Krusial yang Harus Diselesaikan

Tim Backend harus memperhatikan 3 hal fundamental berikut saat proses integrasi:

### 1. Manajemen Penyimpanan Gambar (File Storage)
**Kondisi Saat Ini:** Fitur tambah menu (dan *cropping* gambar) serta penggantian gambar Banner Hero menyimpan gambar dalam format teks panjang (**Base64 String**).
**Tugas Backend:** Base64 sangat membebani *database* dan memperlambat muatan jaringan. Backend harus merancang sistem penerimaan *multipart/form-data*, memproses dan menyimpan file fisik tersebut ke layanan cloud (seperti Amazon S3) atau direktori lokal server, kemudian menyimpan *URL* path absolut/relatif ke dalam database untuk dikirimkan kembali ke Frontend.

### 2. Socket / Real-time Event (Krusial untuk KDS Dapur)
**Kondisi Saat Ini:** Halaman Pelanggan berkomunikasi dengan Halaman Dapur dan Admin menggunakan *listener* `window.addEventListener('storage')`. Ketika data di *localStorage* berubah, UI yang lain langsung menyesuaikan diri (simulasi sinkronisasi *real-time*).
**Tugas Backend:** Ketika menggunakan REST API biasa, Dapur tidak akan otomatis tahu jika ada pesanan baru kecuali halamannya di-*refresh* berkala (Polling).
**Solusi Terbaik:** Implementasikan **WebSockets (misal: Socket.io)** atau **Server-Sent Events (SSE)**. Ketika pelanggan *submit order*, Backend merespons ke API, lalu memancarkan *event* (emit/broadcast) via socket kepada seluruh *client* ber-opsi *kitchen*. Di frontend (`kitchen.js`), Anda bisa mendengarkan event socket tersebut untuk langsung memanggil `Store.getOrders()` dan memperbarui layar tanpa jeda.

### 3. Otentikasi Lanjutan (Security/Auth)
**Kondisi Saat Ini:** Fitur login di `login.js` dan perlindungan halaman admin saat ini hanya didasarkan pada flag *boolean* sederhana (`auth_status: true`) di `localStorage`.
**Tugas Backend:** Bangun sistem **JWT (JSON Web Token)** atau sesi berbasis *cookie*. Setelah berhasil melakukan login melalui API `/api/login`, simpan token di klien. Pastikan semua *fetch request* ke API manajemen (Dashboard, Kelola Menu, CMS, dan Order Mutation) menyertakan *header* otorisasi (`Authorization: Bearer <token>`). Ini vital agar sembarang orang tidak dapat mengirim HTTP *request* untuk merusak menu dari luar aplikasi.

---
*Dokumentasi ini disiapkan untuk memastikan serah terima proyek berjalan tanpa friksi. Semoga sukses menyambungkan sisi belakang sistem ini!*
