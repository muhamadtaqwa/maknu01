<?php

namespace App\Http\Controllers;

use App\Models\PresensiUstadz;
use App\Models\JadwalUstadz;
use App\Models\Ustadz;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PresensiController extends Controller
{
    public function index(Request $request)
    {
        $tanggal = $request->tanggal ?? now()->toDateString();
        $hariInggris = Carbon::parse($tanggal)->format('l');
        $map = [
            'Sunday' => 'Ahad',
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
        ];
        $hari = $map[$hariInggris] ?? $hariInggris;

        $jadwal = JadwalUstadz::with('ustad')->where('hari', $hari)->get();
        $presensi = PresensiUstadz::where('tanggal', $tanggal)->get()->keyBy('niu');

        $data = $jadwal->map(function ($j) use ($presensi) {
            $p = $presensi->get($j->niu);
            return [
                'niu' => $j->niu,
                'nama' => $j->ustad->nama_lengkap ?? '-',
                'sesi' => $j->sesi,
                'kitab' => $j->kitab,
                'honor_default' => $j->honor_default,
                'sudah_absen' => !is_null($p),
                'status' => $p->status ?? null,
                'honor' => $p->honor ?? $j->honor_default,
                'presensi_id' => $p->id ?? null,
            ];
        });

        // Rekap bulan ini
        $rekap = PresensiUstadz::with('ustad')
            ->selectRaw("niu, COUNT(*) as total_pertemuan,
                SUM(CASE WHEN status='hadir' THEN 1 ELSE 0 END) as total_hadir,
                SUM(CASE WHEN status='tidak_hadir' THEN 1 ELSE 0 END) as total_tidak_hadir,
                SUM(COALESCE(honor,0)) as total_honor")
            ->whereMonth('tanggal', now()->month)
            ->whereYear('tanggal', now()->year)
            ->groupBy('niu')
            ->get();

        return Inertia::render('Presensi/Index', [
            'jadwal' => $data,
            'hari' => $hari,
            'tanggal' => $tanggal,
            'rekap' => $rekap,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'niu' => 'required|exists:ustadzs,niu',
            'tanggal' => 'required|date',
            'status' => 'required|in:hadir,tidak_hadir',
            'honor' => 'required|integer|min:0',
        ]);

        PresensiUstadz::create($request->all() + ['nip' => 'admin']);
        return back()->with('success', 'Presensi disimpan.');
    }

    public function destroy($id)
    {
        PresensiUstadz::findOrFail($id)->delete();
        return back()->with('success', 'Presensi dihapus.');
    }
}
