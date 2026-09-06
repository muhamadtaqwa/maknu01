<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('santris', function (Blueprint $table) {
            $table->string('nisn')->nullable()->after('nis');
            $table->text('alamat')->nullable()->after('tanggal_lahir');
            $table->string('desa')->nullable()->after('alamat');
            $table->string('kecamatan')->nullable()->after('desa');
            $table->string('kabupaten')->nullable()->after('kecamatan');
            $table->string('provinsi')->nullable()->after('kabupaten');
            $table->string('nama_ayah')->nullable()->after('nomor_hp');
            $table->string('nik_ayah')->nullable()->after('nama_ayah');
            $table->string('pekerjaan_ayah')->nullable()->after('nik_ayah');
            $table->string('nama_ibu')->nullable()->after('pekerjaan_ayah');
            $table->string('nik_ibu')->nullable()->after('nama_ibu');
            $table->string('pekerjaan_ibu')->nullable()->after('nik_ibu');
            $table->string('no_hp_orang_tua')->nullable()->after('pekerjaan_ibu');
            $table->year('tahun_masuk')->nullable()->after('no_hp_orang_tua');
        });
    }

    public function down(): void
    {
        Schema::table('santris', function (Blueprint $table) {
            $table->dropColumn([
                'nisn',
                'alamat',
                'desa',
                'kecamatan',
                'kabupaten',
                'provinsi',
                'nama_ayah',
                'nik_ayah',
                'pekerjaan_ayah',
                'nama_ibu',
                'nik_ibu',
                'pekerjaan_ibu',
                'no_hp_orang_tua',
                'tahun_masuk',
            ]);
        });
    }
};
