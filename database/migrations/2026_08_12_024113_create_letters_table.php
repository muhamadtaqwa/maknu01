<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letters', function (Blueprint $table) {
            $table->id();
            $table->string('kategori'); // SK, SE, SU, SKt, ST
            $table->integer('nomor_urut');
            $table->string('nomor_surat');
            $table->date('tanggal');
            $table->string('perihal');
            $table->string('tujuan')->nullable();
            $table->text('isi');
            $table->string('penandatangan')->nullable();
            $table->string('status')->default('aktif'); // aktif, dibatalkan
            $table->foreignId('created_by')->constrained('users');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letters');
    }
};
