<?php

namespace App\Http\Controllers;

use App\Models\PresensiSiswa;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PresensiSiswaController extends Controller
{
    public function index(Request $request)
    {
        $mode = $request->mode ?? 'harian';
        $tanggal = $request->tanggal ?? now()->format('Y-m-d');
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        $presensi = PresensiSiswa::with('siswa')
            ->whereDate('tanggal', $tanggal)
            ->orderBy('jam_masuk', 'asc')
            ->get();

        $semuaSiswa = Siswa::where('status', 'aktif')->orderBy('nama_lengkap')->get();

        $hadir = [];
        $tidakHadir = [];
        $rekap = [];

        if ($mode === 'harian') {
            $hadir = $presensi->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nis' => $p->nis,
                    'nama' => $p->siswa->nama_lengkap ?? '-',
                    'jam_masuk' => $p->jam_masuk,
                    'status' => $p->status,
                ];
            });

            $hadirNis = $hadir->pluck('nis');

            $tidakHadir = $semuaSiswa
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

            $presensiMingguan = PresensiSiswa::with('siswa')
                ->whereBetween('tanggal', [$startOfWeek, $endOfWeek])
                ->get()
                ->groupBy('nis');

            $totalHariEfektif = 7;

            $rekap = $semuaSiswa->map(function ($s) use ($presensiMingguan, $totalHariEfektif) {
                $items = $presensiMingguan->get($s->nis, collect());
                $hadir = $items->count();
                $terlambat = $items->where('status', 'terlambat')->count();
                $tidak = $totalHariEfektif - $hadir;
                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_tidak' => max(0, $tidak),
                    'total_terlambat' => $terlambat,
                ];
            })->sortBy('nama')->values();
        }

        if ($mode === 'bulanan') {
            $totalHari = now()->daysInMonth;

            $presensiBulanan = PresensiSiswa::with('siswa')
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->get()
                ->groupBy('nis');

            $rekap = $semuaSiswa->map(function ($s) use ($presensiBulanan, $totalHari) {
                $items = $presensiBulanan->get($s->nis, collect());
                $hadir = $items->count();
                $terlambat = $items->where('status', 'terlambat')->count();
                $tidak = $totalHari - $hadir;
                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_tidak' => max(0, $tidak),
                    'total_terlambat' => $terlambat,
                    'terakhir_hadir' => $items->max('tanggal'),
                ];
            })->sortBy('nama')->values();
        }

        return Inertia::render('Presensi/Siswa', [
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
            'nis' => 'required|exists:siswas,nis',
        ]);

        $tanggal = now()->format('Y-m-d');
        $jam = now()->format('H:i:s');
        $status = $jam <= '07:00:00' ? 'tepat_waktu' : 'terlambat';

        $sudah = PresensiSiswa::where('nis', $request->nis)
            ->whereDate('tanggal', $tanggal)
            ->exists();

        if ($sudah) {
            return back()->with('error', 'Siswa sudah presensi hari ini.');
        }

        PresensiSiswa::create([
            'nis' => $request->nis,
            'tanggal' => $tanggal,
            'jam_masuk' => $jam,
            'status' => $status,
        ]);

        return back()->with('success', 'Presensi siswa berhasil.');
    }

    public function destroy($id)
    {
        $presensi = PresensiSiswa::findOrFail($id);
        $presensi->delete();
        return back()->with('success', 'Presensi dibatalkan.');
    }
}
