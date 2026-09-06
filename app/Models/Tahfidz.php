<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tahfidz extends Model
{
    protected $table = 'tahfidz';

    protected $fillable = [
        'nis',
        'juz',
        'surat',
        'sampai_ayat',
        'tanggal',
        'keterangan',
        'penyimak',
    ];

    public function santri()
    {
        return $this->belongsTo(Santri::class, 'nis', 'nis');
    }
}
