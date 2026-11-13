<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel `users` sesuai ERD. Berkas ini menimpa migrasi bawaan Laravel
 * (nama sama) sehingga tabel cache/jobs/sessions/password_reset tidak dibuat.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->integer('id', true);                       // INT(11) PK AUTO_INCREMENT
            $table->string('name', 255);
            $table->string('email', 255)->unique();
            $table->string('password', 255);
            $table->string('photo', 255)->nullable();
            $table->enum('role', ['admin', 'customer'])->default('customer');
            $table->timestamp('last_access')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
