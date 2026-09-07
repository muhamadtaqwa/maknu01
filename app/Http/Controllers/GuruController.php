<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class GuruController extends Controller
{
    public function index()
    {
        $gurus = Guru::with('user')->orderBy('nama_lengkap')->get();
        return Inertia::render('Guru/Index', ['gurus' => $gurus]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|unique:users,username',
            'nik' => 'nullable',
            'nama_lengkap' => 'required',
            'tempat_lahir' => 'nullable',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
            'pendidikan_terakhir' => 'nullable',
            'alamat' => 'nullable',
            'status' => 'nullable|in:aktif,tidak aktif',
            'status_kepegawaian' => 'nullable|in:PNS,PPPK,Honorer',
            'tanggal_mulai_tugas' => 'nullable|date',
            'nomor_hp' => 'nullable',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => 'guru',
        ]);
        $user->assignRole('guru');

        Guru::create([
            'user_id' => $user->id,
            'nik' => $request->nik,
            'nama_lengkap' => $request->nama_lengkap,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'pendidikan_terakhir' => $request->pendidikan_terakhir,
            'alamat' => $request->alamat,
            'status' => $request->status ?? 'aktif',
            'status_kepegawaian' => $request->status_kepegawaian,
            'tanggal_mulai_tugas' => $request->tanggal_mulai_tugas,
            'nomor_hp' => $request->nomor_hp,
        ]);

        return back()->with('success', 'Guru berhasil ditambah.');
    }

    public function update(Request $request, $id)
    {
        $guru = Guru::findOrFail($id);

        $request->validate([
            'nik' => 'nullable',
            'nama_lengkap' => 'required',
            'tempat_lahir' => 'nullable',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
            'pendidikan_terakhir' => 'nullable',
            'alamat' => 'nullable',
            'status' => 'nullable|in:aktif,tidak aktif',
            'status_kepegawaian' => 'nullable|in:PNS,PPPK,Honorer',
            'tanggal_mulai_tugas' => 'nullable|date',
            'nomor_hp' => 'nullable',
        ]);

        $guru->update($request->only([
            'nik',
            'nama_lengkap',
            'tempat_lahir',
            'tanggal_lahir',
            'jenis_kelamin',
            'pendidikan_terakhir',
            'alamat',
            'status',
            'status_kepegawaian',
            'tanggal_mulai_tugas',
            'nomor_hp',
        ]));

        return back()->with('success', 'Guru berhasil diupdate.');
    }

    public function destroy($id)
    {
        $guru = Guru::findOrFail($id);
        $guru->user->delete();
        $guru->delete();
        return back()->with('success', 'Guru berhasil dihapus.');
    }
}
