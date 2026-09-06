<?php

namespace App\Console\Commands;

use App\Models\PushSubscription;
use App\Models\Timeline;
use App\Notifications\AcaraH1Notification;
use Illuminate\Console\Command;

class KirimNotifikasiAcaraH1 extends Command
{
    protected $signature = 'notifikasi:acara-h1';

    protected $description = 'Kirim notifikasi H-1 untuk acara besok';

    public function handle()
    {
        $besok = now()->addDay()->toDateString();

        $acaraBesok = Timeline::where('tanggal', $besok)->get();

        if ($acaraBesok->isEmpty()) {
            $this->info('Tidak ada acara besok.');
            return;
        }

        $subscriptions = PushSubscription::all();

        if ($subscriptions->isEmpty()) {
            $this->info('Tidak ada subscription.');
            return;
        }

        $notification = new AcaraH1Notification(null);

        foreach ($acaraBesok as $acara) {
            $notification = new AcaraH1Notification($acara);
            $notification->sendWebPush($subscriptions);
            $this->info("Notifikasi dikirim untuk acara: {$acara->acara}");
        }

        $this->info('Selesai.');
    }
}
