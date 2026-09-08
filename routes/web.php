<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\GuruController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PresensiGuruController;
use App\Http\Controllers\PresensiSiswaController;
use App\Http\Controllers\QRController;
use App\Http\Controllers\RekapController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TimelineController;
use Illuminate\Support\Facades\Route;

// Auth
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth');

// Authenticated
Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index']);

    // Siswa
    Route::get('/siswa', [SiswaController::class, 'index']);
    Route::post('/siswa', [SiswaController::class, 'store']);
    Route::put('/siswa/{id}', [SiswaController::class, 'update']);
    Route::delete('/siswa/{id}', [SiswaController::class, 'destroy']);

    // Guru
    Route::get('/guru', [GuruController::class, 'index']);
    Route::post('/guru', [GuruController::class, 'store']);
    Route::put('/guru/{id}', [GuruController::class, 'update']);
    Route::delete('/guru/{id}', [GuruController::class, 'destroy']);

    // Pembayaran
    Route::get('/pembayaran', [PembayaranController::class, 'index']);
    Route::post('/pembayaran', [PembayaranController::class, 'store']);
    Route::put('/pembayaran/{id}', [PembayaranController::class, 'update']);
    Route::delete('/pembayaran/{id}', [PembayaranController::class, 'destroy']);
    Route::post('/pembayaran/{id}/cicilan', [PembayaranController::class, 'cicilan']);
    Route::post('/pembayaran/generate', [PembayaranController::class, 'generate']);

    // Kategori Pembayaran
    Route::post('/jenis-pembayaran', [PembayaranController::class, 'storeJenis']);
    Route::delete('/jenis-pembayaran/{id}', [PembayaranController::class, 'deleteJenis']);

    // Presensi Guru
    Route::get('/presensi-guru', [PresensiGuruController::class, 'index']);
    Route::post('/presensi-guru', [PresensiGuruController::class, 'store']);
    Route::delete('/presensi-guru/{id}', [PresensiGuruController::class, 'destroy']);

    // Presensi Siswa
    Route::get('/presensi-siswa', [PresensiSiswaController::class, 'index']);
    Route::post('/presensi-siswa', [PresensiSiswaController::class, 'store']);
    Route::delete('/presensi-siswa/{id}', [PresensiSiswaController::class, 'destroy']);

    // QR
    Route::get('/qr', [QRController::class, 'index']);

    // Rekap
    Route::get('/rekap', [RekapController::class, 'index']);
    Route::get('/rekap/siswa', [RekapController::class, 'siswa']);
    Route::get('/api/rekap/siswa/{nis}', [RekapController::class, 'siswaDetailJson']);
    Route::get('/rekap/spp', [RekapController::class, 'spp']);
    Route::get('/rekap/buku', [RekapController::class, 'buku']);

    // Profil
    Route::get('/profil', [ProfileController::class, 'edit']);
    Route::put('/profil', [ProfileController::class, 'update']);
    Route::post('/profil/ganti-password', [ProfileController::class, 'gantiPassword']);

    // Timeline
    Route::get('/timeline', [TimelineController::class, 'index']);
    Route::post('/timeline', [TimelineController::class, 'store']);
    Route::put('/timeline/{id}', [TimelineController::class, 'update']);
    Route::delete('/timeline/{id}', [TimelineController::class, 'destroy']);
});
