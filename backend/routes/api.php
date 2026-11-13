<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| 1. PUBLIC — tanpa token
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show'])->whereNumber('book');
Route::get('/genres', [GenreController::class, 'index']);

// Berkas gambar untuk <img src> (tidak bisa mengirim Bearer Token).
Route::get('/media/{folder}/{filename}', [MediaController::class, 'show'])
    ->where(['folder' => '[a-z]+', 'filename' => '[A-Za-z0-9._-]+']);

/*
|--------------------------------------------------------------------------
| 2. AUTHENTICATED — semua role (Bearer Token Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user/profile', [ProfileController::class, 'show']);   
    Route::put('/user/profile', [ProfileController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| 3. PROTECTED CUSTOMER — token + role:customer
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:customer'])->prefix('transactions')->group(function () {
    Route::post('/', [TransactionController::class, 'store']);
    Route::get('/', [TransactionController::class, 'my']);
    Route::get('/my', [TransactionController::class, 'my']);
});

/*
|--------------------------------------------------------------------------
| 4. PROTECTED ADMIN — token + role:admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/transactions', [TransactionController::class, 'adminIndex'])->name('transactions.index');
        // {orderNumber} = nomor order tanpa akhiran, mis. ORD-20261111-UIGX (semua bukunya ikut berubah).
        Route::patch('/transactions/{orderNumber}/status', [TransactionController::class, 'updateStatus'])
            ->where('orderNumber', 'ORD-[0-9]{8}-[A-Za-z0-9]{4}')
            ->name('transactions.status');

        // Daftar & detail buku/genre memakai endpoint publik di atas.
        Route::apiResource('books', BookController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('genres', GenreController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('authors', AuthorController::class)->except('show');
        Route::apiResource('users', UserController::class)->except('show');
    });
