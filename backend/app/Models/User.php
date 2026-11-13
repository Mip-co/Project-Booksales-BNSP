<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_CUSTOMER = 'customer';

    protected $fillable = ['name', 'email', 'password', 'photo', 'role', 'phone', 'address'];

    /** "photo" (path internal) disembunyikan; front-end memakai "photo_url". */
    protected $hidden = ['password', 'photo'];

    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'last_access' => 'datetime',
        ];
    }

    /** ERD tidak memiliki kolom remember_token. */
    public function getRememberTokenName(): string
    {
        return '';
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn () => MediaUrl::make($this->photo, $this->updated_at?->timestamp));
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'customer_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /** Catat waktu akses terakhir tanpa mengubah updated_at (yang dipakai sebagai versi cache foto). */
    public function touchLastAccess(): void
    {
        $this->timestamps = false;
        $this->forceFill(['last_access' => now()])->save();
        $this->timestamps = true;
    }
}
