<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RekapController extends Controller
{
    public function index()
    {
        $rekap = Pembayaran::all()->groupBy('jenis')->map(function ($items) {
            $total = $items->sum('nominal');
            $dibayar = $items->sum('total_dibayar');
            $lunas = $items->filter(fn($i) => $i->status === 'lunas');
            return [
                'jenis' => $items->first()->jenis,
                'total_tagihan' => $items->count(),
                'total_lunas' => $lunas->count(),
                'total_belum' => $items->count() - $lunas->count(),
                'total_nominal' => $total,
                'nominal_lunas' => $dibayar,
                'nominal_belum' => $total - $dibayar,
            ];
        })->values();

        return Inertia::render('Rekap/Index', [
            'rekap' => $rekap,
            'totalSemua' => $rekap->sum('total_nominal'),
            'totalLunas' => $rekap->sum('nominal_lunas'),
            'totalBelum' => $rekap->sum('nominal_belum'),
        ]);
    }

    public function siswa(Request $request)
    {
        $query = Siswa::orderBy('nis');

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        $siswas = $query->paginate(20)->withQueryString();

        return Inertia::render('Rekap/Siswa', [
            'siswas' => $siswas,
            'filters' => $request->only('search'),
        ]);
    }

    public function siswaDetailJson($nis)
    {
        $siswa = Siswa::where('nis', $nis)->first();
        $rekap = Pembayaran::where('nis', $nis)->get()->groupBy('jenis')->map(function ($items) {
            $total = $items->sum('nominal');
            $dibayar = $items->sum('total_dibayar');
            $lunas = $items->filter(fn($i) => $i->status === 'lunas');
            return [
                'jenis' => $items->first()->jenis,
                'total_nominal' => $total,
                'nominal_lunas' => $dibayar,
                'nominal_belum' => $total - $dibayar,
                'total_belum' => $items->count() - $lunas->count(),
            ];
        })->values();

        return response()->json(['siswa' => $siswa, 'rekap' => $rekap]);
    }

    public function spp()
    {
        $data = Pembayaran::where('jenis', 'SPP')->get()
            ->groupBy('nis')
            ->map(function ($items) {
                $siswa = Siswa::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');

                $perSpp = $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'nama_pembayaran' => $item->nama_pembayaran,
                        'nominal' => $item->nominal,
                        'status' => $item->status,
                    ];
                })->values();

                return [
                    'nis' => $items->first()->nis,
                    'nama' => $siswa->nama_lengkap ?? '-',
                    'total_tagihan' => $items->count(),
                    'total_lunas' => $lunas->count(),
                    'total_belum' => $items->count() - $lunas->count(),
                    'total_nominal' => $total,
                    'nominal_lunas' => $dibayar,
                    'nominal_belum' => $total - $dibayar,
                    'per_spp' => $perSpp,
                ];
            })->sortBy('nis')->values();

        return Inertia::render('Rekap/SPP', [
            'rekap' => $data,
            'totalSemua' => $data->sum('total_nominal'),
            'totalLunas' => $data->sum('nominal_lunas'),
            'totalBelum' => $data->sum('nominal_belum'),
        ]);
    }

    public function buku()
    {
        $data = Pembayaran::where('jenis', 'Buku')->get()
            ->groupBy('nis')
            ->map(function ($items) {
                $siswa = Siswa::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');

                $perBuku = $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'nama_pembayaran' => $item->nama_pembayaran,
                        'nominal' => $item->nominal,
                        'status' => $item->status,
                    ];
                })->values();

                return [
                    'nis' => $items->first()->nis,
                    'nama' => $siswa->nama_lengkap ?? '-',
                    'total_tagihan' => $items->count(),
                    'total_lunas' => $lunas->count(),
                    'total_belum' => $items->count() - $lunas->count(),
                    'total_nominal' => $total,
                    'nominal_lunas' => $dibayar,
                    'nominal_belum' => $total - $dibayar,
                    'per_buku' => $perBuku,
                ];
            })->sortBy('nis')->values();

        return Inertia::render('Rekap/Buku', [
            'rekap' => $data,
            'totalSemua' => $data->sum('total_nominal'),
            'totalLunas' => $data->sum('nominal_lunas'),
            'totalBelum' => $data->sum('nominal_belum'),
        ]);
    }
}
