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
        // ========== ADMIN ==========
        $admin = User::create([
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');

        // ========== GURU ==========
        $guruData = [
            ['niu' => 'G001', 'nama' => 'Ahmad Fauzi', 'jk' => 'laki-laki'],
            ['niu' => 'G002', 'nama' => 'Siti Aminah', 'jk' => 'perempuan'],
            ['niu' => 'G003', 'nama' => 'Budi Santoso', 'jk' => 'laki-laki'],
        ];

        foreach ($guruData as $g) {
            $user = User::create([
                'username' => $g['niu'],
                'password' => Hash::make('password'),
                'role' => 'ustadz',
            ]);
            $user->assignRole('ustadz');
            Ustadz::create([
                'user_id' => $user->id,
                'niu' => $g['niu'],
                'nama_lengkap' => $g['nama'],
                'jenis_kelamin' => $g['jk'],
                'status' => 'aktif',
            ]);
        }

        // ========== SISWA ==========
        $siswaData = [
            ['nis' => 'S001', 'nama' => 'Andi Saputra', 'jk' => 'laki-laki'],
            ['nis' => 'S002', 'nama' => 'Bunga Citra', 'jk' => 'perempuan'],
            ['nis' => 'S003', 'nama' => 'Cahyo Nugroho', 'jk' => 'laki-laki'],
        ];

        foreach ($siswaData as $s) {
            $user = User::create([
                'username' => $s['nis'],
                'password' => Hash::make('password'),
                'role' => 'santri',
            ]);
            $user->assignRole('santri');
            Santri::create([
                'user_id' => $user->id,
                'nis' => $s['nis'],
                'nama_lengkap' => $s['nama'],
                'jenis_kelamin' => $s['jk'],
                'status' => 'aktif',
            ]);
        }
    }
}
