<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    protected $fillable = [
        'nis',
        'jenis',
        'nama_pembayaran',
        'nominal',
        'status_verifikasi',
        'tgl_jatuh_tempo',
    ];

    protected $appends = ['total_dibayar', 'sisa', 'status'];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'nis', 'nis');
    }

    public function details()
    {
        return $this->hasMany(PembayaranDetail::class);
    }

    public function getTotalDibayarAttribute()
    {
        return $this->details()->sum('nominal');
    }

    public function getSisaAttribute()
    {
        return $this->nominal - $this->total_dibayar;
    }

    public function getStatusAttribute()
    {
        if ($this->status_verifikasi === 'lunas') return 'lunas';
        if ($this->total_dibayar > 0) return 'dicicil';
        return 'menunggu';
    }
}
