<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SantriController extends Controller
{
    public function index(Request $request)
    {
        $query = Santri::with('user')->orderBy('nis');

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        $santris = $query->paginate(20)->withQueryString();

        return Inertia::render('Santri/Index', [
            'santris' => $santris,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'nisn' => 'nullable',
            'nik' => 'nullable',
            'nama_lengkap' => 'required',
            'tempat_lahir' => 'nullable',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable',
            'desa' => 'nullable',
            'kecamatan' => 'nullable',
            'kabupaten' => 'nullable',
            'provinsi' => 'nullable',
            'program_studi' => 'nullable',
            'angkatan' => 'nullable',
            'tahun_masuk' => 'nullable',
            'kamar' => 'nullable',
            'nomor_hp' => 'nullable',
            'status' => 'nullable|in:aktif,tidak aktif',
            'nama_ayah' => 'nullable',
            'nik_ayah' => 'nullable',
            'pekerjaan_ayah' => 'nullable',
            'nama_ibu' => 'nullable',
            'nik_ibu' => 'nullable',
            'pekerjaan_ibu' => 'nullable',
            'no_hp_orang_tua' => 'nullable',
            'password' => 'required|min:6',
        ]);

        $prefix = $request->jenis_kelamin === 'laki-laki' ? 'PA' : 'PI';
        $last = Santri::where('nis', 'like', $prefix . '%')
            ->orderByRaw('LENGTH(nis) DESC, nis DESC')
            ->first();
        if ($last) {
            $num = (int) substr($last->nis, 2) + 1;
        } else {
            $num = 1;
        }
        $nis = $prefix . str_pad($num, 2, '0', STR_PAD_LEFT);

        $user = User::create([
            'username' => $nis,
            'password' => Hash::make($request->password),
            'role' => 'santri',
        ]);
        $user->assignRole('santri');

        Santri::create([
            'user_id' => $user->id,
            'nis' => $nis,
            'nisn' => $request->nisn,
            'nik' => $request->nik,
            'nama_lengkap' => $request->nama_lengkap,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'alamat' => $request->alamat,
            'desa' => $request->desa,
            'kecamatan' => $request->kecamatan,
            'kabupaten' => $request->kabupaten,
            'provinsi' => $request->provinsi,
            'program_studi' => $request->program_studi,
            'angkatan' => $request->angkatan,
            'tahun_masuk' => $request->tahun_masuk,
            'kamar' => $request->kamar,
            'nomor_hp' => $request->nomor_hp,
            'status' => $request->status ?? 'aktif',
            'nama_ayah' => $request->nama_ayah,
            'nik_ayah' => $request->nik_ayah,
            'pekerjaan_ayah' => $request->pekerjaan_ayah,
            'nama_ibu' => $request->nama_ibu,
            'nik_ibu' => $request->nik_ibu,
            'pekerjaan_ibu' => $request->pekerjaan_ibu,
            'no_hp_orang_tua' => $request->no_hp_orang_tua,
            'poin_kedisiplinan' => 100,
        ]);

        return back()->with('success', 'Santri berhasil ditambah.');
    }

    public function update(Request $request, $id)
    {
        $santri = Santri::findOrFail($id);

        $request->validate([
            'nisn' => 'nullable',
            'nik' => 'nullable',
            'nama_lengkap' => 'required',
            'tempat_lahir' => 'nullable',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
            'alamat' => 'nullable',
            'desa' => 'nullable',
            'kecamatan' => 'nullable',
            'kabupaten' => 'nullable',
            'provinsi' => 'nullable',
            'program_studi' => 'nullable',
            'angkatan' => 'nullable',
            'tahun_masuk' => 'nullable',
            'kamar' => 'nullable',
            'nomor_hp' => 'nullable',
            'status' => 'nullable|in:aktif,tidak aktif',
            'nama_ayah' => 'nullable',
            'nik_ayah' => 'nullable',
            'pekerjaan_ayah' => 'nullable',
            'nama_ibu' => 'nullable',
            'nik_ibu' => 'nullable',
            'pekerjaan_ibu' => 'nullable',
            'no_hp_orang_tua' => 'nullable',
        ]);

        $santri->update($request->only([
            'nisn',
            'nik',
            'nama_lengkap',
            'tempat_lahir',
            'tanggal_lahir',
            'jenis_kelamin',
            'alamat',
            'desa',
            'kecamatan',
            'kabupaten',
            'provinsi',
            'program_studi',
            'angkatan',
            'tahun_masuk',
            'kamar',
            'nomor_hp',
            'status',
            'nama_ayah',
            'nik_ayah',
            'pekerjaan_ayah',
            'nama_ibu',
            'nik_ibu',
            'pekerjaan_ibu',
            'no_hp_orang_tua',
            'poin_kedisiplinan',
        ]));

        return back()->with('success', 'Santri berhasil diupdate.');
    }

    public function destroy($id)
    {
        $santri = Santri::findOrFail($id);
        $santri->user->delete();
        $santri->delete();
        return back()->with('success', 'Santri berhasil dihapus.');
    }
}
