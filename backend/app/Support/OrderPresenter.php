<?php

namespace App\Support;

use App\Models\Transaction;
use Illuminate\Support\Collection;

/**
 * Menyajikan baris `transactions` (satu baris = satu buku, sesuai ERD) sebagai
 * SATU order per checkout. Baris dikelompokkan dari awalan nomor order yang sama:
 * ORD-20261111-UIGX-1, -2, -3  =>  ORD-20261111-UIGX.
 */
class OrderPresenter
{
    /** ORD-20261111-UIGX-2 -> ORD-20261111-UIGX */
    public static function baseNumber(string $orderNumber): string
    {
        return preg_replace('/-\d+$/', '', $orderNumber);
    }

    /** @param Collection<int, Transaction> $rows */
    public static function group(Collection $rows): Collection
    {
        return $rows
            ->groupBy(fn (Transaction $t) => self::baseNumber($t->order_number))
            ->map(fn (Collection $group, string $base) => self::present($base, $group))
            ->values();
    }

    /** @param Collection<int, Transaction> $rows baris-baris milik satu checkout */
    public static function present(string $base, Collection $rows): array
    {
        $rows = $rows->sortBy('id')->values();
        $first = $rows->first();

        $items = $rows->map(function (Transaction $t) {
            $subtotal = self::cents($t->total_amount) - self::cents($t->shipping_cost);

            return [
                'id' => $t->id,
                'book_id' => $t->book_id,
                'title' => $t->book?->title,
                'author' => $t->book?->author?->name,
                'cover_url' => $t->book?->cover_url,
                'quantity' => $t->quantity,
                'price' => self::money((int) round($subtotal / max(1, $t->quantity))), // harga satuan
                'subtotal' => self::money($subtotal),
            ];
        })->all();

        $shippingCents = $rows->sum(fn (Transaction $t) => self::cents($t->shipping_cost));
        $totalCents = $rows->sum(fn (Transaction $t) => self::cents($t->total_amount));

        return [
            'order_number' => $base,
            'status' => self::status($rows),
            'items' => $items,
            'total_quantity' => $rows->sum('quantity'),
            'subtotal' => self::money($totalCents - $shippingCents),
            'shipping_cost' => self::money($shippingCents),
            'total_amount' => self::money($totalCents),
            'shipping_method' => $first->shipping_method,
            'payment_method' => $first->payment_method,
            'recipient_name' => $first->recipient_name,
            'phone' => $first->phone,
            'shipping_address' => $first->shipping_address,
            'notes' => $first->notes,
            'customer' => $first->relationLoaded('customer') ? $first->customer?->only(['id', 'name', 'email']) : null,
            'created_at' => $first->created_at,
        ];
    }

    /** Status order = status paling awal di antara barisnya (untuk data lama yang sempat berbeda). */
    public static function status(Collection $rows): string
    {
        $index = $rows
            ->map(fn (Transaction $t) => (int) array_search($t->status, Transaction::STATUS_FLOW, true))
            ->min();

        return Transaction::STATUS_FLOW[$index ?? 0];
    }

    private static function cents(mixed $value): int
    {
        return (int) round((float) $value * 100);
    }

    private static function money(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
    }
}
