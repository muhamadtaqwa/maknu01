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
        $user = auth()->user()->load('ustadz', 'santri');
        return Inertia::render('Profil/Index', ['user' => $user]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        if ($user->role === 'ustadz') {
            $request->validate([
                'nama_lengkap' => 'required',
                'nip_nuptk' => 'nullable',
                'nik' => 'nullable',
                'tempat_lahir' => 'nullable',
                'tanggal_lahir' => 'nullable|date',
                'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
                'pendidikan_terakhir' => 'nullable',
                'alamat' => 'nullable',
                'nomor_hp' => 'nullable',
                'password' => 'nullable|min:6',
            ]);

            $user->ustadz->update($request->only([
                'nama_lengkap',
                'nip_nuptk',
                'nik',
                'tempat_lahir',
                'tanggal_lahir',
                'jenis_kelamin',
                'pendidikan_terakhir',
                'alamat',
                'nomor_hp',
            ]));
        } elseif ($user->role === 'santri') {
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
                'kamar' => 'nullable',
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

            $user->santri->update($request->only([
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
                'kamar',
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

    public function simpanLokasi(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $request->user()->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return back()->with('success', 'Lokasi tersimpan');
    }

    public function simpanNotifAdzan(Request $request)
    {
        $request->validate([
            'key' => 'required|in:subuh,dzuhur,ashar,maghrib,isya',
            'value' => 'required|boolean',
        ]);

        $field = 'notif_' . $request->key;

        $request->user()->update([
            $field => $request->value,
        ]);

        return back()->with('success', 'Preferensi notifikasi tersimpan');
    }
}
