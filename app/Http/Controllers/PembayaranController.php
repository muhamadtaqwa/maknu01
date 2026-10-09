<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\Siswa;
use App\Models\JenisPembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PembayaranController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang memiliki hak akses ke modul keuangan.');
        }
    }

    public function index(Request $request)
    {
        $this->checkAdmin($request);

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
        $this->checkAdmin($request);

        $validated = $request->validate([
            'nis' => 'required|exists:siswas,nis',
            'jenis' => 'required|exists:jenis_pembayaran,nama',
            'nama_pembayaran' => 'required|string|max:255',
            'nominal' => 'required|integer|min:1',
            'tgl_jatuh_tempo' => 'nullable|date',
        ]);

        Pembayaran::create([
            'nis' => $validated['nis'],
            'jenis' => $validated['jenis'],
            'nama_pembayaran' => $validated['nama_pembayaran'],
            'nominal' => $validated['nominal'],
            'tgl_jatuh_tempo' => $validated['tgl_jatuh_tempo'] ?? null,
            'status_verifikasi' => 'menunggu',
        ]);

        return back()->with('success', 'Tagihan berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $this->checkAdmin($request);

        $validated = $request->validate([
            'nama_pembayaran' => 'required|string|max:255',
            'nominal' => 'required|integer|min:1',
            'tgl_jatuh_tempo' => 'nullable|date',
        ]);

        $p = Pembayaran::findOrFail($id);
        $p->update($validated);

        return back()->with('success', 'Diupdate.');
    }

    public function destroy(Request $request, $id)
    {
        $this->checkAdmin($request);

        $p = Pembayaran::findOrFail($id);

        DB::transaction(function () use ($p) {
            $p->details()->delete();
            $p->delete();
        });

        return back()->with('success', 'Dihapus.');
    }

    public function cicilan(Request $request, $id)
    {
        $this->checkAdmin($request);

        $p = Pembayaran::findOrFail($id);
        $request->validate(['nominal' => 'required|integer|min:1']);

        DB::transaction(function () use ($p, $request) {
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
        });

        return back()->with('success', 'Cicilan berhasil.');
    }

    public function generate(Request $request)
    {
        $this->checkAdmin($request);

        $request->validate([
            'jenis' => 'required|exists:jenis_pembayaran,nama',
            'nominal' => 'required|integer|min:1',
            'semester' => 'nullable|string|max:50',
            'bulan' => 'nullable|string|max:50',
            'tahun' => 'nullable|string|max:50',
            'nama_pembayaran' => 'nullable|string|max:255',
            'tgl_jatuh_tempo' => 'nullable|date',
            'kecualikan' => 'nullable',
        ]);

        $kecualikan = $request->kecualikan
            ? array_map('trim', explode(',', $request->kecualikan))
            : [];

        if ($request->jenis === 'SPP') {
            $namaPembayaran = "{$request->semester} {$request->tahun}";
        } else {
            $namaPembayaran = $request->nama_pembayaran ?? $request->jenis;
        }

        $siswas = Siswa::where('status', 'aktif')
            ->when(!empty($kecualikan), function ($q) use ($kecualikan) {
                $q->whereNotIn('nis', $kecualikan);
            })
            ->get();

        $count = 0;
        DB::transaction(function () use ($siswas, $request, $namaPembayaran, &$count) {
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
        });

        return back()->with('success', $count . ' tagihan berhasil digenerate.');
    }

    public function storeJenis(Request $request)
    {
        $this->checkAdmin($request);

        $validated = $request->validate([
            'nama' => 'required|string|max:100|unique:jenis_pembayaran,nama',
        ]);

        JenisPembayaran::create(['nama' => $validated['nama']]);
        return back()->with('success', 'Kategori ditambah.');
    }

    public function deleteJenis(Request $request, $id)
    {
        $this->checkAdmin($request);

        $jenis = JenisPembayaran::findOrFail($id);
        $jenis->delete();

        return back()->with('success', 'Kategori dihapus.');
    }
}
