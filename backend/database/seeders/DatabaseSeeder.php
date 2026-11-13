<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Akun ---------------------------------------------------------
        User::updateOrCreate(
            ['email' => 'admin@booksales.id'],
            [
                'name' => 'Admin Booksales',
                'password' => 'Admin12345',
                'role' => User::ROLE_ADMIN,
                'phone' => '081200000001',
                'address' => 'Jl. Toko Buku Pusat No. 1, Bogor',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@booksales.id'],
            [
                'name' => 'Budi Pelanggan',
                'password' => 'Customer12345',
                'role' => User::ROLE_CUSTOMER,
                'phone' => '081234567890',
                'address' => 'Jl. Raya Pajajaran No. 10, Bogor, Jawa Barat',
            ]
        );

        // --- Genre --------------------------------------------------------
        $genreData = [
            'Novel & Fiksi' => 'Cerita rekaan: novel, sastra, dan kisah inspiratif.',
            'Pengembangan Diri' => 'Buku kebiasaan, mindset, dan produktivitas.',
            'Teknologi' => 'Pemrograman, rekayasa perangkat lunak, dan teknologi.',
            'Sejarah & Sosial' => 'Sejarah, budaya, dan ilmu sosial.',
        ];
        $genres = [];
        foreach ($genreData as $name => $description) {
            $genres[$name] = Genre::updateOrCreate(['name' => $name], ['description' => $description]);
        }

        // --- Penulis ------------------------------------------------------
        $authorData = [
            'Andrea Hirata' => 'Novelis Indonesia, penulis tetralogi Laskar Pelangi.',
            'Pramoedya Ananta Toer' => 'Sastrawan Indonesia, penulis Tetralogi Buru.',
            'Leila S. Chudori' => 'Novelis dan jurnalis Indonesia.',
            'James Clear' => 'Penulis dan pembicara tentang kebiasaan dan peningkatan diri.',
            'Henry Manampiring' => 'Penulis dan pegiat Stoisisme di Indonesia.',
            'Robert C. Martin' => 'Pengembang perangkat lunak, dikenal sebagai "Uncle Bob".',
            'Andrew Hunt & David Thomas' => 'Penulis The Pragmatic Programmer.',
            'Yuval Noah Harari' => 'Sejarawan dan penulis buku-buku sejarah populer.',
            'M.C. Ricklefs' => 'Sejarawan yang mendalami sejarah Indonesia.',
        ];
        $authors = [];
        foreach ($authorData as $name => $bio) {
            $authors[$name] = Author::updateOrCreate(['name' => $name], ['bio' => $bio]);
        }

        // --- Buku (harga & stok hanya data contoh) -------------------------
        // [genre, penulis, judul, harga, stok, deskripsi, file cover]
        $books = [
            ['Novel & Fiksi', 'Andrea Hirata', 'Laskar Pelangi', 89000, 40,
                'Kisah sepuluh anak di Belitung yang belajar di sekolah sederhana dan tak pernah berhenti bermimpi.', 'laskar-pelangi.png'],
            ['Novel & Fiksi', 'Pramoedya Ananta Toer', 'Bumi Manusia', 125000, 25,
                'Novel pertama Tetralogi Buru, berlatar masa kolonial dan tumbuhnya kesadaran kebangsaan.', 'bumi-manusia.png'],
            ['Novel & Fiksi', 'Leila S. Chudori', 'Laut Bercerita', 105000, 30,
                'Novel tentang persahabatan, keluarga, dan para aktivis yang hilang menjelang akhir 1990-an.', 'laut-bercerita.png'],
            ['Pengembangan Diri', 'James Clear', 'Atomic Habits', 108000, 50,
                'Cara membangun kebiasaan baik dan meninggalkan kebiasaan buruk lewat perubahan-perubahan kecil.', 'atomic-habits.png'],
            ['Pengembangan Diri', 'Henry Manampiring', 'Filosofi Teras', 98000, 35,
                'Pengantar filsafat Stoisisme untuk menghadapi emosi negatif dalam keseharian.', 'filosofi-teras.png'],
            ['Teknologi', 'Robert C. Martin', 'Clean Code', 285000, 15,
                'Panduan menulis kode yang bersih, mudah dibaca, dan mudah dipelihara.', 'clean-code.png'],
            ['Teknologi', 'Andrew Hunt & David Thomas', 'The Pragmatic Programmer', 310000, 12,
                'Kumpulan praktik dan pola pikir pragmatis bagi pengembang perangkat lunak.', 'pragmatic-programmer.png'],
            ['Sejarah & Sosial', 'Yuval Noah Harari', 'Sapiens', 139000, 28,
                'Sejarah singkat umat manusia, dari zaman batu hingga era modern.', 'sapiens.png'],
            ['Sejarah & Sosial', 'M.C. Ricklefs', 'Sejarah Indonesia Modern', 175000, 18,
                'Telaah sejarah Indonesia sejak sekitar tahun 1200 hingga masa modern.', 'sejarah-indonesia-modern.png'],
        ];

        foreach ($books as [$genre, $author, $title, $price, $stock, $description, $coverFile]) {
            Book::updateOrCreate(
                ['title' => $title],
                [
                    'genre_id' => $genres[$genre]->id,
                    'author_id' => $authors[$author]->id,
                    'price' => $price,
                    'stock' => $stock,
                    'description' => $description,
                    'cover_photo' => $this->storeCover($coverFile),
                ]
            );
        }
    }

    /** Salin cover contoh ke disk "public" dan kembalikan path relatifnya (null bila file tidak ada). */
    private function storeCover(string $file): ?string
    {
        $source = database_path('seeders/covers/'.$file);

        if (! is_file($source)) {
            return null;
        }

        Storage::disk('public')->put('covers/'.$file, file_get_contents($source));

        return 'covers/'.$file;
    }
}
