<?php

namespace App\Http\Controllers;

use App\Models\PinjamGedung;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PinjamGedungController extends Controller
{
    public function index()
    {
        $data = PinjamGedung::orderByRaw("CASE WHEN status = 'aktif' AND tanggal_selesai >= CURDATE() THEN 0 ELSE 1 END")
            ->orderBy('tanggal_mulai', 'desc')
            ->get();
        return Inertia::render('PinjamGedung/Index', ['pinjam' => $data]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_peminjam' => 'required',
            'gedung' => 'required',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
        ]);

        PinjamGedung::create($request->all());
        return back()->with('success', 'Peminjaman dicatat.');
    }

    public function update(Request $request, $id)
    {
        $pinjam = PinjamGedung::findOrFail($id);
        $pinjam->update($request->all());
        return back()->with('success', 'Diupdate.');
    }

    public function destroy($id)
    {
        PinjamGedung::findOrFail($id)->delete();
        return back()->with('success', 'Dihapus.');
    }
}
