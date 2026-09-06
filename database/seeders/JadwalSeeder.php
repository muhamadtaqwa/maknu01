<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JadwalSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('jadwal_ustadz')->truncate();

        $data = [
            ['niu' => '202', 'hari' => 'Ahad', 'sesi' => null, 'kitab' => 'Adabul Alim', 'honor_default' => 50000],
            ['niu' => '204', 'hari' => 'Senin', 'sesi' => null, 'kitab' => 'Fathul Qorib', 'honor_default' => 50000],
            ['niu' => '203', 'hari' => 'Selasa', 'sesi' => null, 'kitab' => 'Taisirul Kholaq', 'honor_default' => 50000],
            ['niu' => '206', 'hari' => 'Rabu', 'sesi' => null, 'kitab' => 'Arbain Nawawi', 'honor_default' => 50000],
            ['niu' => '207', 'hari' => 'Kamis', 'sesi' => 'Maghrib', 'kitab' => 'Tafsir', 'honor_default' => 50000],
            ['niu' => '201', 'hari' => 'Kamis', 'sesi' => 'Isya', 'kitab' => 'Maulid', 'honor_default' => 50000],
        ];

        DB::table('jadwal_ustadz')->insert($data);
    }
}
