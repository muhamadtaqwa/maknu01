<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_ustadz', function (Blueprint $table) {
            $table->id();
            $table->string('niu');
            $table->date('tanggal');
            $table->enum('status', ['hadir', 'tidak_hadir'])->default('hadir');
            $table->integer('honor')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensi_ustadz');
    }
};
