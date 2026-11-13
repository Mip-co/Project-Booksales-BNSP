<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validasi PUT /api/user/profile.
 * Role sengaja TIDAK ada di sini: tidak bisa diubah lewat profil.
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // dijaga oleh auth:sanctum
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'phone' => ['nullable', 'string', 'regex:/^(\+62|62|0)8[0-9]{8,12}$/'],
            'address' => ['nullable', 'string', 'max:500'],
            // SVG sengaja tidak diizinkan (risiko XSS).
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon harus nomor Indonesia yang valid, contoh 081234567890.',
            'photo.image' => 'Foto profil harus berupa gambar.',
            'photo.mimes' => 'Foto profil harus berformat JPG, PNG, atau WEBP.',
            'photo.max' => 'Ukuran foto profil maksimal 2 MB.',
            'email.unique' => 'Email sudah dipakai akun lain.',
        ];
    }
}
