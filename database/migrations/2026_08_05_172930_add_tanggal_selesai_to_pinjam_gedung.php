<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pinjam_gedung', function (Blueprint $table) {
            $table->renameColumn('tanggal', 'tanggal_mulai');
            $table->date('tanggal_selesai')->nullable()->after('tanggal_mulai');
        });
    }

    public function down(): void
    {
        Schema::table('pinjam_gedung', function (Blueprint $table) {
            $table->renameColumn('tanggal_mulai', 'tanggal');
            $table->dropColumn('tanggal_selesai');
        });
    }
};
