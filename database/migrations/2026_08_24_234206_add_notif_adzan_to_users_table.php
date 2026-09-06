<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('notif_subuh')->default(true);
            $table->boolean('notif_dzuhur')->default(true);
            $table->boolean('notif_ashar')->default(true);
            $table->boolean('notif_maghrib')->default(true);
            $table->boolean('notif_isya')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'notif_subuh',
                'notif_dzuhur',
                'notif_ashar',
                'notif_maghrib',
                'notif_isya',
            ]);
        });
    }
};
