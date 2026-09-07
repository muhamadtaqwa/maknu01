<?php

namespace App\Http\Controllers;

use App\Models\PresensiGuru;
use App\Models\Guru;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PresensiGuruController extends Controller
{
    public function index(Request $request)
    {
        $mode = $request->mode ?? 'harian';
        $tanggal = $request->tanggal ?? now()->format('Y-m-d');
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        $presensi = PresensiGuru::with('guru')
            ->whereDate('tanggal', $tanggal)
            ->orderBy('jam_masuk', 'asc')
            ->get();

        $semuaGuru = Guru::where('status', 'aktif')->orderBy('nama_lengkap')->get();

        $hadir = [];
        $belumHadir = [];
        $rekap = [];

        if ($mode === 'harian') {
            $hadir = $presensi->map(function ($p) {
                return [
                    'guru_id' => $p->guru_id,
                    'nama' => $p->guru->nama_lengkap ?? '-',
                    'jam_masuk' => $p->jam_masuk,
                    'jam_pulang' => $p->jam_pulang,
                ];
            });

            $hadirIds = $hadir->pluck('guru_id');

            $belumHadir = $semuaGuru
                ->whereNotIn('id', $hadirIds)
                ->map(function ($g) {
                    return [
                        'guru_id' => $g->id,
                        'nama' => $g->nama_lengkap,
                    ];
                })
                ->values();
        }

        if ($mode === 'mingguan') {
            $startOfWeek = now()->startOfWeek()->format('Y-m-d');
            $endOfWeek = now()->endOfWeek()->format('Y-m-d');

            $presensiMingguan = PresensiGuru::with('guru')
                ->whereBetween('tanggal', [$startOfWeek, $endOfWeek])
                ->whereNotNull('jam_masuk')
                ->whereNotNull('jam_pulang')
                ->get()
                ->groupBy('guru_id');

            $totalHariEfektif = 7;

            $rekap = $semuaGuru->map(function ($g) use ($presensiMingguan, $totalHariEfektif) {
                $items = $presensiMingguan->get($g->id, collect());
                $hadir = $items->count();
                $tidak = $totalHariEfektif - $hadir;
                return [
                    'guru_id' => $g->id,
                    'nama' => $g->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_tidak' => max(0, $tidak),
                ];
            })->sortBy('nama')->values();
        }

        if ($mode === 'bulanan') {
            $totalHari = now()->daysInMonth;

            $presensiBulanan = PresensiGuru::with('guru')
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->whereNotNull('jam_masuk')
                ->whereNotNull('jam_pulang')
                ->get()
                ->groupBy('guru_id');

            $rekap = $semuaGuru->map(function ($g) use ($presensiBulanan, $totalHari) {
                $items = $presensiBulanan->get($g->id, collect());
                $hadir = $items->count();
                $tidak = $totalHari - $hadir;
                return [
                    'guru_id' => $g->id,
                    'nama' => $g->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_tidak' => max(0, $tidak),
                ];
            })->sortBy('nama')->values();
        }

        return Inertia::render('Presensi/Guru', [
            'presensi' => $presensi,
            'tanggal' => $tanggal,
            'mode' => $mode,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'hadir' => $hadir,
            'belumHadir' => $belumHadir,
            'rekap' => $rekap,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'guru_id' => 'required|exists:gurus,id',
        ]);

        $tanggal = now()->format('Y-m-d');
        $jam = now()->format('H:i:s');

        $presensi = PresensiGuru::where('guru_id', $request->guru_id)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if (!$presensi) {
            // Scan pertama = jam masuk
            PresensiGuru::create([
                'guru_id' => $request->guru_id,
                'tanggal' => $tanggal,
                'jam_masuk' => $jam,
            ]);
            return back()->with('success', 'Jam masuk tercatat.');
        }

        if ($presensi->jam_masuk && !$presensi->jam_pulang) {
            // Scan kedua = jam pulang
            $presensi->update(['jam_pulang' => $jam]);
            return back()->with('success', 'Jam pulang tercatat.');
        }

        return back()->with('error', 'Presensi hari ini sudah lengkap.');
    }

    public function destroy($id)
    {
        PresensiGuru::findOrFail($id)->delete();
        return back()->with('success', 'Presensi dihapus.');
    }
}
