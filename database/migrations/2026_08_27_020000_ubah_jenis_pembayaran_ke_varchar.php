<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE pembayaran MODIFY jenis VARCHAR(100)");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pembayaran MODIFY jenis ENUM('SPP','Kas','Kitab')");
    }
};
