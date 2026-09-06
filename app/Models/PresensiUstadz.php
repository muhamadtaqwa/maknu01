<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresensiUstadz extends Model
{
    protected $table = 'presensi_ustadz';

    protected $fillable = ['niu', 'tanggal', 'status', 'honor', 'nip', 'keterangan'];

    public function ustad()
    {
        return $this->belongsTo(Ustadz::class, 'niu', 'niu');
    }
}
