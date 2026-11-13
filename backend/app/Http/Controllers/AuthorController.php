<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuthorRequest;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

/** Kelola Penulis (admin). Tabel `authors` sesuai ERD. */
class AuthorController extends Controller
{
    /** GET /api/admin/authors */
    public function index(): JsonResponse
    {
        return response()->json(['data' => Author::withCount('books')->orderBy('name')->get()]);
    }

    public function store(AuthorRequest $request): JsonResponse
    {
        $data = $request->safe()->except(['photo', 'remove_photo']);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('authors', 'public');
        }

        $author = Author::create($data);

        return response()->json(['message' => 'Penulis berhasil ditambahkan.', 'data' => $author->loadCount('books')], 201);
    }

    public function update(AuthorRequest $request, Author $author): JsonResponse
    {
        $data = $request->safe()->except(['photo', 'remove_photo']);

        if ($request->hasFile('photo')) {
            $this->deletePhoto($author);
            $data['photo'] = $request->file('photo')->store('authors', 'public');
        } elseif ($request->boolean('remove_photo')) {
            $this->deletePhoto($author);
            $data['photo'] = null;
        }

        $author->update($data);

        return response()->json(['message' => 'Penulis berhasil diperbarui.', 'data' => $author->fresh()->loadCount('books')]);
    }

    public function destroy(Author $author): JsonResponse
    {
        if ($author->books()->exists()) {
            return response()->json(['message' => 'Penulis masih memiliki buku dan tidak dapat dihapus.'], 409);
        }

        $this->deletePhoto($author);
        $author->delete();

        return response()->json(['message' => 'Penulis berhasil dihapus.']);
    }

    private function deletePhoto(Author $author): void
    {
        if ($author->photo) {
            Storage::disk('public')->delete($author->photo);
        }
    }
}
