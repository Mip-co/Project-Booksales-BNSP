<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    protected $fillable = ['title', 'description', 'price', 'stock', 'cover_photo', 'genre_id', 'author_id'];

    protected $hidden = ['cover_photo'];

    protected $appends = ['cover_url'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    protected function coverUrl(): Attribute
    {
        return Attribute::get(fn () => MediaUrl::make($this->cover_photo, $this->updated_at?->timestamp));
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
