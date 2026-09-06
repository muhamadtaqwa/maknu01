<?php

namespace Database\Seeders;

use App\Models\Santri;
use App\Models\User;
use App\Models\Ustadz;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ========== ADMIN (1 orang) ==========
        $admin = User::create([
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');

        // ========== USTADZ ==========
        $ustadzData = [
            ['niu' => '201', 'nama_lengkap' => 'Syakur'],
            ['niu' => '202', 'nama_lengkap' => 'Riza'],
            ['niu' => '203', 'nama_lengkap' => 'Farhan'],
            ['niu' => '204', 'nama_lengkap' => 'Ali'],
            ['niu' => '205', 'nama_lengkap' => 'Sugeng'],
            ['niu' => '206', 'nama_lengkap' => 'Khanif'],
            ['niu' => '207', 'nama_lengkap' => 'Rahman'],
        ];

        foreach ($ustadzData as $u) {
            $user = User::create([
                'username' => $u['niu'],
                'password' => Hash::make('password'),
                'role' => 'ustadz',
            ]);
            $user->assignRole('ustadz');
            Ustadz::create([
                'user_id' => $user->id,
                'niu' => $u['niu'],
                'nama_lengkap' => $u['nama_lengkap'],
            ]);
        }

        // ========== SANTRI ==========
        $santriData = [
            ['nis' => 'PA01', 'nama_lengkap' => 'Farich', 'jk' => 'laki-laki'],
            ['nis' => 'PA02', 'nama_lengkap' => 'Labib', 'jk' => 'laki-laki'],
            ['nis' => 'PA03', 'nama_lengkap' => 'Ave', 'jk' => 'laki-laki'],
            ['nis' => 'PA04', 'nama_lengkap' => 'Faza', 'jk' => 'laki-laki'],
            ['nis' => 'PA05', 'nama_lengkap' => 'Daffa', 'jk' => 'laki-laki'],
            ['nis' => 'PA06', 'nama_lengkap' => 'Hamid', 'jk' => 'laki-laki'],
            ['nis' => 'PA07', 'nama_lengkap' => 'Fedrix', 'jk' => 'laki-laki'],
            ['nis' => 'PA08', 'nama_lengkap' => 'Taqwa', 'jk' => 'laki-laki'],
            ['nis' => 'PI01', 'nama_lengkap' => 'Sakin', 'jk' => 'perempuan'],
        ];

        foreach ($santriData as $s) {
            $user = User::create([
                'username' => $s['nis'],
                'password' => Hash::make('password'),
                'role' => 'santri',
            ]);
            $user->assignRole('santri');
            Santri::create([
                'user_id' => $user->id,
                'nis' => $s['nis'],
                'nama_lengkap' => $s['nama_lengkap'],
                'jenis_kelamin' => $s['jk'],
                'status' => 'aktif',
                'poin_kedisiplinan' => 100,
            ]);
        }
    }
}
