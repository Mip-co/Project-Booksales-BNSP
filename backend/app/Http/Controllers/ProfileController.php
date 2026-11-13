<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /** GET /api/user/profile */
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()]);
    }

    /**
     * PUT /api/user/profile
     *
     * Upload file tidak bisa dibaca PHP dari request PUT multipart, jadi front-end
     * mengirim POST + field `_method=PUT` (method spoofing bawaan Laravel).
     * Foto disimpan di disk "public" dan dikembalikan sebagai `photo_url`
     * (URL publik /api/media/avatars/...).
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $data = $request->safe()->only(['name', 'email', 'phone', 'address']);

        if ($request->hasFile('photo')) {
            $this->deletePhoto($user);
            $data['photo'] = $request->file('photo')->store('avatars', 'public');
        } elseif ($request->boolean('remove_photo')) {
            $this->deletePhoto($user);
            $data['photo'] = null;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Data akun berhasil diperbarui.',
            'data' => $user->fresh(),
        ]);
    }

    private function deletePhoto(User $user): void
    {
        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }
    }
}
