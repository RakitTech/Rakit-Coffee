# Product Requirements Document (PRD) - Frontend UI/UX
**Project Name:** Rakit Coffee - Dine-in QR Ordering System (Prototype)
**Document Status:** V1.0 - Frontend Focus
**Target Platform:** Web-based (Mobile-First untuk Customer, Desktop/Tablet untuk Admin & Kitchen)

---

## 1. Executive Summary
Proyek ini bertujuan untuk membangun prototipe interaktif (MVP) dari sistem *self-ordering* untuk kafe "Rakit Coffee". Fokus utama dari fase ini adalah merancang antarmuka (*frontend*) yang memberikan pengalaman pengguna (UX) yang mulus, tanpa hambatan, dan responsif. Sistem ini akan menggantikan buku menu fisik dan proses pemesanan manual oleh pelayan dengan alur digital berbasis pemindaian QR Code.

## 2. Gambaran Alur Proses Bisnis (Business Process Flow)
Berikut adalah alur bisnis utama yang terjadi di dalam prototipe ini:
1. **Frictionless Entry:** Pelanggan duduk di meja dan memindai QR Code. Sistem otomatis mendeteksi nomor meja pelanggan tanpa mengharuskan pelanggan melakukan registrasi, *login*, atau mengetik nomor meja.
2. **Browsing & Customization:** Pelanggan menelusuri menu digital, memilih makanan/minuman, menyesuaikan *add-ons* (misal: "less sugar"), dan memasukkannya ke keranjang.
3. **Simulated Checkout:** Pelanggan memasukkan nama mereka dan menekan tombol "Bayar Sekarang". Karena ini adalah prototipe, **tidak ada integrasi payment gateway**. Penekanan tombol bayar akan langsung memicu notifikasi "Pembayaran Sukses".
4. **Data Dispatch:** Setelah "pembayaran sukses", data pesanan seketika muncul secara *real-time* di dua antarmuka berbeda: layar Dapur (Kitchen) dan layar Kasir (Admin).
5. **Kitchen Execution & Live Tracking:** Staf dapur melihat pesanan dan mengubah status menjadi "Sedang Dimasak" lalu "Siap Diantar". Perubahan status ini akan langsung tercermin pada layar pelacak (Live Tracking) di *smartphone* pelanggan.

---

## 3. User Personas
1. **Customer (Pelanggan):** Mengakses web melalui HP. Membutuhkan antarmuka yang cepat, gambar menu yang menggugah selera, dan navigasi yang tidak membingungkan.
2. **Kitchen Staff (Koki/Barista):** Mengakses web melalui Tablet di dapur. Membutuhkan antarmuka yang kontras, teks berukuran besar untuk membaca pesanan/catatan khusus, tanpa terdistraksi informasi harga atau pembayaran.
3. **Admin (Kasir/Manajer):** Mengakses web melalui Desktop. Membutuhkan *dashboard* yang rapi untuk memantau status meja dan mengelola ketersediaan menu.

---

## 4. Frontend Requirements & User Flows

### 4.1. Aplikasi Customer (Mobile-First Web)
Aplikasi ini harus terasa seperti aplikasi *native mobile* dengan area sentuh minimum 44x44px.
*   **Halaman Landing / Daftar Menu:**
    *   Terdapat *Header* berisi sapaan dan penanda "Nomor Meja" statis (didapat dari parameter QR).
    *   Navigasi kategori menu berupa *Sticky Tab Bar* horizontal yang bisa di-*swipe*.
    *   Area daftar menu menampilkan kartu produk (Foto, Nama, Deskripsi dipotong, Harga, dan tombol "+ Tambah").
    *   *Floating Bottom Bar* (muncul jika ada item di keranjang) menunjukkan Total Harga dan tombol ke Checkout.
*   **Modal Kustomisasi Menu:**
    *   Muncul sebagai *Bottom Sheet* yang bergeser ke atas (bukan pindah halaman baru).
    *   Berisi *Radio Buttons* (varian tunggal), *Checkboxes* (tambahan/topping), dan *Text Area* (catatan khusus).
*   **Halaman Keranjang & Simulasi Checkout:**
    *   Input *Form* wajib: "Nama Pelanggan".
    *   Daftar item pesanan dengan opsi edit jumlah atau hapus.
    *   Tombol *Call to Action* (CTA) "Bayar Sekarang" selebar layar. Ketika diklik, langsung muncul *Pop-up/Toast* "Pembayaran Berhasil" dan layar beralih ke halaman pelacakan.
*   **Halaman Live Tracking:**
    *   Menampilkan ID Pesanan.
    *   Komponen *Vertical Stepper* animasi untuk status: Diterima ➔ Sedang Dimasak ➔ Siap Diantar.

### 4.2. Kitchen Display System / KDS (Tablet Layout)
Antarmuka berorientasi lanskap (*landscape*) yang difokuskan pada manajemen antrean eksekusi.
*   **Kanban / Queue List:** Layar terbagi dalam kolom antrean pesanan masuk. Setiap tiket pesanan menampilkan: Nomor Meja, Nama Pelanggan, Rincian Item, dan Catatan (diberi *highlight* visual).
*   **Action Buttons:** Tombol simpel pada setiap tiket pesanan untuk memajukan status (misal: tombol "Proses" dan tombol "Selesai").

### 4.3. Admin Dashboard (Desktop Layout)
Antarmuka luas (*data-heavy friendly*) untuk manajemen operasional harian.
*   **Sidebar Navigation:** Panel menu di sisi kiri (Dashboard, Menu, Meja) yang dapat di-*collapse*.
*   **Dashboard View:**
    *   Kartu metrik statis di bagian atas (Total Pesanan Hari Ini, dsb).
    *   **Table Status Grid:** Peta visual meja (misal: kotak-kotak bernomor meja). Meja berubah warna berdasarkan interaksi dari sisi Customer (misal: Kosong vs. Terisi/Menunggu Makanan).
*   **Manajemen Menu (UI State):**
    *   Tabel daftar menu dengan *Toggle Switch* instan untuk mengubah status "Tersedia" menjadi "Habis / Sold Out".
    *   *Pop-up Modal* untuk menambah atau mengedit form menu (Nama, Kategori, Harga).
*   **Manajemen Meja:** Antarmuka berupa *grid/list* daftar meja dengan tombol untuk menampilkan *preview* desain QR Code dan aksi "Download".

---

## 5. UI/UX Design Guidelines
Seluruh pengembangan antarmuka wajib mematuhi panduan visual (*Design System*) "Rakit Coffee Heritage" berikut:
*   **Tema Utama:** Elegan, premium, dan hangat.
*   **Warna Latar:** *Cream / Off-white* yang nyaman di mata.
*   **Warna Aksen:** Emas / *Gold / Bronze* untuk elemen interaktif penting (seperti tombol *Checkout*, *Toggle aktif*, indikator pesanan).
*   **Tipografi:**
    *   *Header / Judul:* Menggunakan font bergaya **Serif** klasik.
    *   *Body text, angka, dan label:* Menggunakan font bergaya **Sans-serif** yang bersih dan mudah dibaca (highly legible).
*   **Bentuk Elemen:** Menggunakan sudut membulat (*rounded corners*) dengan bayangan halus (*soft drop shadows*) pada kartu menu dan tombol untuk memberikan kedalaman visual (*depth*).

---

## 6. Out of Scope (Diluar Cakupan Fase Prototipe)
*   Arsitektur dan konfigurasi *Backend Database* (Database Schema/ERD).
*   Integrasi dengan API *Payment Gateway* nyata (Midtrans, Xendit, QRIS dinamis).
*   Sistem autentikasi pengguna/login untuk Customer.