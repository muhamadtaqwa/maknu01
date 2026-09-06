<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SantriController;
use App\Http\Controllers\UstadzController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PresensiController;
use App\Http\Controllers\PresensiSantriController;
use App\Http\Controllers\RekapController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PinjamGedungController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\InventarisController;
use App\Http\Controllers\PsbController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\CashflowController;
use App\Http\Controllers\TahfidzController;
use Illuminate\Support\Facades\Route;

// Auth
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth');

// PSB (publik)
Route::get('/psb', [PsbController::class, 'form']);
Route::post('/psb', [PsbController::class, 'store']);
Route::get('/psb/cetak/{id}', [PsbController::class, 'cetak']);
Route::get('/psb/cek', [PsbController::class, 'cek']);
Route::post('/psb/cek', [PsbController::class, 'cekStatus']);

// Authenticated
Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index']);

    // Jadwal Sholat
    Route::get('/jadwal-sholat', fn() => inertia('JadwalSholat/Index'));

    // Al-Quran
    Route::get('/al-quran', fn() => inertia('AlQuran/Index'));

    // PSB Verifikasi (admin)
    Route::get('/psb/verifikasi', [PsbController::class, 'index']);
    Route::put('/psb/{id}/verifikasi', [PsbController::class, 'verifikasi']);
    Route::put('/psb/{id}/batalkan', [PsbController::class, 'batalkan']);

    // Export
    Route::get('/export', fn() => inertia('Export/Emis'));
    Route::get('/export/santri', [ExportController::class, 'santri']);
    Route::get('/export/ustadz', [ExportController::class, 'ustadz']);

    // Santri
    Route::get('/santri', [SantriController::class, 'index']);
    Route::post('/santri', [SantriController::class, 'store']);
    Route::put('/santri/{id}', [SantriController::class, 'update']);
    Route::delete('/santri/{id}', [SantriController::class, 'destroy']);

    // Ustadz
    Route::get('/ustadz', [UstadzController::class, 'index']);
    Route::post('/ustadz', [UstadzController::class, 'store']);
    Route::put('/ustadz/{id}', [UstadzController::class, 'update']);
    Route::delete('/ustadz/{id}', [UstadzController::class, 'destroy']);

    // Pembayaran
    Route::get('/pembayaran', [PembayaranController::class, 'index']);
    Route::post('/pembayaran', [PembayaranController::class, 'store']);
    Route::put('/pembayaran/{id}', [PembayaranController::class, 'update']);
    Route::delete('/pembayaran/{id}', [PembayaranController::class, 'destroy']);
    Route::post('/pembayaran/{id}/cicilan', [PembayaranController::class, 'cicilan']);
    Route::post('/pembayaran/generate', [PembayaranController::class, 'generate']);
    Route::post('/pembayaran/{id}/upload-bukti', [PembayaranController::class, 'uploadBukti']);
    Route::post('/pembayaran/{id}/verifikasi', [PembayaranController::class, 'verifikasi']);

    // Kategori Pembayaran
    Route::post('/jenis-pembayaran', [PembayaranController::class, 'storeJenis']);
    Route::delete('/jenis-pembayaran/{id}', [PembayaranController::class, 'deleteJenis']);

    // Tagihan
    Route::get('/tagihan', [PembayaranController::class, 'tagihan']);

    // Presensi Ustadz
    Route::get('/presensi', [PresensiController::class, 'index']);
    Route::post('/presensi', [PresensiController::class, 'store']);
    Route::delete('/presensi/{id}', [PresensiController::class, 'destroy']);

    // Presensi Santri
    Route::get('/presensi-santri', [PresensiSantriController::class, 'index']);
    Route::post('/presensi-santri', [PresensiSantriController::class, 'store']);

    // Rekap
    Route::get('/rekap', [RekapController::class, 'index']);
    Route::get('/rekap/santri', [RekapController::class, 'santri']);
    Route::get('/api/rekap/santri/{nis}', [RekapController::class, 'santriDetailJson']);
    Route::get('/rekap/spp', [RekapController::class, 'spp']);
    Route::get('/rekap/kitab', [RekapController::class, 'kitab']);
    Route::get('/rekap/kas', [RekapController::class, 'kas']);
    Route::get('/rekap/anjem', [RekapController::class, 'anjem']);

    // Profil
    Route::get('/profil', [ProfileController::class, 'edit']);
    Route::put('/profil', [ProfileController::class, 'update']);
    Route::post('/profil/ganti-password', [ProfileController::class, 'gantiPassword']);
    Route::post('/simpan-lokasi', [ProfileController::class, 'simpanLokasi']);
    Route::post('/simpan-notif-adzan', [ProfileController::class, 'simpanNotifAdzan']);

    // Pinjam Gedung
    Route::get('/pinjam-gedung', [PinjamGedungController::class, 'index']);
    Route::post('/pinjam-gedung', [PinjamGedungController::class, 'store']);
    Route::put('/pinjam-gedung/{id}', [PinjamGedungController::class, 'update']);
    Route::delete('/pinjam-gedung/{id}', [PinjamGedungController::class, 'destroy']);

    // QR
    Route::get('/qr', fn() => inertia('QR/Index'));

    // Timeline
    Route::get('/timeline', [TimelineController::class, 'index']);
    Route::post('/timeline', [TimelineController::class, 'store']);
    Route::put('/timeline/{id}', [TimelineController::class, 'update']);
    Route::delete('/timeline/{id}', [TimelineController::class, 'destroy']);

    // Push Subscription
    Route::post('/push-subscribe', [PushSubscriptionController::class, 'store']);
    Route::delete('/push-unsubscribe', [PushSubscriptionController::class, 'destroy']);
    Route::post('/test-notif/jenis', [PushSubscriptionController::class, 'kirimTestJenis']);

    // Inventaris
    Route::get('/inventaris', [InventarisController::class, 'index']);
    Route::post('/inventaris', [InventarisController::class, 'store']);
    Route::put('/inventaris/{id}', [InventarisController::class, 'update']);
    Route::delete('/inventaris/{id}', [InventarisController::class, 'destroy']);

    // Surat
    Route::get('/surat', [LetterController::class, 'index']);
    Route::post('/surat', [LetterController::class, 'store']);
    Route::put('/surat/{id}', [LetterController::class, 'update']);
    Route::delete('/surat/{id}', [LetterController::class, 'destroy']);

    // Cashflow
    Route::get('/cashflow', [CashflowController::class, 'index']);
    Route::post('/cashflow', [CashflowController::class, 'store']);
    Route::put('/cashflow/{id}', [CashflowController::class, 'update']);
    Route::delete('/cashflow/{id}', [CashflowController::class, 'destroy']);

    // Tahfidz
    Route::get('/tahfidz', [TahfidzController::class, 'index']);
    Route::post('/tahfidz', [TahfidzController::class, 'store']);
    Route::put('/tahfidz/{id}', [TahfidzController::class, 'update']);
    Route::get('/tahfidz/{nis}/detail', [TahfidzController::class, 'detail']);
});
