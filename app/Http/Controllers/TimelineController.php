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
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang berhak menambah agenda.');
        }

        Timeline::create($request->validate([
            'tanggal' => 'required|date',
            'waktu' => 'nullable|string|max:50',
            'acara' => 'required|string|max:255',
            'tempat' => 'nullable|string|max:255',
        ]));
        return back()->with('success', 'Acara ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang berhak mengedit agenda.');
        }

        $timeline = Timeline::findOrFail($id);
        $timeline->update($request->validate([
            'tanggal' => 'required|date',
            'waktu' => 'nullable|string|max:50',
            'acara' => 'required|string|max:255',
            'tempat' => 'nullable|string|max:255',
        ]));
        return back()->with('success', 'Acara diupdate.');
    }

    public function destroy($id)
    {
        if (request()->user()->role !== 'admin') {
            abort(403, 'Hanya admin yang berhak menghapus agenda.');
        }

        Timeline::findOrFail($id)->delete();
        return back()->with('success', 'Acara dihapus.');
    }
}
