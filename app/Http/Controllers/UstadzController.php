<?php

namespace App\Http\Controllers;

use App\Models\Ustadz;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UstadzController extends Controller
{
    public function index()
    {
        $ustadzs = Ustadz::with('user')->orderBy('niu')->get();
        return Inertia::render('Ustadz/Index', ['ustadzs' => $ustadzs]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nip_nuptk' => 'nullable',
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

        $last = Ustadz::orderBy('niu', 'desc')->first();
        if ($last) {
            $num = (int) substr($last->niu, 1) + 1;
        } else {
            $num = 1;
        }
        $niu = 'U' . str_pad($num, 2, '0', STR_PAD_LEFT);

        $user = User::create([
            'username' => $niu,
            'password' => Hash::make($request->password),
            'role' => 'ustadz',
        ]);
        $user->assignRole('ustadz');

        Ustadz::create([
            'user_id' => $user->id,
            'niu' => $niu,
            'nip_nuptk' => $request->nip_nuptk,
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

        return back()->with('success', 'Ustadz berhasil ditambah.');
    }

    public function update(Request $request, $id)
    {
        $ustadz = Ustadz::findOrFail($id);

        $request->validate([
            'nip_nuptk' => 'nullable',
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

        $ustadz->update($request->only([
            'nip_nuptk',
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

        return back()->with('success', 'Ustadz berhasil diupdate.');
    }

    public function destroy($id)
    {
        $ustadz = Ustadz::findOrFail($id);
        $ustadz->user->delete();
        $ustadz->delete();
        return back()->with('success', 'Ustadz berhasil dihapus.');
    }
}
