<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Buat permissions
        Permission::create(['name' => 'kelola semua']);
        Permission::create(['name' => 'kelola pembayaran']);
        Permission::create(['name' => 'kelola presensi']);

        // Buat roles
        Role::create(['name' => 'admin'])->givePermissionTo('kelola semua');
        Role::create(['name' => 'bendahara'])->givePermissionTo('kelola pembayaran');
        Role::create(['name' => 'sekretaris'])->givePermissionTo('kelola presensi');
        Role::create(['name' => 'ustadz']);
        Role::create(['name' => 'santri']);
        Role::create(['name' => 'walisantri']);
    }
}
