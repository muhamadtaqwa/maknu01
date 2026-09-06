<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushSubscriptionController extends Controller
{
    /**
     * Daftar jenis notifikasi yang boleh dikirim lewat fitur test,
     * beserta judul, isi, dan tujuan link-nya.
     */
    private const NOTIF_MAP = [
        'acara'    => ['Acara',   'Besok ada acara pondok',       '/timeline'],
        'adzan'    => ['Adzan',   'Sudah masuk waktu sholat',     '/jadwal-sholat'],
        'tenggat'  => ['Tenggat', 'Tagihan jatuh tempo H-3 lagi', '/tagihan'],
        'tagihan'  => ['Tagihan', 'Tagihan baru dibuat',          '/tagihan'],
        'lunas'    => ['Lunas',   'Pembayaran diterima',          '/tagihan'],
        'ditolak'  => ['Ditolak', 'Pembayaran ditolak',           '/tagihan'],
    ];

    /**
     * Simpan / perbarui subscription push milik user yang sedang login.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
            'p256dh'   => 'required|string',
            'auth'     => 'required|string',
        ]);

        PushSubscription::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json(['success' => true]);
    }

    /**
     * Hapus subscription push milik user yang sedang login.
     */
    public function destroy(Request $request)
    {
        PushSubscription::where('user_id', $request->user()->id)->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Kirim notifikasi test ke seluruh subscriber.
     * Hanya admin yang boleh mengirim.
     */
    public function kirimTestJenis(Request $request): RedirectResponse
    {
        if ($request->user()->role !== 'admin') {
            return back()->with('error', 'Anda tidak punya akses.');
        }

        $validated = $request->validate([
            'jenis' => 'required|string|in:' . implode(',', array_keys(self::NOTIF_MAP)),
        ]);

        if (!PushSubscription::exists()) {
            return back()->with('error', 'Belum ada subscription yang terdaftar.');
        }

        [$title, $body, $url] = self::NOTIF_MAP[$validated['jenis']];

        try {
            $webPush = new WebPush([
                'VAPID' => [
                    'subject'    => config('webpush.vapid.subject'),
                    'publicKey'  => config('webpush.vapid.public_key'),
                    'privateKey' => config('webpush.vapid.private_key'),
                ],
            ]);

            $terkirim = 0;
            $gagal = 0;
            $endpointKadaluarsa = [];

            PushSubscription::chunk(100, function ($subs) use ($webPush, $title, $body, $url, &$terkirim, &$gagal, &$endpointKadaluarsa) {
                foreach ($subs as $sub) {
                    $webPush->queueNotification(
                        Subscription::create([
                            'endpoint'  => $sub->endpoint,
                            'publicKey' => $sub->p256dh,
                            'authToken' => $sub->auth,
                        ]),
                        json_encode([
                            'title' => $title,
                            'body'  => $body,
                            'icon'  => '/icon-amanah.png',
                            'url'   => $url,
                        ])
                    );
                }

                foreach ($webPush->flush() as $report) {
                    if ($report->isSuccess()) {
                        $terkirim++;
                        continue;
                    }

                    $gagal++;

                    if (method_exists($report, 'isSubscriptionExpired') && $report->isSubscriptionExpired()) {
                        $endpointKadaluarsa[] = (string) $report->getRequest()->getUri();
                    }
                }
            });

            if (!empty($endpointKadaluarsa)) {
                PushSubscription::whereIn('endpoint', $endpointKadaluarsa)->delete();
            }

            $pesan = "Notifikasi \"{$title}\" terkirim: {$terkirim} berhasil, {$gagal} gagal.";

            if (!empty($endpointKadaluarsa)) {
                $pesan .= ' ' . count($endpointKadaluarsa) . ' subscription kadaluarsa telah dibersihkan.';
            }

            return back()->with('success', $pesan);
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengirim notifikasi: ' . $e->getMessage());
        }
    }
}
