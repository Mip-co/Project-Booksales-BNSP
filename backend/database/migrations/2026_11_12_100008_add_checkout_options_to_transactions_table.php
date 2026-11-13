<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** KOLOM TAMBAHAN (di luar ERD): kurir, ongkos kirim, dan metode pembayaran. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('shipping_method', 20)->nullable()->after('notes');
            $table->decimal('shipping_cost', 10, 2)->default(0)->after('shipping_method');
            $table->string('payment_method', 20)->nullable()->after('shipping_cost');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['shipping_method', 'shipping_cost', 'payment_method']);
        });
    }
};
