<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tahfidz', function (Blueprint $table) {
            $table->id();
            $table->string('nis');
            $table->integer('juz');
            $table->integer('surat');
            $table->integer('sampai_ayat');
            $table->date('tanggal');
            $table->enum('keterangan', ['lanjut', 'ulang']);
            $table->string('penyimak');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tahfidz');
    }
};
