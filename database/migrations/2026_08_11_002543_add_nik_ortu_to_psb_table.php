<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('psb', function (Blueprint $table) {
            $table->string('nik_ayah')->nullable()->after('pekerjaan_ayah');
            $table->string('nik_ibu')->nullable()->after('pekerjaan_ibu');
        });
    }

    public function down(): void
    {
        Schema::table('psb', function (Blueprint $table) {
            $table->dropColumn(['nik_ayah', 'nik_ibu']);
        });
    }
};
