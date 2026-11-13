<?php

namespace App\Http\Requests;

use App\Models\Book;
use Illuminate\Contracts\Validation\Validator;
use App\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validasi checkout.
 *
 * Request ini SENGAJA tidak punya aturan untuk "price", "shipping_cost" atau "total_amount".
 * validated() hanya mengembalikan field yang ada di rules(), jadi harga
 * kiriman client tidak pernah sampai ke controller. Total dihitung di server.
 */
class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // dijaga oleh auth:sanctum + role:customer
    }

    public function rules(): array
    {
        return [
            'recipient_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^(\+62|62|0)8[0-9]{8,12}$/'],
            'shipping_address' => ['required', 'string', 'min:10', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],

            // Hanya KODE yang dikirim; tarif ongkir dicari di server (Transaction::SHIPPING_COSTS).
            'shipping_method' => ['required', Rule::in(array_keys(Transaction::SHIPPING_COSTS))],
            'payment_method' => ['required', Rule::in(Transaction::PAYMENT_METHODS)],

            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.book_id' => ['required', 'integer', 'distinct', 'exists:books,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon harus nomor Indonesia yang valid, contoh 081234567890.',
            'shipping_method.required' => 'Pilih metode pengiriman.',
            'payment_method.required' => 'Pilih metode pembayaran.',
            'items.required' => 'Keranjang tidak boleh kosong.',
            'items.*.book_id.exists' => 'Salah satu buku tidak tersedia.',
            'items.*.book_id.distinct' => 'Buku yang sama tidak boleh muncul dua kali.',
        ];
    }

    /** Pemeriksaan stok awal; pemeriksaan final aman race-condition ada di controller (lockForUpdate). */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $items = $this->input('items', []);
                $books = Book::whereIn('id', collect($items)->pluck('book_id'))
                    ->get(['id', 'title', 'stock'])
                    ->keyBy('id');

                foreach ($items as $index => $item) {
                    $book = $books->get($item['book_id']);

                    if ($book && $book->stock < $item['qty']) {
                        $validator->errors()->add(
                            "items.$index.qty",
                            "Stok \"{$book->title}\" tidak mencukupi (tersisa {$book->stock})."
                        );
                    }
                }
            },
        ];
    }
}
