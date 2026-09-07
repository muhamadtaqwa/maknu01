<?php

namespace Database\Seeders;

use App\Models\Siswa;
use App\Models\User;
use App\Models\Guru;
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
            ['nama' => 'Ahmad Fauzi', 'jk' => 'laki-laki'],
            ['nama' => 'Siti Aminah', 'jk' => 'perempuan'],
            ['nama' => 'Budi Santoso', 'jk' => 'laki-laki'],
        ];

        foreach ($guruData as $g) {
            $user = User::create([
                'username' => strtolower(str_replace(' ', '', $g['nama'])),
                'password' => Hash::make('guru123'),
                'role' => 'guru',
            ]);
            $user->assignRole('guru');
            Guru::create([
                'user_id' => $user->id,
                'nama_lengkap' => $g['nama'],
                'jenis_kelamin' => $g['jk'],
                'status' => 'aktif',
            ]);
        }

        // ========== SISWA ==========
        $siswaData = [
            ['nis' => '001', 'nama' => 'Andi Saputra', 'jk' => 'laki-laki'],
            ['nis' => '002', 'nama' => 'Bunga Citra', 'jk' => 'perempuan'],
            ['nis' => '003', 'nama' => 'Cahyo Nugroho', 'jk' => 'laki-laki'],
        ];

        foreach ($siswaData as $s) {
            $user = User::create([
                'username' => $s['nis'],
                'password' => Hash::make('siswa123'),
                'role' => 'siswa',
            ]);
            $user->assignRole('siswa');
            Siswa::create([
                'user_id' => $user->id,
                'nis' => $s['nis'],
                'nama_lengkap' => $s['nama'],
                'jenis_kelamin' => $s['jk'],
                'status' => 'aktif',
            ]);
        }
    }
}
