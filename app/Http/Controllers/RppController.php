<?php

namespace App\Http\Controllers;

use App\Models\Rpp;
use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RppController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isAdmin = $user->role === 'admin';
        $isGuru = $user->role === 'guru';

        $rpps = Rpp::with('guru')->orderBy('created_at', 'desc')->get();
        $gurus = Guru::where('status', 'aktif')->orderBy('nama_lengkap')->get();

        return Inertia::render('Rpp/Index', [
            'rpps' => $rpps,
            'gurus' => $gurus,
            'isAdmin' => $isAdmin,
            'isGuru' => $isGuru,
            'myGuruId' => $isGuru ? $user->guru->id : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'mata_pelajaran' => 'required|string',
            'guru_id' => 'required|exists:gurus,id',
            'file' => 'required|mimes:pdf|max:10240',
        ]);

        $path = $request->file('file')->store('rpp', 'public');

        Rpp::create([
            'mata_pelajaran' => $request->mata_pelajaran,
            'guru_id' => $request->guru_id,
            'file' => $path,
        ]);

        return back()->with('success', 'RPP berhasil diupload.');
    }

    public function update(Request $request, $id)
    {
        $rpp = Rpp::findOrFail($id);
        $user = auth()->user();

        // Cek akses
        if ($user->role !== 'admin' && $user->guru->id !== $rpp->guru_id) {
            return back()->with('error', 'Anda tidak berhak mengedit RPP ini.');
        }

        $request->validate([
            'mata_pelajaran' => 'required|string',
            'guru_id' => 'required|exists:gurus,id',
            'file' => 'nullable|mimes:pdf|max:10240',
        ]);

        $data = [
            'mata_pelajaran' => $request->mata_pelajaran,
            'guru_id' => $request->guru_id,
        ];

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($rpp->file);
            $data['file'] = $request->file('file')->store('rpp', 'public');
        }

        $rpp->update($data);

        return back()->with('success', 'RPP berhasil diupdate.');
    }

    public function destroy($id)
    {
        $rpp = Rpp::findOrFail($id);
        $user = auth()->user();

        // Cek akses
        if ($user->role !== 'admin' && $user->guru->id !== $rpp->guru_id) {
            return back()->with('error', 'Anda tidak berhak menghapus RPP ini.');
        }

        Storage::disk('public')->delete($rpp->file);
        $rpp->delete();

        return back()->with('success', 'RPP berhasil dihapus.');
    }
}
