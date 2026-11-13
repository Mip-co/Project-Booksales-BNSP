<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookRequest;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    private const WITH = ['author:id,name', 'genre:id,name'];

    /** GET /api/books?search=&genre_id= — publik. Search: judul ATAU nama penulis. */
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $books = Book::with(self::WITH)
            ->when($search !== '', fn ($q) => $q->where(
                fn ($w) => $w->where('title', 'like', "%{$search}%")
                    ->orWhereHas('author', fn ($a) => $a->where('name', 'like', "%{$search}%"))
            ))
            ->when($request->filled('genre_id'), fn ($q) => $q->where('genre_id', $request->integer('genre_id')))
            ->orderBy('title')
            ->get();

        return response()->json(['data' => $books]);
    }

    /** GET /api/books/{id} — publik, detail lengkap + penulis & genre. */
    public function show(Book $book): JsonResponse
    {
        return response()->json(['data' => $book->load(['author:id,name,bio', 'genre:id,name,description'])]);
    }

    public function store(StoreBookRequest $request): JsonResponse
    {
        $data = $request->safe()->except(['cover_photo', 'remove_cover']);

        if ($request->hasFile('cover_photo')) {
            $data['cover_photo'] = $request->file('cover_photo')->store('covers', 'public');
        }

        $book = Book::create($data);

        return response()->json([
            'message' => 'Buku berhasil ditambahkan.',
            'data' => $book->load(self::WITH),
        ], 201);
    }

    public function update(StoreBookRequest $request, Book $book): JsonResponse
    {
        $data = $request->safe()->except(['cover_photo', 'remove_cover']);

        if ($request->hasFile('cover_photo')) {
            $this->deleteCover($book);
            $data['cover_photo'] = $request->file('cover_photo')->store('covers', 'public');
        } elseif ($request->boolean('remove_cover')) {
            $this->deleteCover($book);
            $data['cover_photo'] = null;
        }

        $book->update($data);

        return response()->json([
            'message' => 'Buku berhasil diperbarui.',
            'data' => $book->fresh(self::WITH),
        ]);
    }

    public function destroy(Book $book): JsonResponse
    {
        // Riwayat transaksi harus tetap utuh.
        if ($book->transactions()->exists()) {
            return response()->json([
                'message' => 'Buku sudah pernah dipesan dan tidak dapat dihapus.',
            ], 409);
        }

        $this->deleteCover($book);
        $book->delete();

        return response()->json(['message' => 'Buku berhasil dihapus.']);
    }

    private function deleteCover(Book $book): void
    {
        if ($book->cover_photo) {
            Storage::disk('public')->delete($book->cover_photo);
        }
    }
}
