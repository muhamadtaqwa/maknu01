<?php

namespace App\Console\Commands;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Console\Command;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Http;

class KirimNotifikasiAdzan extends Command
{
    protected $signature = 'notifikasi:adzan';

    protected $description = 'Kirim notifikasi adzan tepat waktu';

    public function handle()
    {
        $sekarang = now()->format('H:i');

        $users = User::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        if ($users->isEmpty()) {
            $this->info('Tidak ada user dengan lokasi.');
            return;
        }

        $subscriptions = PushSubscription::all();

        if ($subscriptions->isEmpty()) {
            $this->info('Tidak ada subscription.');
            return;
        }

        $auth = [
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);

        $sholatMap = [
            'Fajr' => ['label' => 'Subuh', 'field' => 'notif_subuh'],
            'Dhuhr' => ['label' => 'Dzuhur', 'field' => 'notif_dzuhur'],
            'Asr' => ['label' => 'Ashar', 'field' => 'notif_ashar'],
            'Maghrib' => ['label' => 'Maghrib', 'field' => 'notif_maghrib'],
            'Isha' => ['label' => 'Isya', 'field' => 'notif_isya'],
        ];

        $terkirim = 0;

        foreach ($users as $user) {
            try {
                $response = Http::get('https://api.aladhan.com/v1/timings', [
                    'latitude' => $user->latitude,
                    'longitude' => $user->longitude,
                    'method' => 20,
                ]);

                if (!$response->ok()) continue;

                $timings = $response->json()['data']['timings'] ?? null;
                if (!$timings) continue;

                foreach ($sholatMap as $key => $info) {
                    $waktuSholat = substr($timings[$key] ?? '', 0, 5);

                    // Cek preferensi user
                    if ($waktuSholat === $sekarang && $user->{$info['field']}) {
                        $userSubs = $subscriptions->where('user_id', $user->id);

                        foreach ($userSubs as $sub) {
                            $subscription = Subscription::create([
                                'endpoint' => $sub->endpoint,
                                'publicKey' => $sub->p256dh,
                                'authToken' => $sub->auth,
                            ]);

                            $webPush->queueNotification(
                                $subscription,
                                json_encode([
                                    'title' => "🕌 Waktu {$info['label']}",
                                    'body' => "Sudah masuk waktu sholat {$info['label']}",
                                    'icon' => '/icon-amanah.png',
                                    'url' => '/jadwal-sholat',
                                ])
                            );

                            $terkirim++;
                            $this->info("Notifikasi {$info['label']} dikirim ke user_id: {$user->id}");
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error("Error untuk user {$user->id}: " . $e->getMessage());
            }
        }

        foreach ($webPush->flush() as $report) {
            // Handle report
        }

        $this->info("Selesai. Total terkirim: $terkirim");
    }
}
