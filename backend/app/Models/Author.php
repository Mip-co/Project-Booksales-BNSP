<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Author extends Model
{
    protected $fillable = ['name', 'photo', 'bio'];

    protected $hidden = ['photo'];

    protected $appends = ['photo_url'];

    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn () => MediaUrl::make($this->photo, $this->updated_at?->timestamp));
    }

    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }
}
