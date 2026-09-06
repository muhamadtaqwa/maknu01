<?php

namespace App\Http\Controllers;

use App\Models\PresensiSantri;
use App\Models\Santri;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PresensiSantriController extends Controller
{
    public function index(Request $request)
    {
        $mode = $request->mode ?? 'harian';
        $tanggal = $request->tanggal ?? now()->format('Y-m-d');
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        $presensi = PresensiSantri::with('santri')
            ->whereDate('tanggal', $tanggal)
            ->orderBy('jam', 'asc')
            ->get();

        $semuaSantri = Santri::where('status', 'aktif')->orderBy('nama_lengkap')->get();

        $hadir = [];
        $tidakHadir = [];
        $rekap = [];

        if ($mode === 'harian') {
            $hadir = $presensi->map(function ($p) {
                return [
                    'nis' => $p->nis,
                    'nama' => $p->santri->nama_lengkap ?? '-',
                    'jam' => $p->jam,
                ];
            });

            $hadirNis = $hadir->pluck('nis');

            $tidakHadir = $semuaSantri
                ->whereNotIn('nis', $hadirNis)
                ->map(function ($s) {
                    return [
                        'nis' => $s->nis,
                        'nama' => $s->nama_lengkap,
                    ];
                })
                ->values();
        }

        if ($mode === 'mingguan') {
            $startOfWeek = now()->startOfWeek()->format('Y-m-d');
            $endOfWeek = now()->endOfWeek()->format('Y-m-d');

            $presensiMingguan = PresensiSantri::with('santri')
                ->whereBetween('tanggal', [$startOfWeek, $endOfWeek])
                ->get()
                ->groupBy('nis');

            $totalHariEfektif = 7;

            $rekap = $semuaSantri->map(function ($s) use ($presensiMingguan, $totalHariEfektif) {
                $items = $presensiMingguan->get($s->nis, collect());
                $hadir = $items->count();
                $tidak = $totalHariEfektif - $hadir;
                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_tidak' => max(0, $tidak),
                ];
            })->sortBy('nama')->values();
        }

        if ($mode === 'bulanan') {
            $totalHari = now()->daysInMonth;

            $presensiBulanan = PresensiSantri::with('santri')
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->get()
                ->groupBy('nis');

            $rekap = $semuaSantri->map(function ($s) use ($presensiBulanan, $totalHari) {
                $items = $presensiBulanan->get($s->nis, collect());
                $hadir = $items->count();
                $tidak = $totalHari - $hadir;
                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_tidak' => max(0, $tidak),
                    'terakhir_hadir' => $items->max('tanggal'),
                ];
            })->sortBy('nama')->values();
        }

        return Inertia::render('Presensi/Santri', [
            'presensi' => $presensi,
            'tanggal' => $tanggal,
            'mode' => $mode,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'hadir' => $hadir,
            'tidakHadir' => $tidakHadir,
            'rekap' => $rekap,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|exists:santris,nis',
        ]);

        $tanggal = now()->format('Y-m-d');
        $jam = now()->format('H:i:s');

        $sudah = PresensiSantri::where('nis', $request->nis)
            ->whereDate('tanggal', $tanggal)
            ->exists();

        if ($sudah) {
            return back()->with('error', 'Santri sudah presensi hari ini.');
        }

        PresensiSantri::create([
            'nis' => $request->nis,
            'tanggal' => $tanggal,
            'jam' => $jam,
        ]);

        return back()->with('success', 'Presensi santri berhasil.');
    }
}
