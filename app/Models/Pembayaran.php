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
        'bukti',
        'tgl_jatuh_tempo',
        'tgl_bayar',
        'nip',
    ];

    protected $appends = ['total_dibayar', 'sisa', 'status'];

    public function santri()
    {
        return $this->belongsTo(Santri::class, 'nis', 'nis');
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
        if ($this->status_verifikasi === 'ditolak') return 'ditolak';
        if ($this->total_dibayar > 0) return 'dicicil';
        return 'menunggu';
    }
}
