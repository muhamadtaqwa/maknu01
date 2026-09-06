<?php

namespace App\Notifications;

use App\Models\Timeline;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class AcaraH1Notification extends Notification
{
    use Queueable;

    protected $acara;

    public function __construct($acara)
    {
        $this->acara = $acara;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function sendWebPush($subscriptions)
    {
        $auth = [
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);

        $waktu = $this->acara->waktu ? substr($this->acara->waktu, 0, 5) : '';
        $tempat = $this->acara->tempat ? " • {$this->acara->tempat}" : '';

        foreach ($subscriptions as $sub) {
            $subscription = Subscription::create([
                'endpoint' => $sub->endpoint,
                'publicKey' => $sub->p256dh,
                'authToken' => $sub->auth,
            ]);

            $webPush->queueNotification(
                $subscription,
                json_encode([
                    'title' => '📅 Acara Besok!',
                    'body' => $this->acara->acara . $waktu . $tempat,
                    'icon' => '/icon-amanah.png',
                    'url' => '/timeline',
                ])
            );
        }

        foreach ($webPush->flush() as $report) {
            // Handle report if needed
        }

        return true;
    }
}
