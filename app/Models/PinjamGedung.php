<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PinjamGedung extends Model
{
    protected $table = 'pinjam_gedung';
    protected $fillable = ['nama_peminjam', 'gedung', 'tanggal_mulai', 'tanggal_selesai', 'jam_mulai', 'jam_selesai', 'keperluan', 'status'];
}
