<?php

/*
|--------------------------------------------------------------------------
| CORS — mengizinkan SPA React (Vite) memanggil API Laravel
|--------------------------------------------------------------------------
| Autentikasi memakai Bearer Token (bukan cookie), sehingga
| supports_credentials = false. Daftar origin diatur lewat .env:
| CORS_ALLOWED_ORIGINS=http://localhost:5173
*/

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter(
        array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')))
    )),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
