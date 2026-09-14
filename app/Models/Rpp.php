<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rpp extends Model
{
    protected $table = 'rpps';

    protected $fillable = ['mata_pelajaran', 'guru_id', 'file'];

    public function guru()
    {
        return $this->belongsTo(Guru::class);
    }
}
