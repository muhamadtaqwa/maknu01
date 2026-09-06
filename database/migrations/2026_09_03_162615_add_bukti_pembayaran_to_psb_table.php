<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('psb', function (Blueprint $table) {
            if (!Schema::hasColumn('psb', 'bukti_pembayaran')) {
                $table->string('bukti_pembayaran')->nullable()->after('no_hp_orang_tua');
            }
        });
    }

    public function down(): void
    {
        Schema::table('psb', function (Blueprint $table) {
            if (Schema::hasColumn('psb', 'bukti_pembayaran')) {
                $table->dropColumn('bukti_pembayaran');
            }
        });
    }
};
