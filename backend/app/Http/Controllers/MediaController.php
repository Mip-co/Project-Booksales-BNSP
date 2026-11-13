<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * GET /api/media/{folder}/{filename} — publik (dipakai <img src> yang tidak bisa mengirim Bearer Token).
 * Folder dibatasi whitelist dan basename() mencegah path traversal.
 */
class MediaController extends Controller
{
    private const FOLDERS = ['avatars', 'authors', 'covers'];

    public function show(string $folder, string $filename): StreamedResponse
    {
        abort_unless(in_array($folder, self::FOLDERS, true), 404);

        $path = $folder.'/'.basename($filename);

        abort_unless(Storage::disk('public')->exists($path), 404);

        return Storage::disk('public')->response($path, null, [
            'Cache-Control' => 'public, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
