<?php

namespace App\Http\Controllers;

use App\Models\Letter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LetterController extends Controller
{
    public function index()
    {
        $letters = Letter::with('user')->orderBy('created_at', 'desc')->get();
        return Inertia::render('Surat/Index', ['letters' => $letters]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kategori' => 'required|in:SK,SE,SU,SKt,ST',
            'tanggal' => 'required|date',
            'perihal' => 'required',
            'tujuan' => 'nullable',
            'isi' => 'nullable',
            'penandatangan' => 'nullable',
        ]);

        $nomor = $this->generateNomor($request->kategori, $request->tanggal);

        Letter::create([
            'kategori' => $request->kategori,
            'nomor_urut' => $nomor['urut'],
            'nomor_surat' => $nomor['lengkap'],
            'tanggal' => $request->tanggal,
            'perihal' => $request->perihal,
            'tujuan' => $request->tujuan,
            'isi' => $request->isi,
            'penandatangan' => $request->penandatangan,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Surat berhasil dibuat.');
    }

    public function update(Request $request, $id)
    {
        $letter = Letter::findOrFail($id);
        $request->validate([
            'perihal' => 'required',
            'tujuan' => 'nullable',
            'isi' => 'nullable',
            'penandatangan' => 'nullable',
        ]);

        $letter->update($request->only('perihal', 'tujuan', 'isi', 'penandatangan'));
        return back()->with('success', 'Surat diupdate.');
    }

    public function destroy($id)
    {
        $letter = Letter::findOrFail($id);
        $letter->update(['status' => 'dibatalkan']);
        $letter->delete();
        return back()->with('success', 'Surat dibatalkan.');
    }

    private function generateNomor($kategori, $tanggal)
    {
        $tahun = date('Y', strtotime($tanggal));
        $bulanRomawi = $this->bulanRomawi(date('m', strtotime($tanggal)));

        $last = Letter::where('kategori', $kategori)
            ->whereYear('tanggal', $tahun)
            ->orderBy('nomor_urut', 'desc')
            ->first();

        $urut = $last ? $last->nomor_urut + 1 : 1;
        $lengkap = str_pad($urut, 3, '0', STR_PAD_LEFT) . '/' . $kategori . '/PP.AA/' . $bulanRomawi . '/' . $tahun;

        return ['urut' => $urut, 'lengkap' => $lengkap];
    }

    private function bulanRomawi($bulan)
    {
        $romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
        return $romawi[(int)$bulan - 1];
    }
}
