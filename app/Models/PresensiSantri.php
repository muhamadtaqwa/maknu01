<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresensiSantri extends Model
{
    protected $table = 'presensi_santri';

    protected $fillable = ['nis', 'tanggal', 'jam'];

    public function santri()
    {
        return $this->belongsTo(Santri::class, 'nis', 'nis');
    }
}
