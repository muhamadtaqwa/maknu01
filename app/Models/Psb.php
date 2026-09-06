<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Psb extends Model
{
    protected $table = 'psb';

    protected $fillable = [
        'nik',
        'nisn',
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
        'kamar',
        'nomor_hp',
        'nama_ayah',
        'nik_ayah',
        'pekerjaan_ayah',
        'nama_ibu',
        'nik_ibu',
        'pekerjaan_ibu',
        'no_hp_orang_tua',
        'bukti_pembayaran',
        'status',
        'catatan',
    ];
}
