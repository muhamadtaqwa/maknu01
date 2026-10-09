<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class GuruController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang memiliki akses.');
        }

        $gurus = Guru::with('user')->orderBy('nama_lengkap')->get();
        return Inertia::render('Guru/Index', ['gurus' => $gurus]);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang berhak menambah guru.');
        }

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

        DB::transaction(function () use ($request) {
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
        });

        return back()->with('success', 'Guru berhasil ditambah.');
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang berhak mengedit guru.');
        }

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
        if (request()->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang berhak menghapus guru.');
        }

        DB::transaction(function () use ($id) {
            $guru = Guru::findOrFail($id);
            $guru->user?->delete();
            $guru->delete();
        });

        return back()->with('success', 'Guru berhasil dihapus.');
    }
}
