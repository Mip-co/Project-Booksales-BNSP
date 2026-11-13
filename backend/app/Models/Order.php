<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    /** Urutan alur status pesanan. */
    public const STATUS_FLOW = ['pending', 'diproses', 'dikirim', 'selesai'];

    protected $fillable = [
        'order_code', 'user_id', 'customer_name', 'phone',
        'shipping_address', 'notes', 'total_price', 'status',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Status berikutnya dalam alur, atau null bila sudah "selesai". */
    public function nextStatus(): ?string
    {
        $index = array_search($this->status, self::STATUS_FLOW, true);

        return self::STATUS_FLOW[$index + 1] ?? null;
    }
}
