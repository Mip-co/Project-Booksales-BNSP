<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/** Kelola Master User (khusus admin): Admin & Pelanggan. */
class UserController extends Controller
{
    /** GET /api/admin/users?search=&role= */
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $users = User::withCount('transactions')
            ->when($search !== '', fn ($q) => $q->where(
                fn ($w) => $w->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")
            ))
            ->when($request->filled('role'), fn ($q) => $q->where('role', (string) $request->query('role')))
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $users]);
    }

    public function store(UserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json([
            'message' => 'Akun berhasil dibuat.',
            'data' => $user->loadCount('transactions'),
        ], 201);
    }

    public function update(UserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();
        $isSelf = $user->is($request->user());

        // Mencegah admin mencabut hak aksesnya sendiri.
        if ($isSelf && $data['role'] !== $user->role) {
            throw ValidationException::withMessages([
                'role' => ['Anda tidak dapat mengubah role akun Anda sendiri.'],
            ]);
        }

        if (empty($data['password'])) {
            unset($data['password']); // kosong = password tidak diganti
        }

        $user->fill($data);
        $credentialsChanged = $user->isDirty(['password', 'role']);
        $user->save();

        // Password/role berubah => sesi lama akun tersebut dicabut.
        if ($credentialsChanged && ! $isSelf) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Akun berhasil diperbarui.',
            'data' => $user->loadCount('transactions'),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->is($request->user())) {
            return response()->json(['message' => 'Anda tidak dapat menghapus akun Anda sendiri.'], 422);
        }

        // Riwayat transaksi harus tetap utuh.
        if ($user->transactions()->exists()) {
            return response()->json([
                'message' => 'Akun ini memiliki riwayat transaksi dan tidak dapat dihapus.',
            ], 409);
        }

        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Akun berhasil dihapus.']);
    }
}
