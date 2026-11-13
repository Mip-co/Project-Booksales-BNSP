<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Book;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    // ------------------------------------------------------------------
    // CUSTOMER
    // ------------------------------------------------------------------

    /** POST /api/orders */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();

        $order = DB::transaction(function () use ($data, $request) {
            // Kunci baris buku sampai transaksi selesai agar dua checkout
            // bersamaan tidak bisa sama-sama "menghabiskan" stok yang sama.
            $books = Book::whereIn('id', collect($data['items'])->pluck('book_id'))
                ->where('is_active', true)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $total = 0;
            $rows = [];

            foreach ($data['items'] as $index => $item) {
                $book = $books->get($item['book_id']);

                if (! $book || $book->stock < $item['qty']) {
                    throw ValidationException::withMessages([
                        "items.$index.qty" => ['Stok buku tidak mencukupi. Silakan perbarui keranjang.'],
                    ]);
                }

                // HARGA DIAMBIL DARI DATABASE, bukan dari request.
                $unitPrice = $book->price;
                $subtotal = $unitPrice * $item['qty'];
                $total += $subtotal;

                $rows[] = [
                    'book_id' => $book->id,
                    'book_title' => $book->title,   // snapshot
                    'price' => $unitPrice,          // snapshot
                    'qty' => $item['qty'],
                    'subtotal' => $subtotal,
                ];

                $book->decrement('stock', $item['qty']);
            }

            $order = Order::create([
                'order_code' => $this->generateOrderCode(),
                'user_id' => $request->user()->id,
                'customer_name' => $data['customer_name'],
                'phone' => $data['phone'],
                'shipping_address' => $data['shipping_address'],
                'notes' => $data['notes'] ?? null,
                'total_price' => $total,
                'status' => 'pending',
            ]);

            $order->items()->createMany($rows);

            return $order;
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'data' => $order->load('items'),
        ], 201);
    }

    /** GET /api/orders/my-orders */
    public function myOrders(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->get();

        return response()->json(['data' => $orders]);
    }

    /** GET /api/orders/code/{code} — hanya pesanan milik user yang login. */
    public function showByCode(Request $request, string $code): JsonResponse
    {
        $order = Order::with('items')
            ->where('order_code', $code)
            ->where('user_id', $request->user()->id) // mencegah IDOR
            ->firstOrFail();

        return response()->json(['data' => $order]);
    }

    // ------------------------------------------------------------------
    // ADMIN
    // ------------------------------------------------------------------

    /** GET /api/admin/orders — Live Order Monitor. */
    public function adminIndex(): JsonResponse
    {
        $orders = Order::with(['items', 'user:id,name,email'])
            ->latest()
            ->limit(100)
            ->get();

        return response()->json(['data' => $orders]);
    }

    /** PATCH /api/admin/orders/{order}/status */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(Order::STATUS_FLOW)],
        ]);

        // Status hanya boleh maju satu langkah: pending -> diproses -> dikirim -> selesai.
        if ($data['status'] !== $order->nextStatus()) {
            $next = $order->nextStatus();

            throw ValidationException::withMessages([
                'status' => [$next
                    ? "Status berikutnya yang valid untuk pesanan ini adalah \"{$next}\"."
                    : 'Pesanan sudah selesai dan tidak dapat diubah lagi.'],
            ]);
        }

        $order->update(['status' => $data['status']]);

        return response()->json([
            'message' => 'Status pesanan diperbarui.',
            'data' => $order->load(['items', 'user:id,name,email']),
        ]);
    }

    // ------------------------------------------------------------------

    private function generateOrderCode(): string
    {
        do {
            $code = 'ORD-'.now()->format('Ymd').'-'.strtoupper(Str::random(4));
        } while (Order::where('order_code', $code)->exists());

        return $code;
    }
}
