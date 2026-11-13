<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** KOLOM TAMBAHAN (di luar ERD): jumlah beli & data pengiriman per transaksi. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->integer('quantity')->default(1)->after('book_id');
            $table->string('recipient_name', 100)->nullable()->after('status');
            $table->string('phone', 20)->nullable()->after('recipient_name');
            $table->text('shipping_address')->nullable()->after('phone');
            $table->text('notes')->nullable()->after('shipping_address');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['quantity', 'recipient_name', 'phone', 'shipping_address', 'notes']);
        });
    }
};
