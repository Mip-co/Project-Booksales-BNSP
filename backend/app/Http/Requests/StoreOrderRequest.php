<?php

namespace App\Http\Requests;

use App\Models\Book;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validasi checkout.
 *
 * Request ini SENGAJA tidak punya aturan untuk "price", "subtotal", atau
 * "total_price". validated() hanya mengembalikan field yang ada di rules(),
 * jadi nilai harga kiriman client tidak akan pernah sampai ke controller.
 * Total dihitung murni di server (lihat OrderController@store).
 */
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // akses dijaga oleh middleware auth:sanctum + role:customer
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^(\+62|62|0)8[0-9]{8,12}$/'],
            'shipping_address' => ['required', 'string', 'min:10', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],

            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.book_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('books', 'id')->where('is_active', true),
            ],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon harus nomor Indonesia yang valid, contoh 081234567890.',
            'items.required' => 'Keranjang tidak boleh kosong.',
            'items.*.book_id.exists' => 'Salah satu buku tidak tersedia.',
            'items.*.book_id.distinct' => 'Buku yang sama tidak boleh muncul dua kali.',
        ];
    }

    /**
     * Pemeriksaan stok setelah aturan dasar lolos.
     * Pemeriksaan final yang aman dari race condition tetap dilakukan
     * di dalam DB::transaction dengan lockForUpdate().
     */
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
