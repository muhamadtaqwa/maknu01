<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Santri;
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

    public function santri(Request $request)
    {
        $query = Santri::orderBy('nis');

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            });
        }

        $santris = $query->paginate(20)->withQueryString();

        return Inertia::render('Rekap/Santri', [
            'santris' => $santris,
            'filters' => $request->only('search'),
        ]);
    }

    public function santriDetailJson($nis)
    {
        $santri = Santri::where('nis', $nis)->first();
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

        return response()->json(['santri' => $santri, 'rekap' => $rekap]);
    }

    public function spp()
    {
        $data = Pembayaran::where('jenis', 'SPP')->get()
            ->groupBy('nis')
            ->map(function ($items) {
                $santri = Santri::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');

                $perSpp = $items->map(function ($item) use ($santri) {
                    return [
                        'id' => $item->id,
                        'nama_pembayaran' => str_replace(" - {$santri->nama_lengkap}", '', $item->nama_pembayaran),
                        'nominal' => $item->nominal,
                        'status' => $item->status,
                    ];
                })->values();

                return [
                    'nis' => $items->first()->nis,
                    'nama' => $santri->nama_lengkap ?? '-',
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

    public function kitab()
    {
        $data = Pembayaran::where('jenis', 'Kitab')->get()
            ->groupBy('nis')
            ->map(function ($items) {
                $santri = Santri::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');

                $perKitab = $items->map(function ($item) use ($santri) {
                    return [
                        'id' => $item->id,
                        'nama_pembayaran' => str_replace(" - {$santri->nama_lengkap}", '', $item->nama_pembayaran),
                        'nominal' => $item->nominal,
                        'status' => $item->status,
                    ];
                })->values();

                return [
                    'nis' => $items->first()->nis,
                    'nama' => $santri->nama_lengkap ?? '-',
                    'total_tagihan' => $items->count(),
                    'total_lunas' => $lunas->count(),
                    'total_belum' => $items->count() - $lunas->count(),
                    'total_nominal' => $total,
                    'nominal_lunas' => $dibayar,
                    'nominal_belum' => $total - $dibayar,
                    'per_kitab' => $perKitab,
                ];
            })->sortBy('nis')->values();

        return Inertia::render('Rekap/Kitab', [
            'rekap' => $data,
            'totalSemua' => $data->sum('total_nominal'),
            'totalLunas' => $data->sum('nominal_lunas'),
            'totalBelum' => $data->sum('nominal_belum'),
        ]);
    }

    public function kas()
    {
        $urutanBulan = [
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember',
        ];

        $data = Pembayaran::where('jenis', 'Kas')->get()
            ->groupBy('nis')
            ->map(function ($items) use ($urutanBulan) {
                $santri = Santri::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');

                $perBulan = $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'nama_pembayaran' => $item->nama_pembayaran,
                        'nominal' => $item->nominal,
                        'status' => $item->status,
                        'tgl_bayar' => $item->tgl_bayar,
                    ];
                })->sort(function ($a, $b) use ($urutanBulan) {
                    $bulanA = trim(str_replace(['Kas Bulanan - ', '-', ' '], ['', '', ' '], $a['nama_pembayaran'] ?? ''));
                    $bulanB = trim(str_replace(['Kas Bulanan - ', '-', ' '], ['', '', ' '], $b['nama_pembayaran'] ?? ''));

                    $indexA = array_search($bulanA, $urutanBulan);
                    $indexB = array_search($bulanB, $urutanBulan);

                    if ($indexA === false) $indexA = 99;
                    if ($indexB === false) $indexB = 99;

                    return $indexA - $indexB;
                })->values();

                return [
                    'nis' => $items->first()->nis,
                    'nama' => $santri->nama_lengkap ?? '-',
                    'total_tagihan' => $items->count(),
                    'total_lunas' => $lunas->count(),
                    'total_belum' => $items->count() - $lunas->count(),
                    'total_nominal' => $total,
                    'nominal_lunas' => $dibayar,
                    'nominal_belum' => $total - $dibayar,
                    'per_bulan' => $perBulan,
                ];
            })->sortBy('nis')->values();

        return Inertia::render('Rekap/Kas', [
            'rekap' => $data,
            'totalSemua' => $data->sum('total_nominal'),
            'totalLunas' => $data->sum('nominal_lunas'),
            'totalBelum' => $data->sum('nominal_belum'),
        ]);
    }

    public function anjem()
    {
        $data = Pembayaran::where('jenis', 'Anjem')->get()
            ->groupBy('nis')
            ->map(function ($items) {
                $santri = Santri::where('nis', $items->first()->nis)->first();
                $total = $items->sum('nominal');
                $dibayar = $items->sum('total_dibayar');
                $lunas = $items->filter(fn($i) => $i->status === 'lunas');

                $perAnjem = $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'nama_pembayaran' => $item->nama_pembayaran,
                        'nominal' => $item->nominal,
                        'status' => $item->status,
                    ];
                })->values();

                return [
                    'nis' => $items->first()->nis,
                    'nama' => $santri->nama_lengkap ?? '-',
                    'total_tagihan' => $items->count(),
                    'total_lunas' => $lunas->count(),
                    'total_belum' => $items->count() - $lunas->count(),
                    'total_nominal' => $total,
                    'nominal_lunas' => $dibayar,
                    'nominal_belum' => $total - $dibayar,
                    'per_anjem' => $perAnjem,
                ];
            })->sortBy('nis')->values();

        return Inertia::render('Rekap/Anjem', [
            'rekap' => $data,
            'totalSemua' => $data->sum('total_nominal'),
            'totalLunas' => $data->sum('nominal_lunas'),
            'totalBelum' => $data->sum('nominal_belum'),
        ]);
    }
}
