<?php

namespace App\Http\Controllers;

use App\Models\Inventaris;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventarisController extends Controller
{
    public function index()
    {
        $data = Inventaris::orderBy('kode')->get();
        return Inertia::render('Inventaris/Index', ['inventaris' => $data]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required',
            'kategori' => 'nullable',
            'jumlah' => 'required|integer|min:1',
            'kondisi' => 'nullable',
            'lokasi' => 'nullable',
            'keterangan' => 'nullable',
        ]);

        $last = Inventaris::orderBy('id', 'desc')->first();
        $nextId = $last ? $last->id + 1 : 1;
        $kode = 'INV-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);

        Inventaris::create([
            'kode' => $kode,
            'nama_barang' => $request->nama_barang,
            'kategori' => $request->kategori,
            'jumlah' => $request->jumlah,
            'kondisi' => $request->kondisi ?? 'baik',
            'lokasi' => $request->lokasi,
            'keterangan' => $request->keterangan,
        ]);

        return back()->with('success', 'Barang ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $inventaris = Inventaris::findOrFail($id);
        $inventaris->update($request->only([
            'nama_barang',
            'kategori',
            'jumlah',
            'kondisi',
            'lokasi',
            'keterangan',
        ]));
        return back()->with('success', 'Barang diupdate.');
    }

    public function destroy($id)
    {
        Inventaris::findOrFail($id)->delete();
        return back()->with('success', 'Barang dihapus.');
    }
}
