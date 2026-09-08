<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PresensiGuru extends Model
{
    protected $table = 'presensi_guru';

    protected $fillable = ['guru_id', 'tanggal', 'jam_masuk', 'jam_pulang'];

    public function guru()
    {
        return $this->belongsTo(Guru::class);
    }
}
