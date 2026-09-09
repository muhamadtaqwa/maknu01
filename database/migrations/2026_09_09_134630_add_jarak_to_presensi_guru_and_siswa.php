<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presensi_guru', function (Blueprint $table) {
            $table->decimal('jarak', 10, 2)->nullable()->after('status');
        });

        Schema::table('presensi_siswa', function (Blueprint $table) {
            $table->decimal('jarak', 10, 2)->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('presensi_guru', function (Blueprint $table) {
            $table->dropColumn('jarak');
        });

        Schema::table('presensi_siswa', function (Blueprint $table) {
            $table->dropColumn('jarak');
        });
    }
};
