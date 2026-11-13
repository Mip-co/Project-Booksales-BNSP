<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    /** GET /api/genres — publik (filter katalog) dan dipakai admin. */
    public function index(): JsonResponse
    {
        return response()->json(['data' => Genre::withCount('books')->orderBy('name')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $genre = Genre::create($this->validated($request));

        return response()->json(['message' => 'Genre berhasil ditambahkan.', 'data' => $genre->loadCount('books')], 201);
    }

    public function update(Request $request, Genre $genre): JsonResponse
    {
        $genre->update($this->validated($request));

        return response()->json(['message' => 'Genre berhasil diperbarui.', 'data' => $genre->loadCount('books')]);
    }

    public function destroy(Genre $genre): JsonResponse
    {
        if ($genre->books()->exists()) {
            return response()->json(['message' => 'Genre masih dipakai oleh buku dan tidak dapat dihapus.'], 409);
        }

        $genre->delete();

        return response()->json(['message' => 'Genre berhasil dihapus.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);
    }
}
