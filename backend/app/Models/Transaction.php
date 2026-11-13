<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    /** Urutan alur status pesanan. */
    public const STATUS_FLOW = ['pending', 'diproses', 'dikirim', 'selesai'];

    /** Tarif kurir (Rupiah). Server yang menentukan; nilai dari client tidak pernah dipercaya. */
    public const SHIPPING_COSTS = [
        'hemat' => 10000,
        'reguler' => 15000,
        'instan' => 25000,
    ];

    public const PAYMENT_METHODS = ['cod', 'transfer', 'ewallet'];

    protected $fillable = [
        'order_number', 'customer_id', 'book_id', 'quantity', 'total_amount', 'status',
        'recipient_name', 'phone', 'shipping_address', 'notes',
        'shipping_method', 'shipping_cost', 'payment_method',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /** Status berikutnya dalam alur, atau null bila sudah "selesai". */
    public function nextStatus(): ?string
    {
        $index = array_search($this->status, self::STATUS_FLOW, true);

        return self::STATUS_FLOW[$index + 1] ?? null;
    }
}
