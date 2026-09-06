<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class PushSubscription extends Model
{
    use Notifiable;

    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh',
        'auth',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function routeNotificationFor($driver, $notification = null)
    {
        if ($driver === 'WebPush') {
            return new \Illuminate\Database\Eloquent\Collection([$this]);
        }

        return $this->getKey();
    }

    public function getPublicKeyAttribute()
    {
        return $this->p256dh;
    }

    public function getAuthTokenAttribute()
    {
        return $this->auth;
    }

    public function getContentEncodingAttribute()
    {
        return 'aes128gcm';
    }
}
