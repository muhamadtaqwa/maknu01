<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RekeningYayasan extends Model
{
    protected $table = 'rekening_yayasan';
    protected $fillable = ['bank', 'nomor_rekening', 'atas_nama'];
}
