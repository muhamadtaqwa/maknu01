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
            'password' => Hash::make('adminmak123'),
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');

        // ========== GURU ==========
        $guruData = [
            ['username' => 'musyafa', 'nama' => "HM. Musyafa' R., S.Pd.I., M.Pd."],
            ['username' => 'muhdhor', 'nama' => 'Ahmad Muhdhor, S.Pd.'],
            ['username' => 'rifqi', 'nama' => 'M. Rifqi Hasan, M.H.'],
            ['username' => 'muttaqin', 'nama' => 'Muttaqin Teguh S., S.Pd.'],
            ['username' => 'anshori', 'nama' => 'M. Khoirul Al Anshori, M.Pd.'],
            ['username' => 'anwaar', 'nama' => 'Choirul Anwaar, S.Pd.'],
            ['username' => 'zeni', 'nama' => 'Zeni Kiswayanti, S.Pd.'],
            ['username' => 'nailil', 'nama' => 'Nailil Maziyati, S.Pd.'],
            ['username' => 'imam', 'nama' => 'Imam Lilik Setiaji, S.Kom.'],
            ['username' => 'aldi', 'nama' => 'Aldi Candra Mufti, LC.'],
            ['username' => 'mudhofar', 'nama' => 'Mudhofar, S.Pd.'],
        ];

        foreach ($guruData as $g) {
            $user = User::create([
                'username' => $g['username'],
                'password' => Hash::make('guru123'),
                'role' => 'guru',
            ]);
            $user->assignRole('guru');
            Guru::create([
                'user_id' => $user->id,
                'nama_lengkap' => $g['nama'],
                'status' => 'aktif',
            ]);
        }

        // ========== SISWA ==========
        $siswaData = [
            ['nis' => '0087773480', 'nama' => 'AHMAD RIZKY RAMADHANI'],
            ['nis' => '0098212457', 'nama' => 'AWEN AGUSTIAN'],
            ['nis' => '0095028590', 'nama' => 'AZRIL AIDI ALJABAR'],
            ['nis' => '0087848511', 'nama' => 'DAMAR ARIYADI'],
            ['nis' => '0091962873', 'nama' => 'DEWI SEKARARUM'],
            ['nis' => '0094844779', 'nama' => 'FAJAR ABRORI NAJWAN'],
            ['nis' => '3098505263', 'nama' => 'JAUHAROTUDDIYANA PUTRI'],
            ['nis' => '0085701048', 'nama' => 'KHUSNUL FAJAR PRASETYO'],
            ['nis' => '0098810639', 'nama' => 'M. JAVA CENDIKIA'],
            ['nis' => '0099844836', 'nama' => 'MELA INDRIYANI'],
            ['nis' => '0099612948', 'nama' => 'MUHAMMAD NAZARUDDIN AL FARIZY'],
            ['nis' => '0082099503', 'nama' => 'NADYA PUTRI ARIFATUL KHOLIFAH'],
            ['nis' => '3096612121', 'nama' => 'NAYA NIKHLATUSSALMA'],
            ['nis' => '0084395240', 'nama' => 'RASYA MAULANA FAISAL'],
            ['nis' => '0083071893', 'nama' => 'SHABRINA HUSNIA ROFIUN NIDA'],
            ['nis' => '0098748543', 'nama' => 'RAYYAN BASSAM KAMAL'],
            ['nis' => '0098404144', 'nama' => 'ZILFIA SALMA SALSABILA'],
            ['nis' => '0107084764', 'nama' => 'SALWA UNZILA RISTIKA'],
            ['nis' => '0102604894', 'nama' => 'MELVIN CLAUDIA FEBRIANI'],
            ['nis' => '0102736511', 'nama' => 'MUHAMAD ALFA ASSIDIKI'],
            ['nis' => '0101042293', 'nama' => 'LINTANG AN NUR RIZA'],
            ['nis' => '3101939332', 'nama' => 'KAYYIS MUHAMMAD ATHOILLAH'],
            ['nis' => '3100877242', 'nama' => 'ALVINO FERDIANSYAH'],
            ['nis' => '3091503124', 'nama' => 'ZHAFIF AZIGHA'],
            ['nis' => '0109036108', 'nama' => 'JUANITA PRATIWI'],
            ['nis' => '0091741558', 'nama' => 'MUHAMMAD ILHAM SALAM WAHYU'],
            ['nis' => '0093722236', 'nama' => 'RIZKY MAHESA PUTRA'],
            ['nis' => '3099760443', 'nama' => 'NUR ROHMAT SYARIFUDIN'],
            ['nis' => '0091422856', 'nama' => 'FAJRIYAH RIZQI AMALIA'],
            ['nis' => '0101574549', 'nama' => 'NADHIF EZAR PRATAMA'],
            ['nis' => '0104900278', 'nama' => 'AYU RIZKI PURWANTI'],
            ['nis' => '0112268636', 'nama' => 'KRISNA WIJAYA'],
            ['nis' => '0118383817', 'nama' => 'AURORA CLARISA PUTRI'],
            ['nis' => '0106856176', 'nama' => 'DYAN AGUSTINA'],
            ['nis' => '0102963943', 'nama' => 'ROYHATUN NIKMAH DWI N'],
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
                'status' => 'aktif',
            ]);
        }
    }
}
