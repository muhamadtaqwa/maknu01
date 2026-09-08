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
        Schema::table('presensi_guru', function (Blueprint $table) {
            $table->enum('status', ['tepat_waktu', 'terlambat'])->nullable()->after('jam_masuk');
        });

        Schema::table('presensi_siswa', function (Blueprint $table) {
            $table->enum('status', ['tepat_waktu', 'terlambat'])->nullable()->after('jam_masuk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('presensi_guru', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('presensi_siswa', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
