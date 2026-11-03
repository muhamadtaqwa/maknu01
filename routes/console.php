<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwal command notifikasi (dinonaktifkan sementara karena class command belum diimplementasikan)
// Schedule::command(\App\Console\Commands\KirimNotifikasiAcaraH1::class)->dailyAt('08:00');
// Schedule::command(\App\Console\Commands\KirimNotifikasiAdzan::class)->everyMinute();
// Schedule::command(\App\Console\Commands\KirimNotifikasiTagihanH3::class)->dailyAt('08:00');

