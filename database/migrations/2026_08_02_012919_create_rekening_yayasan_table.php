<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rekening_yayasan', function (Blueprint $table) {
            $table->id();
            $table->string('bank');
            $table->string('nomor_rekening');
            $table->string('atas_nama');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rekening_yayasan');
    }
};
