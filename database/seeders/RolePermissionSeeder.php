<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $kelolaSemua = Permission::firstOrCreate(['name' => 'kelola semua']);
        $kelolaPembayaran = Permission::firstOrCreate(['name' => 'kelola pembayaran']);
        $kelolaPresensi = Permission::firstOrCreate(['name' => 'kelola presensi']);

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions([$kelolaSemua]);

        $bendahara = Role::firstOrCreate(['name' => 'bendahara']);
        $bendahara->syncPermissions([$kelolaPembayaran]);

        $sekretaris = Role::firstOrCreate(['name' => 'sekretaris']);
        $sekretaris->syncPermissions([$kelolaPresensi]);

        Role::firstOrCreate(['name' => 'ustadz']);
        Role::firstOrCreate(['name' => 'santri']);
        Role::firstOrCreate(['name' => 'walisantri']);
    }
}
