<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\RekeningYayasan;
use App\Models\Santri;
use App\Models\JenisPembayaran;
use App\Models\PushSubscription;
use App\Models\Cashflow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PembayaranController extends Controller
{
    public function index(Request $request)
    {
        $query = Pembayaran::with(['santri', 'details'])
            ->orderBy('created_at', 'desc');

        // Filter jenis
        if ($request->jenis) {
            $query->where('jenis', $request->jenis);
        }

        // Filter NIS
        if ($request->nis) {
            $query->where('nis', $request->nis);
        }

        // Filter status
        if ($request->status && $request->status !== 'semua') {
            if ($request->status === 'belum') {
                $query->where('status_verifikasi', 'menunggu')
                    ->whereDoesntHave('details');
            } elseif ($request->status === 'dicicil') {
                $query->where('status_verifikasi', 'menunggu')
                    ->whereHas('details');
            } else {
                $query->where('status_verifikasi', $request->status);
            }
        }

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_pembayaran', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhereHas('santri', function ($q2) use ($search) {
                        $q2->where('nama_lengkap', 'like', "%{$search}%");
                    });
            });
        }

        $pembayaran = $query->paginate(20)->withQueryString();

        $santris = Santri::where('status', 'aktif')->orderBy('nis')->get();
        $jenisPembayaran = JenisPembayaran::all();

        return Inertia::render('Pembayaran/Index', [
            'pembayaran' => $pembayaran,
            'santris' => $santris,
            'jenisPembayaran' => $jenisPembayaran,
            'filters' => $request->only('jenis', 'status', 'search'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|exists:santris,nis',
            'jenis' => 'required|exists:jenis_pembayaran,nama',
            'nama_pembayaran' => 'required',
            'nominal' => 'required|integer',
            'tgl_jatuh_tempo' => 'nullable|date',
        ]);

        $pembayaran = Pembayaran::create($request->all() + ['status_verifikasi' => 'menunggu']);

        $this->kirimNotifKeSantri(
            $pembayaran->nis,
            'Tagihan',
            $pembayaran->nama_pembayaran . ' - Rp ' . number_format($pembayaran->nominal, 0, ',', '.'),
            '/tagihan'
        );

        return back()->with('success', 'Tagihan berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $p = Pembayaran::findOrFail($id);
        $p->update($request->only('nama_pembayaran', 'nominal', 'tgl_jatuh_tempo'));
        return back()->with('success', 'Diupdate.');
    }

    public function destroy($id)
    {
        $p = Pembayaran::findOrFail($id);

        // Hapus cashflow terkait
        Cashflow::where('pembayaran_id', $p->id)->delete();

        $p->delete();
        return back()->with('success', 'Dihapus.');
    }

    public function cicilan(Request $request, $id)
    {
        $p = Pembayaran::findOrFail($id);
        $request->validate(['nominal' => 'required|integer|min:1']);

        PembayaranDetail::create([
            'pembayaran_id' => $p->id,
            'nominal' => $request->nominal,
            'tgl_bayar' => now(),
            'nip' => 'admin',
        ]);

        $p->refresh();

        if ($p->sisa <= 0) {
            $p->update(['status_verifikasi' => 'lunas', 'tgl_bayar' => now()]);

            // Otomatis masuk cashflow
            $this->catatCashflow($p);

            $this->kirimNotifKeSantri(
                $p->nis,
                'Lunas',
                $p->nama_pembayaran . ' - LUNAS',
                '/tagihan'
            );
        }

        return back()->with('success', 'Cicilan berhasil.');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'jenis' => 'required|exists:jenis_pembayaran,nama',
            'nominal' => 'required|integer',
            'semester' => 'nullable',
            'bulan' => 'nullable',
            'tahun' => 'nullable',
            'nama_pembayaran' => 'nullable',
            'target' => 'nullable|in:putra,putri',
            'kecualikan' => 'nullable',
        ]);

        $kecualikan = $request->kecualikan
            ? array_map('trim', explode(',', $request->kecualikan))
            : [];

        if ($request->jenis === 'SPP') {
            $namaPembayaran = "{$request->semester} {$request->tahun}";
        } elseif ($request->jenis === 'Kas') {
            $namaPembayaran = "{$request->bulan} {$request->tahun}";
        } else {
            $namaPembayaran = $request->nama_pembayaran;
        }

        $santris = Santri::where('status', 'aktif')
            ->when($request->jenis === 'Kas' && $request->target === 'putra', function ($q) {
                $q->where('nis', 'like', 'PA%');
            })
            ->when($request->jenis === 'Kas' && $request->target === 'putri', function ($q) {
                $q->where('nis', 'like', 'PI%');
            })
            ->when(!empty($kecualikan), function ($q) use ($kecualikan) {
                $q->whereNotIn('nis', $kecualikan);
            })
            ->get();

        $count = 0;
        foreach ($santris as $s) {
            $pembayaran = Pembayaran::create([
                'nis' => $s->nis,
                'jenis' => $request->jenis,
                'nama_pembayaran' => $namaPembayaran,
                'nominal' => $request->nominal,
                'tgl_jatuh_tempo' => $request->tgl_jatuh_tempo,
            ]);

            $this->kirimNotifKeSantri(
                $pembayaran->nis,
                'Tagihan',
                $pembayaran->nama_pembayaran . ' - Rp ' . number_format($pembayaran->nominal, 0, ',', '.'),
                '/tagihan'
            );

            $count++;
        }

        return back()->with('success', $count . ' tagihan berhasil digenerate.');
    }

    public function uploadBukti(Request $request, $id)
    {
        $p = Pembayaran::findOrFail($id);
        $request->validate(['bukti' => 'required|image|max:2048']);
        $path = $request->file('bukti')->store('bukti', 'public');
        $p->update(['bukti' => $path, 'status_verifikasi' => 'menunggu']);
        return back()->with('success', 'Bukti berhasil diupload. Menunggu verifikasi admin.');
    }

    public function verifikasi(Request $request, $id)
    {
        $p = Pembayaran::findOrFail($id);

        if ($request->status_verifikasi === 'lunas') {
            $request->validate([
                'nominal_dibayar' => 'required|integer|min:1',
            ]);

            PembayaranDetail::create([
                'pembayaran_id' => $p->id,
                'nominal' => $request->nominal_dibayar,
                'tgl_bayar' => now(),
                'nip' => auth()->user()->username ?? 'admin',
            ]);

            $p->refresh();

            if ($p->sisa <= 0) {
                $p->update([
                    'status_verifikasi' => 'lunas',
                    'tgl_bayar' => now(),
                ]);

                // Otomatis masuk cashflow
                $this->catatCashflow($p);

                $this->kirimNotifKeSantri(
                    $p->nis,
                    'Lunas',
                    $p->nama_pembayaran . ' - LUNAS',
                    '/tagihan'
                );
            } else {
                $p->update(['status_verifikasi' => 'menunggu']);
            }
        } else {
            $request->validate(['status_verifikasi' => 'required|in:ditolak']);
            $p->update(['status_verifikasi' => 'ditolak']);

            $this->kirimNotifKeSantri(
                $p->nis,
                'Ditolak',
                $p->nama_pembayaran . ' - pembayaran ditolak',
                '/tagihan'
            );
        }

        return back()->with('success', $request->status_verifikasi === 'lunas' ? 'Pembayaran disetujui.' : 'Pembayaran ditolak.');
    }

    public function tagihan(Request $request)
    {
        $user = $request->user();
        $nis = null;

        if ($user->role === 'santri') {
            $nis = $user->santri->nis;
        }

        $tagihan = Pembayaran::with('santri')
            ->when($nis, function ($q) use ($nis) {
                $q->where('nis', $nis);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $rekening = RekeningYayasan::first();

        return Inertia::render('Tagihan/Index', [
            'tagihan' => $tagihan,
            'rekening' => $rekening,
        ]);
    }

    public function storeJenis(Request $request)
    {
        $request->validate(['nama' => 'required|unique:jenis_pembayaran,nama']);
        JenisPembayaran::create($request->all());
        return back()->with('success', 'Kategori ditambah.');
    }

    public function deleteJenis($id)
    {
        JenisPembayaran::findOrFail($id)->delete();
        return back()->with('success', 'Kategori dihapus.');
    }

    /**
     * Catat pemasukan cashflow saat pembayaran lunas.
     */
    private function catatCashflow($pembayaran)
    {
        $kategoriCashflow = null;

        if ($pembayaran->jenis === 'Kas') {
            $kategoriCashflow = str_starts_with($pembayaran->nis, 'PA') ? 'kas_putra' : 'kas_putri';
        } elseif ($pembayaran->jenis === 'Anjem') {
            $kategoriCashflow = 'anjem';
        }

        if (!$kategoriCashflow) return;

        $santriNama = $pembayaran->santri->nama_lengkap ?? $pembayaran->nis;

        Cashflow::create([
            'kategori' => $kategoriCashflow,
            'tipe' => 'pemasukan',
            'tanggal' => now()->format('Y-m-d'),
            'nominal' => $pembayaran->nominal,
            'keterangan' => $santriNama . ' - ' . $pembayaran->nama_pembayaran,
            'pembayaran_id' => $pembayaran->id,
        ]);
    }

    private function kirimNotifKeSantri($nis, $title, $body, $url)
    {
        $santri = Santri::where('nis', $nis)->first();
        if (!$santri || !$santri->user_id) return;

        $subscriptions = PushSubscription::where('user_id', $santri->user_id)->get();
        if ($subscriptions->isEmpty()) return;

        $auth = [
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->p256dh,
                'authToken' => $sub->auth,
            ]);

            $webPush->queueNotification(
                $subscription,
                json_encode([
                    'title' => $title,
                    'body' => $body,
                    'icon' => '/icon-amanah.png',
                    'url' => $url,
                ])
            );
        }

        foreach ($webPush->flush() as $report) {
            // Handle report
        }
    }
}
