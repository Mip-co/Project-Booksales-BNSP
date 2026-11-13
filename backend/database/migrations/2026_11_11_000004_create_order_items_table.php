<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();                        // hapus order => item ikut terhapus
            $table->foreignId('book_id')
                ->constrained('books')
                ->cascadeOnUpdate()
                ->restrictOnDelete();                       // buku yang pernah dipesan tidak boleh dihapus
            $table->string('book_title', 200);              // snapshot judul saat transaksi
            $table->unsignedInteger('price');               // snapshot harga satuan saat transaksi
            $table->unsignedSmallInteger('qty');
            $table->unsignedInteger('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
