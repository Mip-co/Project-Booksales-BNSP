<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('order_number', 255)->unique();
            $table->integer('customer_id');
            $table->integer('book_id');
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['pending', 'diproses', 'dikirim', 'selesai'])->default('pending');
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('users');
            $table->foreign('book_id')->references('id')->on('books');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
