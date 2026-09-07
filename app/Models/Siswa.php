<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    protected $table = 'siswas';

    protected $fillable = [
        'user_id',
        'nis',
        'nisn',
        'nik',
        'nama_lengkap',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat',
        'desa',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'program_studi',
        'angkatan',
        'tahun_masuk',
        'nomor_hp',
        'status',
        'nama_ayah',
        'nik_ayah',
        'pekerjaan_ayah',
        'nama_ibu',
        'nik_ibu',
        'pekerjaan_ibu',
        'no_hp_orang_tua',
        'qr_code',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
