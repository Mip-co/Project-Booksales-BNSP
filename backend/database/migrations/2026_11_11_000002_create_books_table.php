<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('genre_id')
                ->constrained('genres')
                ->cascadeOnUpdate()
                ->restrictOnDelete();                       // genre yang masih punya buku tidak boleh dihapus
            $table->string('title', 200);
            $table->string('author', 150);
            $table->unsignedInteger('price');               // Rupiah
            $table->unsignedInteger('stock')->default(0);   // unsigned: DB menolak stok negatif
            $table->string('cover_image')->nullable();      // path relatif di disk "public" (covers/xxx.jpg)
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);    // dasar statistik "Buku Aktif" & tampil di katalog
            $table->timestamps();

            $table->index(['is_active', 'genre_id']);
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
