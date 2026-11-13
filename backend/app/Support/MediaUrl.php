<?php

namespace App\Support;

/**
 * Membangun URL publik untuk berkas di disk "public" lewat route API
 * GET /api/media/{folder}/{filename}.
 *
 * Alasan tidak memakai /storage:
 * - host mengikuti request masuk, jadi tidak bergantung pada APP_URL di .env
 * - tidak perlu `php artisan storage:link`
 * `?v=` (timestamp) memaksa browser memuat ulang saat berkas diganti.
 */
class MediaUrl
{
    public static function make(?string $path, ?int $version = null): ?string
    {
        if (! $path) {
            return null;
        }

        $url = url('/api/media/'.ltrim($path, '/'));

        return $version ? $url.'?v='.$version : $url;
    }
}
