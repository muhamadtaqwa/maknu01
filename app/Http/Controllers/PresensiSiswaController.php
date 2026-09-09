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
        $user = $request->user();
        $isAdmin = $user->role === "admin";
        $isGuru = $user->role === "guru";
        $isSiswa = $user->role === "siswa";

        $mode = $request->mode ?? 'harian';
        $tanggal = $request->tanggal ?? now()->format('Y-m-d');
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        // Filter siswa
        if ($isAdmin || $isGuru) {
            $semuaSiswa = Siswa::where('status', 'aktif')->orderBy('nama_lengkap')->get();
            $presensi = PresensiSiswa::with('siswa')
                ->whereDate('tanggal', $tanggal)
                ->orderBy('jam_masuk', 'asc')
                ->get();
        } else {
            // Siswa hanya lihat dirinya sendiri
            $semuaSiswa = Siswa::where('nis', $user->siswa->nis)->get();
            $presensi = PresensiSiswa::with('siswa')
                ->where('nis', $user->siswa->nis)
                ->whereDate('tanggal', $tanggal)
                ->orderBy('jam_masuk', 'asc')
                ->get();
        }

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
                    'jarak' => $p->jarak,
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

            $query = PresensiSiswa::with('siswa')
                ->whereBetween('tanggal', [$startOfWeek, $endOfWeek]);

            if ($isSiswa) {
                $query->where('nis', $user->siswa->nis);
            }

            $presensiMingguan = $query->get()->groupBy('nis');

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

            $query = PresensiSiswa::with('siswa')
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun);

            if ($isSiswa) {
                $query->where('nis', $user->siswa->nis);
            }

            $presensiBulanan = $query->get()->groupBy('nis');

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
            'jarak' => 'nullable|numeric',
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
            'jarak' => $request->jarak,
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
