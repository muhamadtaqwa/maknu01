<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventaris extends Model
{
    protected $table = 'inventaris';
    protected $fillable = ['kode', 'nama_barang', 'kategori', 'jumlah', 'kondisi', 'lokasi', 'keterangan'];
}
