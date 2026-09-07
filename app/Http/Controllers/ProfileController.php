<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = auth()->user()->load('guru', 'siswa');
        return Inertia::render('Profil/Index', ['user' => $user]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        if ($user->role === 'guru') {
            $request->validate([
                'nama_lengkap' => 'required',
                'nik' => 'nullable',
                'tempat_lahir' => 'nullable',
                'tanggal_lahir' => 'nullable|date',
                'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
                'pendidikan_terakhir' => 'nullable',
                'alamat' => 'nullable',
                'nomor_hp' => 'nullable',
                'password' => 'nullable|min:6',
            ]);

            $user->guru->update($request->only([
                'nama_lengkap',
                'nik',
                'tempat_lahir',
                'tanggal_lahir',
                'jenis_kelamin',
                'pendidikan_terakhir',
                'alamat',
                'nomor_hp',
            ]));
        } elseif ($user->role === 'siswa') {
            $request->validate([
                'nama_lengkap' => 'required',
                'nik' => 'nullable',
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
                'nomor_hp' => 'nullable',
                'nama_ayah' => 'nullable',
                'nik_ayah' => 'nullable',
                'pekerjaan_ayah' => 'nullable',
                'nama_ibu' => 'nullable',
                'nik_ibu' => 'nullable',
                'pekerjaan_ibu' => 'nullable',
                'no_hp_orang_tua' => 'nullable',
                'password' => 'nullable|min:6',
            ]);

            $user->siswa->update($request->only([
                'nama_lengkap',
                'nik',
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
                'nomor_hp',
                'nama_ayah',
                'nik_ayah',
                'pekerjaan_ayah',
                'nama_ibu',
                'nik_ibu',
                'pekerjaan_ibu',
                'no_hp_orang_tua',
            ]));
        }

        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        return back()->with('success', 'Profil berhasil diupdate.');
    }

    public function gantiPassword(Request $request)
    {
        $request->validate([
            'username' => 'required|exists:users,username',
            'password_baru' => 'required|min:6',
        ]);

        $user = User::where('username', $request->username)->first();
        $user->update(['password' => Hash::make($request->password_baru)]);

        return back()->with('success', 'Password berhasil diubah.');
    }
}
