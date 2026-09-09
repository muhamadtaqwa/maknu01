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
        $user = $request->user();
        $isAdmin = $user->role === "admin";
        $isGuru = $user->role === "guru";

        // Cek akses
        if (!$isAdmin && !$isGuru) {
            abort(403);
        }

        $mode = $request->mode ?? 'harian';
        $tanggal = $request->tanggal ?? now()->format('Y-m-d');
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;

        // Filter guru
        if ($isAdmin) {
            $semuaGuru = Guru::where('status', 'aktif')->orderBy('nama_lengkap')->get();
            $presensi = PresensiGuru::with('guru')
                ->whereDate('tanggal', $tanggal)
                ->orderBy('jam_masuk', 'asc')
                ->get();
        } else {
            // Guru hanya lihat dirinya sendiri
            $semuaGuru = Guru::where('id', $user->guru->id)->get();
            $presensi = PresensiGuru::with('guru')
                ->where('guru_id', $user->guru->id)
                ->whereDate('tanggal', $tanggal)
                ->orderBy('jam_masuk', 'asc')
                ->get();
        }

        $hadir = [];
        $belumHadir = [];
        $rekap = [];

        if ($mode === 'harian') {
            $hadir = $presensi->map(function ($p) {
                return [
                    'id' => $p->id,
                    'guru_id' => $p->guru_id,
                    'nama' => $p->guru->nama_lengkap ?? '-',
                    'jam_masuk' => $p->jam_masuk,
                    'jam_pulang' => $p->jam_pulang,
                    'status' => $p->status,
                    'jarak' => $p->jarak,
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

            $query = PresensiGuru::with('guru')
                ->whereBetween('tanggal', [$startOfWeek, $endOfWeek])
                ->whereNotNull('jam_masuk')
                ->whereNotNull('jam_pulang');

            if (!$isAdmin) {
                $query->where('guru_id', $user->guru->id);
            }

            $presensiMingguan = $query->get()->groupBy('guru_id');

            $totalHariEfektif = 7;

            $rekap = $semuaGuru->map(function ($g) use ($presensiMingguan, $totalHariEfektif) {
                $items = $presensiMingguan->get($g->id, collect());
                $hadir = $items->count();
                $terlambat = $items->where('status', 'terlambat')->count();
                $tidak = $totalHariEfektif - $hadir;
                return [
                    'guru_id' => $g->id,
                    'nama' => $g->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_tidak' => max(0, $tidak),
                    'total_terlambat' => $terlambat,
                ];
            })->sortBy('nama')->values();
        }

        if ($mode === 'bulanan') {
            $totalHari = now()->daysInMonth;

            $query = PresensiGuru::with('guru')
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->whereNotNull('jam_masuk')
                ->whereNotNull('jam_pulang');

            if (!$isAdmin) {
                $query->where('guru_id', $user->guru->id);
            }

            $presensiBulanan = $query->get()->groupBy('guru_id');

            $rekap = $semuaGuru->map(function ($g) use ($presensiBulanan, $totalHari) {
                $items = $presensiBulanan->get($g->id, collect());
                $hadir = $items->count();
                $terlambat = $items->where('status', 'terlambat')->count();
                $tidak = $totalHari - $hadir;
                return [
                    'guru_id' => $g->id,
                    'nama' => $g->nama_lengkap,
                    'total_hadir' => $hadir,
                    'total_tidak' => max(0, $tidak),
                    'total_terlambat' => $terlambat,
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
            'jarak' => 'nullable|numeric',
        ]);

        $tanggal = now()->format('Y-m-d');
        $jam = now()->format('H:i:s');
        $status = $jam <= '07:00:00' ? 'tepat_waktu' : 'terlambat';

        $presensi = PresensiGuru::where('guru_id', $request->guru_id)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if (!$presensi) {
            PresensiGuru::create([
                'guru_id' => $request->guru_id,
                'tanggal' => $tanggal,
                'jam_masuk' => $jam,
                'status' => $status,
                'jarak' => $request->jarak,
            ]);
            return back()->with('success', 'Jam masuk tercatat.');
        }

        if ($presensi->jam_masuk && !$presensi->jam_pulang) {
            $presensi->update(['jam_pulang' => $jam]);
            return back()->with('success', 'Jam pulang tercatat.');
        }

        return back()->with('error', 'Presensi hari ini sudah lengkap.');
    }

    public function batalkanMasuk($id)
    {
        $presensi = PresensiGuru::findOrFail($id);

        if ($presensi->jam_pulang) {
            return back()->with('error', 'Tidak bisa membatalkan jam masuk karena jam pulang sudah tercatat.');
        }

        $presensi->delete();
        return back()->with('success', 'Jam masuk dibatalkan.');
    }

    public function batalkanPulang($id)
    {
        $presensi = PresensiGuru::findOrFail($id);

        if (!$presensi->jam_pulang) {
            return back()->with('error', 'Jam pulang belum tercatat.');
        }

        $presensi->update(['jam_pulang' => null]);
        return back()->with('success', 'Jam pulang dibatalkan.');
    }

    public function destroy($id)
    {
        $presensi = PresensiGuru::findOrFail($id);
        $presensi->delete();
        return back()->with('success', 'Presensi dibatalkan.');
    }
}
