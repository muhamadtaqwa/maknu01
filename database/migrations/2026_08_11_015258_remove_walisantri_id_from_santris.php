<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('santris', function (Blueprint $table) {
            // Cek dulu apakah kolom ada sebelum drop
            if (Schema::hasColumn('santris', 'walisantri_id')) {
                $table->dropColumn('walisantri_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('santris', function (Blueprint $table) {
            $table->foreignId('walisantri_id')->nullable()->after('user_id');
        });
    }
};
