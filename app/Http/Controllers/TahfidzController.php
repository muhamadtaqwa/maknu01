<?php

namespace App\Http\Controllers;

use App\Models\Tahfidz;
use App\Models\Santri;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TahfidzController extends Controller
{
    private $namaSurat = [
        1 => "Al-Fatihah",
        2 => "Al-Baqarah",
        3 => "Ali 'Imran",
        4 => "An-Nisa",
        5 => "Al-Ma'idah",
        6 => "Al-An'am",
        7 => "Al-A'raf",
        8 => "Al-Anfal",
        9 => "At-Taubah",
        10 => "Yunus",
        11 => "Hud",
        12 => "Yusuf",
        13 => "Ar-Ra'd",
        14 => "Ibrahim",
        15 => "Al-Hijr",
        16 => "An-Nahl",
        17 => "Al-Isra",
        18 => "Al-Kahfi",
        19 => "Maryam",
        20 => "Thaha",
        21 => "Al-Anbiya",
        22 => "Al-Hajj",
        23 => "Al-Mu'minun",
        24 => "An-Nur",
        25 => "Al-Furqan",
        26 => "Asy-Syu'ara",
        27 => "An-Naml",
        28 => "Al-Qasas",
        29 => "Al-Ankabut",
        30 => "Ar-Rum",
        31 => "Luqman",
        32 => "As-Sajdah",
        33 => "Al-Ahzab",
        34 => "Saba",
        35 => "Fathir",
        36 => "Yasin",
        37 => "As-Saffat",
        38 => "Sad",
        39 => "Az-Zumar",
        40 => "Ghafir",
        41 => "Fussilat",
        42 => "Asy-Syura",
        43 => "Az-Zukhruf",
        44 => "Ad-Dukhan",
        45 => "Al-Jatsiyah",
        46 => "Al-Ahqaf",
        47 => "Muhammad",
        48 => "Al-Fath",
        49 => "Al-Hujurat",
        50 => "Qaf",
        51 => "Adz-Dzariyat",
        52 => "At-Tur",
        53 => "An-Najm",
        54 => "Al-Qamar",
        55 => "Ar-Rahman",
        56 => "Al-Waqi'ah",
        57 => "Al-Hadid",
        58 => "Al-Mujadilah",
        59 => "Al-Hasyr",
        60 => "Al-Mumtahanah",
        61 => "As-Saff",
        62 => "Al-Jumu'ah",
        63 => "Al-Munafiqun",
        64 => "At-Taghabun",
        65 => "At-Talaq",
        66 => "At-Tahrim",
        67 => "Al-Mulk",
        68 => "Al-Qalam",
        69 => "Al-Haqqah",
        70 => "Al-Ma'arij",
        71 => "Nuh",
        72 => "Al-Jinn",
        73 => "Al-Muzzammil",
        74 => "Al-Muddatstsir",
        75 => "Al-Qiyamah",
        76 => "Al-Insan",
        77 => "Al-Mursalat",
        78 => "An-Naba",
        79 => "An-Nazi'at",
        80 => "'Abasa",
        81 => "At-Takwir",
        82 => "Al-Infitar",
        83 => "Al-Muthaffifin",
        84 => "Al-Insyiqaq",
        85 => "Al-Buruj",
        86 => "At-Tariq",
        87 => "Al-A'la",
        88 => "Al-Ghasyiyah",
        89 => "Al-Fajr",
        90 => "Al-Balad",
        91 => "Asy-Syams",
        92 => "Al-Lail",
        93 => "Adh-Dhuha",
        94 => "Al-Insyirah",
        95 => "At-Tin",
        96 => "Al-'Alaq",
        97 => "Al-Qadr",
        98 => "Al-Bayyinah",
        99 => "Az-Zalzalah",
        100 => "Al-'Adiyat",
        101 => "Al-Qari'ah",
        102 => "At-Takatsur",
        103 => "Al-'Asr",
        104 => "Al-Humazah",
        105 => "Al-Fil",
        106 => "Quraisy",
        107 => "Al-Ma'un",
        108 => "Al-Kautsar",
        109 => "Al-Kafirun",
        110 => "An-Nasr",
        111 => "Al-Lahab",
        112 => "Al-Ikhlas",
        113 => "Al-Falaq",
        114 => "An-Nas",
    ];

    private function getNamaSurat($id)
    {
        return $this->namaSurat[$id] ?? "Surat $id";
    }

    public function index(Request $request)
    {
        $bulan = $request->bulan ?? now()->month;
        $tahun = $request->tahun ?? now()->year;
        $user = auth()->user();

        $nisSantri = null;
        $isSantriBiasa = false;

        if ($user->role === 'santri') {
            $nisSantri = $user->santri->nis;
            $isSantriBiasa = !in_array($nisSantri, ['PA04', 'PI04', 'PI10', 'PI11']);
        }

        $santris = Santri::where('status', 'aktif')->orderBy('nis')->get();
        $penyimak = Santri::whereIn('nis', ['PA04', 'PI04', 'PI10', 'PI11'])->get();

        $rekap = Santri::where('status', 'aktif')
            ->when($isSantriBiasa, function ($q) use ($nisSantri) {
                $q->where('nis', $nisSantri);
            })
            ->orderBy('nis')
            ->get()
            ->map(function ($s) {
                $setoran = Tahfidz::where('nis', $s->nis)
                    ->orderBy('tanggal', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();

                $totalJuz = Tahfidz::where('nis', $s->nis)->max('juz') ?? 0;

                $penyimakNama = $setoran ? Santri::where('nis', $setoran->penyimak)->first()?->nama_lengkap : null;

                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'juz_terakhir' => $totalJuz,
                    'progress' => round(($totalJuz / 30) * 100, 1),
                    'setoran_terakhir' => $setoran ? [
                        'id' => $setoran->id,
                        'juz' => $setoran->juz,
                        'surat_id' => $setoran->surat,
                        'surat' => $this->getNamaSurat($setoran->surat),
                        'sampai_ayat' => $setoran->sampai_ayat,
                        'tanggal' => $setoran->tanggal,
                        'penyimak_nis' => $setoran->penyimak,
                        'penyimak' => $penyimakNama ?? $setoran->penyimak,
                        'keterangan' => $setoran->keterangan,
                    ] : null,
                ];
            });

        $rekapBulanan = Santri::where('status', 'aktif')
            ->when($isSantriBiasa, function ($q) use ($nisSantri) {
                $q->where('nis', $nisSantri);
            })
            ->orderBy('nis')
            ->get()
            ->map(function ($s) use ($bulan, $tahun) {
                $tanggalSetoran = Tahfidz::where('nis', $s->nis)
                    ->whereMonth('tanggal', $bulan)
                    ->whereYear('tanggal', $tahun)
                    ->pluck('tanggal')
                    ->toArray();

                return [
                    'nis' => $s->nis,
                    'nama' => $s->nama_lengkap,
                    'total_setoran' => count($tanggalSetoran),
                    'tanggal_setoran' => $tanggalSetoran,
                ];
            });

        return Inertia::render('Tahfidz/Index', [
            'santris' => $isSantriBiasa ? Santri::where('nis', $nisSantri)->get() : $santris,
            'penyimak' => $penyimak,
            'rekap' => $rekap,
            'rekapBulanan' => $rekapBulanan,
            'bulan' => (int) $bulan,
            'tahun' => (int) $tahun,
            'isSantriBiasa' => $isSantriBiasa,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|exists:santris,nis',
            'juz' => 'required|integer|min:1|max:30',
            'surat' => 'required|integer|min:1|max:114',
            'sampai_ayat' => 'required|integer|min:1',
            'tanggal' => 'required|date',
            'keterangan' => 'required|in:lanjut,ulang',
            'penyimak' => 'required|exists:santris,nis',
        ]);

        Tahfidz::create($request->all());

        return back()->with('success', 'Setoran tahfidz berhasil dicatat.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'juz' => 'required|integer|min:1|max:30',
            'surat' => 'required|integer|min:1|max:114',
            'sampai_ayat' => 'required|integer|min:1',
            'tanggal' => 'required|date',
            'keterangan' => 'required|in:lanjut,ulang',
            'penyimak' => 'required|exists:santris,nis',
        ]);

        $tahfidz = Tahfidz::findOrFail($id);
        $tahfidz->update($request->only('juz', 'surat', 'sampai_ayat', 'tanggal', 'keterangan', 'penyimak'));

        return back()->with('success', 'Setoran tahfidz diupdate.');
    }

    public function detail($nis)
    {
        $santri = Santri::where('nis', $nis)->first();
        $riwayat = Tahfidz::where('nis', $nis)
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($r) {
                $penyimakNama = Santri::where('nis', $r->penyimak)->first()?->nama_lengkap;
                return [
                    'id' => $r->id,
                    'juz' => $r->juz,
                    'surat' => $this->getNamaSurat($r->surat),
                    'sampai_ayat' => $r->sampai_ayat,
                    'tanggal' => $r->tanggal,
                    'keterangan' => $r->keterangan,
                    'penyimak' => $penyimakNama ?? $r->penyimak,
                ];
            });

        return response()->json([
            'santri' => $santri,
            'riwayat' => $riwayat,
        ]);
    }
}
