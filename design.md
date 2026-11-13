# Software Design Document — Booksales (Bookstore App)

**Versi 3.0** · UJK BNSP Junior Web Developer · React (Vite) + Tailwind CSS + Axios · Laravel REST API (Sanctum) · MySQL

## 1. Ringkasan

Aplikasi toko buku online dengan dua peran: **Pelanggan** (menjelajah katalog, keranjang, checkout, memantau pesanan) dan **Admin** (dashboard, memantau & memproses transaksi, mengelola buku, user, genre, penulis). Front-end (SPA) dan back-end (REST API) terpisah dan berkomunikasi lewat JSON dengan Bearer Token Sanctum.

## 2. Arsitektur

```
Browser (React SPA, :5173)
   │  Axios  (Authorization: Bearer <token>)
   ▼
Laravel REST API (:8000/api)
   Route → Middleware (auth:sanctum, role) → FormRequest → Controller → Model (Eloquent) → MySQL
```

| Lapisan | Teknologi | Tanggung jawab |
|---|---|---|
| UI | React 18, React Router, Tailwind v4, lucide-react, Recharts | Halaman, komponen, state (AuthContext, CartContext) |
| Akses API | Axios + interceptor, `src/services/*` | Satu file per sumber daya; token otomatis; 401 → logout |
| API | Laravel 11/12, Sanctum | Autentikasi, otorisasi role, validasi, logika bisnis |
| Data | MySQL | 5 tabel ERD + `personal_access_tokens` |

## 3. ERD

Tabel dan kolom di bawah mengikuti ERD. Kolom bertanda ➕ adalah **tambahan di luar ERD** (migrasi terpisah) karena fitur yang diminta membutuhkannya.

**users**: `id` INT(11) PK AI · `name` varchar(255) · `email` varchar(255) UNIQUE · `password` varchar(255) · `photo` varchar(255) NULL · `role` enum(admin, customer) default customer · `last_access` timestamp NULL · `created_at`, `updated_at` · ➕ `phone` varchar(20) NULL · ➕ `address` text NULL

**authors**: `id` · `name` varchar(255) · `photo` varchar(255) NULL · `bio` text NULL · timestamps

**genres**: `id` · `name` varchar(255) · `description` text NULL · timestamps

**books**: `id` · `title` varchar(255) · `description` text NULL · `price` DECIMAL(10,2) · `stock` INT(11) · `cover_photo` varchar(255) NULL · `genre_id` FK→genres.id · `author_id` FK→authors.id · timestamps

**transactions**: `id` · `order_number` varchar(255) UNIQUE · `customer_id` FK→users.id · `book_id` FK→books.id · `total_amount` DECIMAL(10,2) · `status` enum(pending, diproses, dikirim, selesai) default pending · timestamps · ➕ `quantity` int default 1 · ➕ `recipient_name` · ➕ `phone` · ➕ `shipping_address` · ➕ `notes` · ➕ `shipping_method` (hemat/reguler/instan) · ➕ `shipping_cost` DECIMAL(10,2) · ➕ `payment_method` (cod/transfer/ewallet)

Relasi: Genre 1—N Book · Author 1—N Book · User 1—N Transaction (`customer_id`) · Book 1—N Transaction.

Catatan desain:
- Satu baris `transactions` = satu buku. Checkout berisi N buku menghasilkan N baris dengan nomor `ORD-YYYYMMDD-XXXX-1`, `-2`, …
- ERD tidak memiliki `is_active`; "Produk Aktif (SKU)" di dashboard = jumlah buku dengan `stock > 0`.
- ERD tidak memiliki `slug`; ikon genre di katalog dipilih dari kata kunci pada nama genre.
- **Penyajian per checkout:** di database tetap satu baris per buku, tetapi API mengelompokkan baris berawalan nomor order sama (`App\Support\OrderPresenter`) menjadi SATU objek order: `order_number` tanpa akhiran, `items[]` (title, author, cover_url, quantity, price, subtotal), `subtotal`, `shipping_cost`, `total_amount`, `status`, kurir, pembayaran, `customer`. Riwayat pelanggan dan Transaksi Masuk admin menampilkan satu baris per checkout dengan rincian expand.
- Ongkos kirim ditentukan server dari kode kurir (Hemat Rp10.000, Reguler Rp15.000, Instan Rp25.000) dan dibebankan **sekali per checkout** pada baris pertama (`shipping_cost`); `total_amount` baris itu = harga buku + ongkir. Metode pembayaran bersifat simulasi.
- Harga disimpan DECIMAL(10,2); server menghitung dalam sen (integer) lalu memformat ke 2 desimal. Model memakai cast `decimal:2` (string di JSON) sehingga front-end memakai `Number()`.

## 4. Daftar Endpoint REST

| Method | Path | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/register` | publik | Selalu role `customer` |
| POST | `/api/login` | publik | Login universal; respons memuat token + `user.role`; mengisi `last_access` |
| GET | `/api/books?search=&genre_id=` | publik | Katalog; search judul/penulis; eager load author & genre |
| GET | `/api/books/{id}` | publik | Detail + author & genre |
| GET | `/api/genres` | publik | Dengan `books_count` |
| GET | `/api/media/{folder}/{filename}` | publik | Menyajikan gambar (avatars, authors, covers) |
| GET | `/api/me` · POST `/api/logout` | token | Sesi |
| GET/PUT | `/api/user/profile` | token | PUT: name, email, phone, address, `photo` (multipart; `_method=PUT`) |
| POST | `/api/transactions` | customer | Checkout (`items`, `shipping_method`, `payment_method`, data penerima); harga, ongkir, total dihitung server |
| GET | `/api/transactions` (alias `/my`) | customer | Riwayat milik sendiri, 1 objek per checkout |
| GET | `/api/admin/dashboard` | admin | Statistik + tren + distribusi genre |
| GET | `/api/admin/transactions` | admin | Live Order Monitor, 1 objek per checkout |
| PATCH | `/api/admin/transactions/{orderNumber}/status` | admin | `{orderNumber}` tanpa akhiran (ORD-20261111-UIGX); maju satu langkah untuk SEMUA buku dalam order |
| POST/PUT/DELETE | `/api/admin/books` | admin | CRUD buku + `cover_photo` |
| POST/PUT/DELETE | `/api/admin/genres` | admin | CRUD genre |
| GET/POST/PUT/DELETE | `/api/admin/authors` | admin | CRUD penulis |
| GET/POST/PUT/DELETE | `/api/admin/users` | admin | CRUD user |

`photo_url` / `cover_url` adalah URL publik `/api/media/...` (tidak membutuhkan `storage:link` dan tidak bergantung `APP_URL`).

## 5. Struktur Folder

```
backend/
  app/Http/Controllers/   Controller (basis), Auth, Profile, Book, Author, Genre, Transaction, Dashboard, User, Media
  app/Http/Middleware/    RoleMiddleware
  app/Http/Requests/      StoreBook, StoreTransaction, UpdateProfile, User, Author
  app/Models/             User, Author, Genre, Book, Transaction
  app/Support/MediaUrl.php
  database/migrations/    ERD + 2 migrasi kolom tambahan
  database/seeders/       DatabaseSeeder + covers/
  routes/api.php
frontend/src/
  api/ services/ context/ hooks/ utils/ components/ (admin/, profile/) pages/ (admin/)
```

## 6. Antarmuka

**Pelanggan** — Navbar: logo Booksales, tombol **Katalog**, ikon keranjang + badge, profil (foto, nama, badge "PELANGGAN"), logout. Tidak ada tombol "Pesanan".
- `/` Katalog: hero, **kolom pencarian tepat di bawah hero** (di atas filter genre), lalu grid kartu (cover, judul, penulis, tag genre, harga, stok); klik → `/books/:id`.
- `/books/:id` Detail: kiri cover besar + badge stok; kanan judul, penulis, genre, harga, deskripsi lengkap, kontrol qty +/−, "+ Tambah ke Keranjang", "Kembali ke Katalog".
- `/cart`; `/checkout` dua kolom: kiri data pengiriman (terisi otomatis dari profil), pilihan kurir, metode pembayaran; kanan ringkasan (thumbnail, qty, subtotal, ongkir, total bayar, tombol "Buat Pesanan Sekarang").
- `/user/profile`: dua kolom; tab **Info Akun** (foto dengan pratinjau global lewat AuthContext, nama, email, telepon, alamat) dan **Riwayat Pesanan** (tabel transaksi + status + progress bar).

**Admin** — `/admin`, viewport terkunci (`h-screen overflow-hidden`): sidebar hijau tua `#022C22` tetap dengan Logout terkunci di bawah, hanya `main` yang scroll; 4 menu: (1) Dashboard — 4 kartu (Total Omset Selesai, Produk Aktif SKU, Pelanggan, Total Stok Keseluruhan) + grafik Tren Penjualan + Kategori Genre; (2) Transaksi Masuk (polling 10 dtk, ubah status); (3) Kelola Buku (CRUD + upload cover); (4) Kelola Master User & Genre → halaman Master User, Master Genre, Master Penulis.

## 7. Keamanan

Harga tidak pernah dikirim client; `DB::transaction` + `lockForUpdate()` menjaga stok; role diperiksa di server (`RoleMiddleware`); register tidak bisa menjadi admin; status hanya maju satu langkah; upload dibatasi JPG/PNG/WEBP ≤ 2 MB (SVG ditolak); `basename()` + whitelist folder di MediaController; riwayat transaksi tidak bisa dihapus lewat penghapusan buku/user (409); throttle pada login/register.

## 8. Pemetaan Unit Kompetensi BNSP

| Kode | Unit | Bukti |
|---|---|---|
| J.620100.005.02 | Menggunakan spesifikasi dari perancangan UI | Layout & komponen sesuai spesifikasi (Navbar, BookCard, BookDetailPage, sidebar admin) |
| J.620100.010.01 | Mengeksekusi instruksi pemrograman | API JSON, routing SPA, alur checkout & status end-to-end |
| J.620100.015.01 | Menerapkan struktur folder sesuai standar | Pemisahan `backend/` & `frontend/`; `services/ context/ hooks/ components/ pages/` |
| J.620100.016.01 | Menerapkan guidelines & best practices | FormRequest, `DB::transaction`, CORS, interceptor, penamaan konsisten |
| J.620100.017.02 | Pemrograman terstruktur | Relasi Eloquent, middleware, controller per sumber daya |
| J.620100.019.02 | Menggunakan library/komponen pre-existing | Sanctum, React Router, Axios, Recharts, lucide-react, Tailwind |

## 9. Riwayat Revisi

| Versi | Perubahan |
|---|---|
| 1.x | Apotek Online (Pharmly) |
| 2.0 | Refactor menjadi Booksales |
| 3.2 | Transaksi dikelompokkan per checkout di API & UI; status diubah serentak per order |
| 3.1 | Sidebar admin fixed, search pindah ke katalog, checkout baru + kurir & pembayaran |
| 3.0 | ERD presisi (5 tabel), `/books/:id`, tab profil, sidebar 4 menu, Master Penulis, kolom tambahan terdokumentasi |
