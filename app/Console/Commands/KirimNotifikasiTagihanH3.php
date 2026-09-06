<?php

namespace App\Console\Commands;

use App\Models\PushSubscription;
use Illuminate\Console\Command;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\DB;

class KirimNotifikasiTagihanH3 extends Command
{
    protected $signature = 'notifikasi:tagihan-h3';

    protected $description = 'Kirim notifikasi tagihan jatuh tempo H-3';

    public function handle()
    {
        $h3 = now()->addDays(3)->toDateString();

        // Ambil tagihan yang jatuh tempo H-3 dan belum lunas
        $tagihan = DB::table('pembayaran')
            ->join('santris', 'pembayaran.nis', '=', 'santris.nis')
            ->join('users', 'users.id', '=', 'santris.user_id')
            ->where('pembayaran.status_verifikasi', '!=', 'lunas')
            ->whereDate('pembayaran.tgl_jatuh_tempo', $h3)
            ->select(
                'pembayaran.id',
                'pembayaran.jenis',
                'pembayaran.nama_pembayaran',
                'pembayaran.nominal',
                'pembayaran.tgl_jatuh_tempo',
                'santris.nama_lengkap',
                'santris.nis',
                'users.id as user_id'
            )
            ->get();

        if ($tagihan->isEmpty()) {
            $this->info('Tidak ada tagihan H-3.');
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
        $terkirim = 0;

        foreach ($tagihan as $item) {
            $userSubs = $subscriptions->where('user_id', $item->user_id);

            foreach ($userSubs as $sub) {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->p256dh,
                    'authToken' => $sub->auth,
                ]);

                $webPush->queueNotification(
                    $subscription,
                    json_encode([
                        'title' => '💰 Tagihan Jatuh Tempo',
                        'body' => "{$item->nama_pembayaran} Rp " . number_format($item->nominal, 0, ',', '.') . " jatuh tempo H-3 lagi",
                        'icon' => '/icon-amanah.png',
                        'url' => '/tagihan',
                    ])
                );

                $terkirim++;
                $this->info("Notifikasi dikirim ke {$item->nama_lengkap} ({$item->nis})");
            }
        }

        foreach ($webPush->flush() as $report) {
            // Handle report
        }

        $this->info("Selesai. Total terkirim: $terkirim");
    }
}
