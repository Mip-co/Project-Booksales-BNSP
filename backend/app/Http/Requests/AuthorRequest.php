<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Validasi create & update penulis (admin). */
class AuthorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // dijaga oleh middleware role:admin
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:3000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
        ];
    }
}
