<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cashflow extends Model
{
    protected $table = 'cashflow';

    protected $fillable = [
        'kategori',
        'tipe',
        'tanggal',
        'nominal',
        'keterangan',
        'pembayaran_id',
    ];
}
