<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\Siswa;
use App\Models\JenisPembayaran;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PembayaranController extends Controller
{
    public function index(Request $request)
    {
        $query = Pembayaran::with(['siswa', 'details'])
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
                    ->orWhereHas('siswa', function ($q2) use ($search) {
                        $q2->where('nama_lengkap', 'like', "%{$search}%");
                    });
            });
        }

        $pembayaran = $query->paginate(20)->withQueryString();

        $siswas = Siswa::where('status', 'aktif')->orderBy('nis')->get();
        $jenisPembayaran = JenisPembayaran::all();

        return Inertia::render('Pembayaran/Index', [
            'pembayaran' => $pembayaran,
            'siswas' => $siswas,
            'jenisPembayaran' => $jenisPembayaran,
            'filters' => $request->only('jenis', 'status', 'search'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|exists:siswas,nis',
            'jenis' => 'required|exists:jenis_pembayaran,nama',
            'nama_pembayaran' => 'required',
            'nominal' => 'required|integer',
            'tgl_jatuh_tempo' => 'nullable|date',
        ]);

        Pembayaran::create($request->all() + ['status_verifikasi' => 'menunggu']);

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
        ]);

        $p->refresh();

        if ($p->sisa <= 0) {
            $p->update(['status_verifikasi' => 'lunas', 'tgl_bayar' => now()]);
        } else {
            $p->update(['status_verifikasi' => 'dicicil']);
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
            'kecualikan' => 'nullable',
        ]);

        $kecualikan = $request->kecualikan
            ? array_map('trim', explode(',', $request->kecualikan))
            : [];

        if ($request->jenis === 'SPP') {
            $namaPembayaran = "{$request->semester} {$request->tahun}";
        } else {
            $namaPembayaran = $request->nama_pembayaran;
        }

        $siswas = Siswa::where('status', 'aktif')
            ->when(!empty($kecualikan), function ($q) use ($kecualikan) {
                $q->whereNotIn('nis', $kecualikan);
            })
            ->get();

        $count = 0;
        foreach ($siswas as $s) {
            Pembayaran::create([
                'nis' => $s->nis,
                'jenis' => $request->jenis,
                'nama_pembayaran' => $namaPembayaran,
                'nominal' => $request->nominal,
                'tgl_jatuh_tempo' => $request->tgl_jatuh_tempo,
                'status_verifikasi' => 'menunggu',
            ]);

            $count++;
        }

        return back()->with('success', $count . ' tagihan berhasil digenerate.');
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
}
