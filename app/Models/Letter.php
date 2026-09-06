<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Letter extends Model
{
    use SoftDeletes;

    protected $table = 'letters';

    protected $fillable = [
        'kategori',
        'nomor_urut',
        'nomor_surat',
        'tanggal',
        'perihal',
        'tujuan',
        'isi',
        'penandatangan',
        'status',
        'created_by',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
