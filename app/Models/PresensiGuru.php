<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresensiGuru extends Model
{
    protected $table = 'presensi_guru';

    protected $fillable = ['niu', 'tanggal', 'status', 'honor', 'nip', 'keterangan'];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'niu', 'niu');
    }
}
