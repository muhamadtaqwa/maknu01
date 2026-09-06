<?php

namespace App\Http\Controllers;

use App\Models\Timeline;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimelineController extends Controller
{
    public function index()
    {
        $data = Timeline::orderByRaw("CASE WHEN tanggal >= CURDATE() THEN 0 ELSE 1 END")
            ->orderBy('tanggal', 'asc')
            ->orderBy('waktu', 'asc')
            ->get();
        return Inertia::render('Timeline/Index', ['timeline' => $data]);
    }

    public function store(Request $request)
    {
        Timeline::create($request->validate([
            'tanggal' => 'required|date',
            'waktu' => 'nullable',
            'acara' => 'required',
            'tempat' => 'nullable',
        ]));
        return back()->with('success', 'Acara ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $timeline = Timeline::findOrFail($id);
        $timeline->update($request->validate([
            'tanggal' => 'required|date',
            'waktu' => 'nullable',
            'acara' => 'required',
            'tempat' => 'nullable',
        ]));
        return back()->with('success', 'Acara diupdate.');
    }

    public function destroy($id)
    {
        Timeline::findOrFail($id)->delete();
        return back()->with('success', 'Acara dihapus.');
    }
}
