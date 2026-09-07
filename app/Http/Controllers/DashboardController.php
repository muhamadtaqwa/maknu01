<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\Guru;
use App\Models\User;
use App\Models\Pembayaran;
use App\Models\Login;
use App\Models\PresensiSiswa;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $bulanIni = now()->month;
        $tahunIni = now()->year;

        $pembayaran = Pembayaran::all();
        $totalBelumBayar = $pembayaran->filter(
            fn($p) => $p->status === 'menunggu' || $p->status === 'dicicil'
        )->count();
        $totalSudahBayar = $pembayaran->filter(
            fn($p) => $p->status === 'lunas'
        )->count();

        $aktivitas = $this->getAktivitas();

        $presensiSiswa = [];
        if (auth()->user()->role === 'siswa') {
            $nis = auth()->user()->siswa->nis;
            $presensiSiswa = PresensiSiswa::where('nis', $nis)
                ->whereMonth('tanggal', $bulanIni)
                ->whereYear('tanggal', $tahunIni)
                ->pluck('tanggal')
                ->toArray();
        }

        $grafikPresensi = [];
        if (auth()->user()->role === 'guru') {
            $startOfWeek = now()->startOfWeek();
            $endOfWeek = now()->endOfWeek();
            $totalSiswaAktif = Siswa::where('status', 'aktif')->count();

            $presensiMingguan = PresensiSiswa::whereBetween('tanggal', [
                $startOfWeek->format('Y-m-d'),
                $endOfWeek->format('Y-m-d'),
            ])->get();

            for ($i = 0; $i < 7; $i++) {
                $tanggal = $startOfWeek->copy()->addDays($i);
                $hadir = $presensiMingguan
                    ->where('tanggal', $tanggal->format('Y-m-d'))
                    ->count();
                $tidak = max(0, $totalSiswaAktif - $hadir);
                $grafikPresensi[] = [
                    'hari' => $tanggal->locale('id')->dayName,
                    'hadir' => $hadir,
                    'tidak' => $tidak,
                ];
            }
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalSiswa'       => Siswa::where('status', 'aktif')->count(),
                'siswaPutra'       => Siswa::where('status', 'aktif')->where('jenis_kelamin', 'laki-laki')->count(),
                'siswaPutri'       => Siswa::where('status', 'aktif')->where('jenis_kelamin', 'perempuan')->count(),
                'totalGuru'        => Guru::count(),
                'totalBelumBayar'  => $totalBelumBayar,
                'totalSudahBayar'  => $totalSudahBayar,
                'userAktif'        => DB::table('sessions')
                    ->whereNotNull('user_id')
                    ->where('last_activity', '>=', now()->subMinutes(5)->timestamp)
                    ->count(),
                'totalUser'        => User::count(),
                'kunjunganHariIni' => Login::whereDate('created_at', today())->count(),
                'totalKunjungan'   => Login::count(),
            ],
            'aktivitas' => $aktivitas,
            'presensiSiswa' => $presensiSiswa,
            'grafikPresensi' => $grafikPresensi,
        ]);
    }

    private function getAktivitas()
    {
        $data = collect();

        $pembayaran = Pembayaran::with('siswa')->latest()->take(10)->get();
        foreach ($pembayaran as $p) {
            $nama = $p->siswa->nama_lengkap ?? 'Seseorang';
            $data->push([
                'teks' => $nama . ' membayar ' . $p->jenis,
                'waktu' => $p->created_at,
            ]);
        }

        $logins = Login::with('user.guru', 'user.siswa')->latest()->take(10)->get();
        foreach ($logins as $l) {
            $nama = 'Seseorang';
            if ($l->user) {
                if ($l->user->role === 'admin') {
                    $nama = 'Admin Sekolah';
                } else {
                    $nama = $l->user->guru->nama_lengkap ?? $l->user->siswa->nama_lengkap ?? $l->user->username;
                }
            }
            $data->push([
                'teks' => $nama . ' login',
                'waktu' => $l->created_at,
            ]);
        }

        return $data->sortByDesc('waktu')->take(15)->values()->map(function ($item) {
            return [
                'teks' => $item['teks'],
                'waktu' => $item['waktu']->diffForHumans(),
            ];
        });
    }
}
