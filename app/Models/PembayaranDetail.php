<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PembayaranDetail extends Model
{
    protected $table = 'pembayaran_detail';

    protected $fillable = ['pembayaran_id', 'nominal', 'tgl_bayar'];

    public function pembayaran()
    {
        return $this->belongsTo(Pembayaran::class);
    }
}
