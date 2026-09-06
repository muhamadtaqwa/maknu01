<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('santris', function (Blueprint $table) {
            $table->string('nik')->nullable()->after('nis');
            $table->string('tempat_lahir')->nullable()->after('nama_lengkap');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->string('jenis_kelamin')->nullable()->after('tanggal_lahir');
            $table->string('program_studi')->nullable()->after('jenis_kelamin');
            $table->string('angkatan')->nullable()->after('program_studi');
            $table->string('kamar')->nullable()->after('angkatan');
            $table->string('nomor_hp')->nullable()->after('kamar');
            $table->string('status')->default('aktif')->after('nomor_hp');
        });
    }

    public function down(): void
    {
        Schema::table('santris', function (Blueprint $table) {
            $table->dropColumn(['nik', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'program_studi', 'angkatan', 'kamar', 'nomor_hp', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
};
