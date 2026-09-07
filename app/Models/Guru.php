<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guru extends Model
{
    protected $table = 'gurus';

    protected $fillable = [
        'user_id',
        'nik',
        'nama_lengkap',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'pendidikan_terakhir',
        'alamat',
        'status',
        'status_kepegawaian',
        'tanggal_mulai_tugas',
        'nomor_hp',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
