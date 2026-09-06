<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;

    protected $fillable = [
        'username',
        'password',
        'role',
        'latitude',
        'longitude',
        'notif_subuh',
        'notif_dzuhur',
        'notif_ashar',
        'notif_maghrib',
        'notif_isya',
    ];

    protected $hidden = ['password', 'remember_token'];

    public function ustadz()
    {
        return $this->hasOne(Ustadz::class);
    }

    public function santri()
    {
        return $this->hasOne(Santri::class);
    }
}
