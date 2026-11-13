<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code', 30)->unique();             // contoh: ORD-20261110-A1B2
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('customer_name', 100);
            $table->string('phone', 20);
            $table->text('shipping_address');
            $table->text('notes')->nullable();
            $table->unsignedInteger('total_price');
            $table->enum('status', ['pending', 'diproses', 'dikirim', 'selesai'])
                ->default('pending')
                ->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
