<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ustadzs', function (Blueprint $table) {
            $table->string('jenis_kelamin')->nullable()->after('nama_lengkap');
            $table->string('pendidikan_terakhir')->nullable()->after('jenis_kelamin');
            $table->string('status')->default('aktif')->after('pendidikan_terakhir');
            $table->string('nomor_hp')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('ustadzs', function (Blueprint $table) {
            $table->dropColumn(['jenis_kelamin', 'pendidikan_terakhir', 'status', 'nomor_hp']);
        });
    }
};
