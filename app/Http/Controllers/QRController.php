<?php

namespace App\Http\Controllers;

use App\Models\PresensiGuru;
use App\Models\PresensiSiswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QRController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $presensiHariIni = null;

        if ($user->role === 'guru') {
            $presensiHariIni = PresensiGuru::where('guru_id', $user->guru->id)
                ->whereDate('tanggal', now()->format('Y-m-d'))
                ->first();
        }

        if ($user->role === 'siswa') {
            $presensiHariIni = PresensiSiswa::where('nis', $user->siswa->nis)
                ->whereDate('tanggal', now()->format('Y-m-d'))
                ->first();
        }

        return Inertia::render('QR/Index', [
            'presensiHariIni' => $presensiHariIni,
        ]);
    }
}
