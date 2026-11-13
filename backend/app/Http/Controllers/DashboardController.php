<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    /** GET /api/admin/dashboard */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'stats' => [
                    'total_revenue' => (float) Transaction::where('status', 'selesai')->sum('total_amount'),
                    // ERD tidak punya is_active: "produk aktif" = SKU yang stoknya masih ada.
                    'active_books' => Book::where('stock', '>', 0)->count(),
                    'total_customers' => User::where('role', User::ROLE_CUSTOMER)->count(),
                    'total_stock' => (int) Book::sum('stock'),
                ],
                'sales_trend' => $this->salesTrend(),
                'genre_distribution' => $this->genreDistribution(),
            ],
        ]);
    }

    /** Omset transaksi "selesai" per bulan, 6 bulan terakhir (bulan tanpa transaksi = 0). */
    private function salesTrend(): array
    {
        $start = now()->startOfMonth()->subMonths(5);

        $totals = Transaction::where('status', 'selesai')
            ->where('created_at', '>=', $start)
            ->get(['total_amount', 'created_at'])
            ->groupBy(fn (Transaction $t) => $t->created_at->format('Y-m'))
            ->map(fn ($group) => (float) $group->sum('total_amount'));

        return collect(range(0, 5))->map(function (int $i) use ($start, $totals) {
            $month = $start->copy()->addMonths($i);
            $key = $month->format('Y-m');

            return [
                'month' => $key,
                'label' => self::MONTH_LABELS[$month->month - 1],
                'total' => $totals->get($key, 0),
            ];
        })->all();
    }

    /** Jumlah eksemplar terjual per genre (hanya transaksi "selesai"). */
    private function genreDistribution(): array
    {
        return DB::table('transactions')
            ->join('books', 'books.id', '=', 'transactions.book_id')
            ->join('genres', 'genres.id', '=', 'books.genre_id')
            ->where('transactions.status', 'selesai')
            ->groupBy('genres.id', 'genres.name')
            ->orderByDesc(DB::raw('SUM(transactions.quantity)'))
            ->select('genres.name', DB::raw('SUM(transactions.quantity) as qty'))
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'qty' => (int) $row->qty])
            ->all();
    }
}
