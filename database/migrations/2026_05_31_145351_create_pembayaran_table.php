<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->string('nis');
            $table->foreign('nis')->references('nis')->on('santris')->onDelete('cascade');
            $table->enum('jenis', ['SPP', 'Kitab', 'Kas']);
            $table->string('nama_pembayaran');
            $table->integer('nominal');
            $table->enum('status', ['belum_lunas', 'lunas'])->default('belum_lunas');
            $table->date('tgl_jatuh_tempo')->nullable();
            $table->dateTime('tgl_bayar')->nullable();
            $table->string('nip')->nullable();
            $table->foreign('nip')->references('nip')->on('pengurus')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};