<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Validasi create & update akun oleh admin (Kelola Master User). */
class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // dijaga oleh middleware role:admin
    }

    public function rules(): array
    {
        /** @var User|null $user */
        $user = $this->route('user'); // null saat create

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'email:rfc', 'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_CUSTOMER])],
            // Wajib saat membuat akun; saat mengubah, kosong = password tidak diganti.
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'regex:/^(\+62|62|0)8[0-9]{8,12}$/'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon harus nomor Indonesia yang valid, contoh 081234567890.',
        ];
    }
}
