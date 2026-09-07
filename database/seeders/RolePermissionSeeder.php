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
        $admin->syncPermissions([$kelolaSemua, $kelolaPembayaran, $kelolaPresensi]);

        Role::firstOrCreate(['name' => 'guru']);
        Role::firstOrCreate(['name' => 'siswa']);
    }
}
