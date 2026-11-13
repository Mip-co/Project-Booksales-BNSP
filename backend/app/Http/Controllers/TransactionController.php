<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Book;
use App\Models\Transaction;
use App\Support\OrderPresenter;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Sesuai ERD, satu baris `transactions` = satu buku.
 * Checkout dengan N buku menghasilkan N baris dengan nomor order
 * berawalan sama: ORD-YYYYMMDD-XXXX-1, ORD-YYYYMMDD-XXXX-2, dst.
 * Ongkos kirim dibebankan satu kali pada baris pertama (kolom shipping_cost).
 *
 * API menyajikan baris-baris itu sebagai SATU order per checkout (lihat OrderPresenter):
 * order_number tanpa akhiran, daftar `items`, total keseluruhan, dan status yang
 * diubah serentak untuk semua barisnya.
 */
class TransactionController extends Controller
{
    private const WITH = [
        'book:id,title,cover_photo,author_id,updated_at',
        'book.author:id,name',
    ];

    // ------------------------------------------------------------------
    // CUSTOMER
    // ------------------------------------------------------------------

    /** POST /api/transactions */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $data = $request->validated();

        [$base, $transactions] = DB::transaction(function () use ($data, $request) {
            // Kunci baris buku sampai transaksi selesai agar dua checkout
            // bersamaan tidak bisa sama-sama "menghabiskan" stok yang sama.
            $books = Book::whereIn('id', collect($data['items'])->pluck('book_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $base = $this->generateOrderBase();
            $created = [];

            // Ongkir dihitung di server dari kode kurir, dan dibebankan SEKALI per checkout
            // (pada baris pertama). total_amount baris pertama = harga buku + ongkir.
            $shippingCents = Transaction::SHIPPING_COSTS[$data['shipping_method']] * 100;

            foreach ($data['items'] as $index => $item) {
                $book = $books->get($item['book_id']);

                if (! $book || $book->stock < $item['qty']) {
                    throw ValidationException::withMessages([
                        "items.$index.qty" => ['Stok buku tidak mencukupi. Silakan perbarui keranjang.'],
                    ]);
                }

                // HARGA DIAMBIL DARI DATABASE. Hitung dalam sen (integer) agar tidak ada galat float.
                $itemCents = (int) round((float) $book->price * 100) * $item['qty'];
                $rowShipping = $index === 0 ? $shippingCents : 0;
                $cents = $itemCents + $rowShipping;

                if ($cents > 9_999_999_999) { // batas DECIMAL(10,2)
                    throw ValidationException::withMessages([
                        "items.$index.qty" => ['Total transaksi melebihi batas yang diizinkan.'],
                    ]);
                }

                $book->decrement('stock', $item['qty']);

                $created[] = Transaction::create([
                    'order_number' => $base.'-'.($index + 1),
                    'customer_id' => $request->user()->id,
                    'book_id' => $book->id,
                    'quantity' => $item['qty'],
                    'total_amount' => number_format($cents / 100, 2, '.', ''),
                    'status' => 'pending',
                    'recipient_name' => $data['recipient_name'],
                    'phone' => $data['phone'],
                    'shipping_address' => $data['shipping_address'],
                    'notes' => $data['notes'] ?? null,
                    'shipping_method' => $data['shipping_method'],
                    'shipping_cost' => number_format($rowShipping / 100, 2, '.', ''),
                    'payment_method' => $data['payment_method'],
                ]);
            }

            return [$base, new EloquentCollection($created)];
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'data' => OrderPresenter::present($base, $transactions->load(self::WITH)),
        ], 201);
    }

    /** GET /api/transactions (alias: /my) — riwayat milik user yang login, 1 objek per checkout. */
    public function my(Request $request): JsonResponse
    {
        $rows = $request->user()
            ->transactions()
            ->with(self::WITH)
            ->latest()
            ->latest('id')
            ->get();

        return response()->json(['data' => OrderPresenter::group($rows)]);
    }

    // ------------------------------------------------------------------
    // ADMIN
    // ------------------------------------------------------------------

    /** GET /api/admin/transactions — Live Order Monitor, 1 objek per checkout. */
    public function adminIndex(): JsonResponse
    {
        $rows = Transaction::with([...self::WITH, 'customer:id,name,email'])
            ->latest()
            ->latest('id')
            ->limit(500)
            ->get();

        return response()->json(['data' => OrderPresenter::group($rows)]);
    }

    /**
     * PATCH /api/admin/transactions/{orderNumber}/status
     * {orderNumber} = nomor order tanpa akhiran (ORD-20261111-UIGX). Status SEMUA baris
     * checkout itu diubah serentak dalam satu transaksi database.
     */
    public function updateStatus(Request $request, string $orderNumber): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(Transaction::STATUS_FLOW)],
        ]);

        $order = DB::transaction(function () use ($orderNumber, $data) {
            $rows = Transaction::where('order_number', 'like', $orderNumber.'-%')
                ->lockForUpdate()
                ->get();

            abort_if($rows->isEmpty(), 404, 'Order tidak ditemukan.');

            // Status hanya boleh maju satu langkah: pending -> diproses -> dikirim -> selesai.
            $current = OrderPresenter::status($rows);
            $next = Transaction::STATUS_FLOW[array_search($current, Transaction::STATUS_FLOW, true) + 1] ?? null;

            if ($data['status'] !== $next) {
                throw ValidationException::withMessages([
                    'status' => [$next
                        ? "Status berikutnya yang valid untuk order ini adalah \"{$next}\"."
                        : 'Order sudah selesai dan tidak dapat diubah lagi.'],
                ]);
            }

            Transaction::whereIn('id', $rows->pluck('id'))->update(['status' => $next, 'updated_at' => now()]);

            return OrderPresenter::present(
                $orderNumber,
                Transaction::with([...self::WITH, 'customer:id,name,email'])->whereIn('id', $rows->pluck('id'))->get()
            );
        });

        return response()->json(['message' => 'Status order diperbarui.', 'data' => $order]);
    }

    // ------------------------------------------------------------------

    private function generateOrderBase(): string
    {
        do {
            $base = 'ORD-'.now()->format('Ymd').'-'.strtoupper(Str::random(4));
        } while (Transaction::where('order_number', 'like', $base.'-%')->exists());

        return $base;
    }
}
