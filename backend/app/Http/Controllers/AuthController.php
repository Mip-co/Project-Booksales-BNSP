<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Role SELALU customer. Client tidak bisa mendaftar sebagai admin.
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => User::ROLE_CUSTOMER,
        ]);
        $user->touchLastAccess();

        return $this->tokenResponse($user, 'Registrasi berhasil.', 201);
    }

    /**
     * Login universal: satu form untuk semua role.
     * Front-end membaca `data.user.role` dari respons untuk menentukan redirect.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau kata sandi salah.'],
            ]);
        }

        $user->touchLastAccess();

        return $this->tokenResponse($user, 'Login berhasil.');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->userPayload($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        // Hanya mencabut token yang sedang dipakai.
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    private function tokenResponse(User $user, string $message, int $status = 200): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'data' => [
                'token' => $user->createToken('booksales-spa')->plainTextToken,
                'token_type' => 'Bearer',
                'user' => $this->userPayload($user),
            ],
        ], $status);
    }

    private function userPayload(User $user): array
    {
        return $user->only(['id', 'name', 'email', 'role', 'phone', 'address', 'photo_url']);
    }
}
