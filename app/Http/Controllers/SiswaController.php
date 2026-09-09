<?php

namespace App\Http\Controllers;

use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::with('user')->orderBy('nis');

        // Search
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nik', 'like', "%{$search}%")
                    ->orWhere('kelas', 'like', "%{$search}%");
            });
        }

        $siswas = $query->paginate(20)->withQueryString();

        return Inertia::render('Siswa/Index', [
            'siswas' => $siswas,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nis' => 'required|unique:siswas,nis',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
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
            'kelas' => 'nullable',
            'angkatan' => 'nullable',
            'tahun_masuk' => 'nullable',
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

        $user = User::create([
            'username' => $request->nis,
            'password' => Hash::make($request->password),
            'role' => 'siswa',
        ]);
        $user->assignRole('siswa');

        Siswa::create([
            'user_id' => $user->id,
            'nis' => $request->nis,
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
            'kelas' => $request->kelas,
            'angkatan' => $request->angkatan,
            'tahun_masuk' => $request->tahun_masuk,
            'nomor_hp' => $request->nomor_hp,
            'status' => $request->status ?? 'aktif',
            'nama_ayah' => $request->nama_ayah,
            'nik_ayah' => $request->nik_ayah,
            'pekerjaan_ayah' => $request->pekerjaan_ayah,
            'nama_ibu' => $request->nama_ibu,
            'nik_ibu' => $request->nik_ibu,
            'pekerjaan_ibu' => $request->pekerjaan_ibu,
            'no_hp_orang_tua' => $request->no_hp_orang_tua,
        ]);

        return back()->with('success', 'Siswa berhasil ditambah.');
    }

    public function update(Request $request, $id)
    {
        $siswa = Siswa::findOrFail($id);

        $request->validate([
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
            'kelas' => 'nullable',
            'angkatan' => 'nullable',
            'tahun_masuk' => 'nullable',
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

        $siswa->update($request->only([
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
            'kelas',
            'angkatan',
            'tahun_masuk',
            'nomor_hp',
            'status',
            'nama_ayah',
            'nik_ayah',
            'pekerjaan_ayah',
            'nama_ibu',
            'nik_ibu',
            'pekerjaan_ibu',
            'no_hp_orang_tua',
        ]));

        return back()->with('success', 'Siswa berhasil diupdate.');
    }

    public function destroy($id)
    {
        $siswa = Siswa::findOrFail($id);
        $siswa->user->delete();
        $siswa->delete();
        return back()->with('success', 'Siswa berhasil dihapus.');
    }
}
