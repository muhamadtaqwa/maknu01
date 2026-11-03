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
            $guruId = $user->guru?->id;
            $semuaGuru = $guruId ? Guru::where('id', $guruId)->get() : collect();
            $presensi = $guruId ? PresensiGuru::with('guru')
                ->where('guru_id', $guruId)
                ->whereDate('tanggal', $tanggal)
                ->orderBy('jam_masuk', 'asc')
                ->get() : collect();
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
                ->whereNotNull('jam_masuk');

            if (!$isAdmin) {
                $query->where('guru_id', $user->guru?->id);
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
                ->whereNotNull('jam_masuk');

            if (!$isAdmin) {
                $query->where('guru_id', $user->guru?->id);
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
        $user = $request->user();

        if ($user->role === 'guru') {
            $guruId = $user->guru?->id;
            if (!$guruId) {
                return back()->with('error', 'Data profil guru tidak ditemukan.');
            }
        } elseif ($user->role === 'admin') {
            $request->validate([
                'guru_id' => 'required|exists:gurus,id',
            ]);
            $guruId = $request->guru_id;
        } else {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'jarak' => 'nullable|numeric',
        ]);

        $tanggal = now()->format('Y-m-d');
        $jam = now()->format('H:i:s');
        $status = 'tepat_waktu'; // Guru tidak ada status terlambat

        $presensi = PresensiGuru::where('guru_id', $guruId)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if (!$presensi) {
            PresensiGuru::create([
                'guru_id' => $guruId,
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
        $user = request()->user();
        $presensi = PresensiGuru::findOrFail($id);

        if ($user->role !== 'admin' && $user->guru?->id !== $presensi->guru_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk membatalkan jam masuk ini.');
        }

        if ($presensi->jam_pulang) {
            return back()->with('error', 'Tidak bisa membatalkan jam masuk karena jam pulang sudah tercatat.');
        }

        $presensi->delete();
        return back()->with('success', 'Jam masuk dibatalkan.');
    }

    public function batalkanPulang($id)
    {
        $user = request()->user();
        $presensi = PresensiGuru::findOrFail($id);

        if ($user->role !== 'admin' && $user->guru?->id !== $presensi->guru_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk membatalkan jam pulang ini.');
        }

        if (!$presensi->jam_pulang) {
            return back()->with('error', 'Jam pulang belum tercatat.');
        }

        $presensi->update(['jam_pulang' => null]);
        return back()->with('success', 'Jam pulang dibatalkan.');
    }

    public function destroy($id)
    {
        $user = request()->user();
        $presensi = PresensiGuru::findOrFail($id);

        if ($user->role !== 'admin' && $user->guru?->id !== $presensi->guru_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk membatalkan presensi ini.');
        }

        $presensi->delete();
        return back()->with('success', 'Presensi dibatalkan.');
    }
}
