<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Validasi create & update buku (admin). Cover dikirim sebagai multipart. */
class StoreBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // dijaga oleh middleware role:admin
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'author_id' => ['required', 'integer', 'exists:authors,id'],
            'genre_id' => ['required', 'integer', 'exists:genres,id'],
            'price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'description' => ['nullable', 'string', 'max:5000'],
            // SVG sengaja tidak diizinkan (risiko XSS).
            'cover_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_cover' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'cover_photo.image' => 'Cover harus berupa gambar.',
            'cover_photo.mimes' => 'Cover harus berformat JPG, PNG, atau WEBP.',
            'cover_photo.max' => 'Ukuran cover maksimal 2 MB.',
            'price.decimal' => 'Harga maksimal 2 angka di belakang koma.',
        ];
    }
}
