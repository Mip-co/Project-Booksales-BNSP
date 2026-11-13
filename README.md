# 📚 Booksales App

Aplikasi web toko buku online (*e-commerce*) berbasis arsitektur **Decoupled (RESTful API & Single Page Application)** yang dibangun menggunakan **Laravel** dan **React**. Proyek ini disusun sebagai bagian dari portofolio **Uji Kompetensi (UJK) BNSP Skema Junior Web Developer**.

---

## ✨ Fitur Utama

### 🛒 Customer (Pelanggan)
* **Katalog & Pencarian Buku:** Eksplorasi daftar buku lengkap dengan filter berdasarkan genre, penulis, serta pencarian judul secara real-time.
* **Keranjang Belanja Terisolasi:** Manajemen keranjang belanja berbasis `localStorage` dinamis per pengguna (`booksales_cart_${user.id}`) sehingga aman antar-akun.
* **Checkout Auto-Fill:** Pengisian otomatis data penerima, nomor telepon, dan alamat pengiriman berdasarkan profil pengguna yang sedang login.
* **Grouping Multi-Item Order:** Pembelian beberapa buku sekaligus digabung ke dalam satu nomor pesanan (`order_number`) terpadu.
* **Riwayat & Pelacakan Pesanan:** Pemantauan status pesanan secara berkala dari *Pending*, *Diproses*, *Dikirim*, hingga *Selesai*.
* **About Us & Kontak WhatsApp:** Halaman informasi toko dan formulir pesan yang langsung terhubung ke WhatsApp Admin.

### 🛠️ Admin (Pengelola Toko)
* **Dashboard Statistik & Grafik:** Ringkasan pendapatan, jumlah transaksi, stok buku, serta visualisasi performa penjualan.
* **Manajemen Data Master (CRUD):** Pengelolaan penuh data **Buku** (termasuk upload cover), **Penulis (Authors)**, dan **Genre**.
* **Manajemen Transaksi & Pembaruan Status:** Monitoring seluruh pesanan masuk dan pembaruan status pengiriman pelanggan.

### 🔒 Keamanan & Integritas Data
* **Autentikasi & Otorisasi (RBAC):** Menggunakan **Laravel Sanctum** untuk token API dan custom `RoleMiddleware` untuk memisahkan hak akses `admin` dan `customer`.
* **Kalkulasi Harga Server-Side:** Total harga dan ongkos kirim dihitung ulang murni di server (`TransactionController`) untuk mencegah manipulasi harga dari browser.
* **Pencegahan Race Condition Stok:** Menggunakan `DB::transaction()` dan `lockForUpdate()` saat proses checkout agar stok buku tidak pernah bernilai minus.

---

## 🧱 Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, React Router, Axios, Lucide React Icons
* **Backend:** PHP 8.x, Laravel Framework, Laravel Sanctum
* **Database:** MySQL (5 Tabel Utama: `users`, `authors`, `genres`, `books`, `transactions`)

---

## 📁 Struktur Direktori

```text
booksales/
├── backend/                 # Laravel REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/ # Auth, Book, Author, Genre, Transaction, Dashboard
│   │   │   ├── Middleware/  # RoleMiddleware (RBAC)
│   │   │   └── Requests/    # Form Request Validation
│   │   ├── Models/          # User, Book, Author, Genre, Transaction
│   │   └── Presenters/      # OrderPresenter (Grouping multi-item order)
│   ├── database/
│   │   ├── migrations/      # Skema 5 tabel database
│   │   └── seeders/         # Data awal Admin, Customer, Buku, Genre, Penulis
│   └── routes/
│       └── api.php          # Endpoint REST API
│
└── frontend/                # React Vite SPA
    └── src/
        ├── components/      # Navbar, Footer, Card, ProtectedRoute
        ├── context/         # AuthContext & CartContext
        ├── pages/           # Home, Catalog, BookDetail, Cart, Checkout, Profile, Contact, Admin/*
        └── services/        # Konfigurasi instance Axios & API calls
```

---

## 🚀 Cara Menjalankan Proyek (Local Development)

### Prasyarat
* PHP >= 8.1 & Composer
* Node.js >= 18.x & NPM
* MySQL / MariaDB (XAMPP / Laragon)

### 1. Setup Backend (Laravel API)
```bash
# Masuk ke direktori backend
cd backend

# Install dependensi PHP
composer install

# Salin file environment dan generate app key
cp .env.example .env
php artisan key:generate
```
Buka file `.env` dan sesuaikan konfigurasi database MySQL Anda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=booksales
DB_USERNAME=root
DB_PASSWORD=
```
Jalankan migrasi, seeder data awal, dan storage link:
```bash
php artisan migrate --seed
php artisan storage:link

# Jalankan server Laravel (http://127.0.0.1:8000)
php artisan serve
```

### 2. Setup Frontend (React Vite)
Buka terminal baru, lalu jalankan perintah berikut:
```bash
# Masuk ke direktori frontend
cd frontend

# Install dependensi Node
npm install

# Jalankan server development (http://localhost:5173)
npm run dev
```

---

## 🔑 Akun Demo Default (Hasil Seeder)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@booksales.com` | `password` |
| **Customer** | `customer@booksales.com` | `password` |

*(Catatan: Sesuaikan kredensial di atas dengan data yang ada pada `DatabaseSeeder.php` Anda)*

---

## 👨‍💻 Pengembang

**Ahmad Miftahuddin Al Awwaly**  
Peserta Sertifikasi BNSP — Skema *Junior Web Developer*  
STT Terpadu Nurul Fikri • NF Academy