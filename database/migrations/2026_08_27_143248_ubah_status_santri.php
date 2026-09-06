<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE santris MODIFY status ENUM('aktif','tidak aktif') DEFAULT 'aktif'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE santris MODIFY status ENUM('aktif','lulus','keluar') DEFAULT 'aktif'");
    }
};
