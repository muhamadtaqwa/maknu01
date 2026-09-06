<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_ustadz', function (Blueprint $table) {
            $table->id();
            $table->string('niu');
            $table->string('hari');
            $table->string('sesi')->nullable();
            $table->string('kitab')->nullable();
            $table->integer('honor_default')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_ustadz');
    }
};
