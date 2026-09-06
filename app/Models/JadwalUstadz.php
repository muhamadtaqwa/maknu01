<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JadwalUstadz extends Model
{
    protected $table = 'jadwal_ustadz';

    protected $fillable = ['niu', 'hari', 'sesi', 'kitab', 'honor_default'];

    public function ustad()
    {
        return $this->belongsTo(Ustadz::class, 'niu', 'niu');
    }
}
