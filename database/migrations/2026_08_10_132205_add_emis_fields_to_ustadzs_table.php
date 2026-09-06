<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ustadzs', function (Blueprint $table) {
            $table->string('nip_nuptk')->nullable()->after('niu');
            $table->string('nik')->nullable()->after('nip_nuptk');
            $table->string('tempat_lahir')->nullable()->after('nama_lengkap');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->text('alamat')->nullable()->after('pendidikan_terakhir');
            $table->string('status_kepegawaian')->nullable()->after('status');
            $table->date('tanggal_mulai_tugas')->nullable()->after('status_kepegawaian');
        });
    }

    public function down(): void
    {
        Schema::table('ustadzs', function (Blueprint $table) {
            $table->dropColumn([
                'nip_nuptk',
                'nik',
                'tempat_lahir',
                'tanggal_lahir',
                'alamat',
                'status_kepegawaian',
                'tanggal_mulai_tugas',
            ]);
        });
    }
};
