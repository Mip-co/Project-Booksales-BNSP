<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('stock');
            $table->string('cover_photo', 255)->nullable();
            $table->integer('genre_id');
            $table->integer('author_id');
            $table->timestamps();

            // INT bertanda sama dengan genres.id / authors.id, sehingga FK valid di MySQL.
            $table->foreign('genre_id')->references('id')->on('genres');
            $table->foreign('author_id')->references('id')->on('authors');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
