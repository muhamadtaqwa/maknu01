<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Console\Commands\KirimNotifikasiAcaraH1;
use App\Console\Commands\KirimNotifikasiAdzan;
use App\Console\Commands\KirimNotifikasiTagihanH3;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(KirimNotifikasiAcaraH1::class)->dailyAt('08:00');
Schedule::command(KirimNotifikasiAdzan::class)->everyMinute();
Schedule::command(KirimNotifikasiTagihanH3::class)->dailyAt('08:00');
