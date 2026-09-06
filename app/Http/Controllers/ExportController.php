<?php

namespace App\Http\Controllers;

use App\Models\Santri;
use Illuminate\Http\Request;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class ExportController extends Controller
{
    public function santri()
    {
        $santris = Santri::select(
            'nis',
            'nisn',
            'nik',
            'nama_lengkap',
            'tempat_lahir',
            'tanggal_lahir',
            'jenis_kelamin',
            'alamat',
            'desa',
            'kecamatan',
            'kabupaten',
            'provinsi',
            'program_studi',
            'angkatan',
            'tahun_masuk',
            'kamar',
            'nomor_hp',
            'status',
            'nama_ayah',
            'nik_ayah',
            'pekerjaan_ayah',
            'nama_ibu',
            'nik_ibu',
            'pekerjaan_ibu',
            'no_hp_orang_tua'
        )->get();

        $fileName = 'data-santri.xlsx';
        $filePath = storage_path('app/' . $fileName);

        $writer = new Writer();
        $writer->openToFile($filePath);

        // Header
        $headerRow = Row::fromValues([
            'NIS',
            'NISN',
            'NIK',
            'Nama Lengkap',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Jenis Kelamin',
            'Alamat',
            'Desa',
            'Kecamatan',
            'Kabupaten',
            'Provinsi',
            'Program Studi',
            'Angkatan',
            'Tahun Masuk',
            'Kamar',
            'Nomor HP',
            'Status',
            'Nama Ayah',
            'NIK Ayah',
            'Pekerjaan Ayah',
            'Nama Ibu',
            'NIK Ibu',
            'Pekerjaan Ibu',
            'No HP Orang Tua',
        ]);
        $writer->addRow($headerRow);

        // Data
        foreach ($santris as $s) {
            $row = Row::fromValues($s->toArray());
            $writer->addRow($row);
        }

        $writer->close();

        return response()->download($filePath)->deleteFileAfterSend();
    }
    public function ustadz()
    {
        $ustadzs = \App\Models\Ustadz::select(
            'niu',
            'nip_nuptk',
            'nik',
            'nama_lengkap',
            'tempat_lahir',
            'tanggal_lahir',
            'jenis_kelamin',
            'alamat',
            'pendidikan_terakhir',
            'status',
            'status_kepegawaian',
            'tanggal_mulai_tugas',
            'nomor_hp'
        )->get();

        $fileName = 'data-ustadz.xlsx';
        $filePath = storage_path('app/' . $fileName);

        $writer = new Writer();
        $writer->openToFile($filePath);

        $headerRow = Row::fromValues([
            'NIU',
            'NIP/NUPTK',
            'NIK',
            'Nama Lengkap',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Jenis Kelamin',
            'Alamat',
            'Pendidikan Terakhir',
            'Status',
            'Status Kepegawaian',
            'Tanggal Mulai Tugas',
            'Nomor HP',
        ]);
        $writer->addRow($headerRow);

        foreach ($ustadzs as $u) {
            $row = Row::fromValues($u->toArray());
            $writer->addRow($row);
        }

        $writer->close();

        return response()->download($filePath)->deleteFileAfterSend();
    }
}
