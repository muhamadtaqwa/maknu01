import { usePage } from "@inertiajs/react";

export default function Cetak() {
    const { data } = usePage().props;

    const formatTgl = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const statusLabel = (s) => {
        if (s === "menunggu") return "Menunggu Verifikasi";
        if (s === "diterima") return "Diterima";
        return "Ditolak";
    };

    const statusColor = (s) => {
        if (s === "menunggu") return "text-amber-600";
        if (s === "diterima") return "text-emerald-600";
        return "text-red-500";
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center print:bg-white print:block">
            <div className="bg-white p-8 max-w-[210mm] mx-auto shadow-lg print:shadow-none print:p-0 print:max-w-full print:w-full">
                {/* KOP SURAT */}
                <div className="border-b-4 border-slate-800 pb-4 mb-6 text-center">
                    <img
                        src="/images/logo-alamanah.png"
                        alt="Logo"
                        className="h-24 mx-auto mb-3 print:h-20"
                    />
                    <h2 className="text-base font-bold text-slate-700 uppercase tracking-wide">
                        Formulir Pendaftaran Santri Baru
                    </h2>
                    <h1 className="text-xl font-bold text-slate-800 uppercase mt-1.5 print:text-lg">
                        Pondok Pesantren Al-Amanah
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Tahun Ajaran 2026/2027
                    </p>
                </div>

                {/* NO. PENDAFTARAN & STATUS */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-[10px] text-slate-400">
                            No. Pendaftaran
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                            {data.id}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400">Status</p>
                        <p
                            className={`text-sm font-bold ${statusColor(data.status)}`}
                        >
                            {statusLabel(data.status)}
                        </p>
                    </div>
                </div>

                {/* DATA DIRI */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-300 pb-1 mb-3">
                        A. Data Diri
                    </h3>
                    <div className="space-y-2 text-sm print:text-xs">
                        <Row label="NIK" value={data.nik} />
                        <Row label="NISN" value={data.nisn} />
                        <Row label="Nama Lengkap" value={data.nama_lengkap} />
                        <Row
                            label="Tempat, Tanggal Lahir"
                            value={`${data.tempat_lahir || "-"}, ${formatTgl(data.tanggal_lahir)}`}
                        />
                        <Row
                            label="Jenis Kelamin"
                            value={
                                data.jenis_kelamin === "laki-laki"
                                    ? "Laki-laki"
                                    : data.jenis_kelamin === "perempuan"
                                      ? "Perempuan"
                                      : "-"
                            }
                        />
                        <Row label="Nomor HP" value={data.nomor_hp} />
                    </div>
                </div>

                {/* ALAMAT */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-300 pb-1 mb-3">
                        B. Alamat
                    </h3>
                    <div className="space-y-2 text-sm print:text-xs">
                        <Row label="Alamat" value={data.alamat} />
                        <Row label="Desa/Kelurahan" value={data.desa} />
                        <Row label="Kecamatan" value={data.kecamatan} />
                        <Row label="Kabupaten" value={data.kabupaten} />
                        <Row label="Provinsi" value={data.provinsi} />
                    </div>
                </div>

                {/* PENDIDIKAN */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-300 pb-1 mb-3">
                        C. Pendidikan
                    </h3>
                    <div className="space-y-2 text-sm print:text-xs">
                        <Row label="Program Studi" value={data.program_studi} />
                        <Row label="Angkatan" value={data.angkatan} />
                    </div>
                </div>

                {/* ORANG TUA */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-300 pb-1 mb-3">
                        D. Data Orang Tua
                    </h3>
                    <div className="space-y-2 text-sm print:text-xs">
                        <Row label="Nama Ayah" value={data.nama_ayah} />
                        <Row label="NIK Ayah" value={data.nik_ayah} />
                        <Row
                            label="Pekerjaan Ayah"
                            value={data.pekerjaan_ayah}
                        />
                        <Row label="Nama Ibu" value={data.nama_ibu} />
                        <Row label="NIK Ibu" value={data.nik_ibu} />
                        <Row label="Pekerjaan Ibu" value={data.pekerjaan_ibu} />
                        <Row
                            label="No HP Orang Tua"
                            value={data.no_hp_orang_tua}
                        />
                    </div>
                </div>

                {/* PEMBAYARAN */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-300 pb-1 mb-3">
                        E. Pembayaran
                    </h3>
                    <div className="space-y-2 text-sm print:text-xs">
                        <Row
                            label="Status Bukti"
                            value={
                                data.bukti_pembayaran
                                    ? "Sudah Upload"
                                    : "Belum Upload"
                            }
                        />
                        {data.bukti_pembayaran && (
                            <Row
                                label="File"
                                value={data.bukti_pembayaran.split("/").pop()}
                            />
                        )}
                    </div>
                </div>

                {/* TANDA TANGAN & FOTO */}
                <div className="flex justify-between items-end mt-10 pt-4 border-t border-slate-300">
                    {/* Foto */}
                    <div className="text-center">
                        <div className="w-24 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-2 print:w-20 print:h-28">
                            <span className="text-[10px] text-slate-400 text-center">
                                Pas Foto
                                <br />
                                3x4
                            </span>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div></div>

                    {/* Tanggal & TTD Pendaftar */}
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 mb-1">
                            Semarang, {formatTgl(data.created_at)}
                        </p>
                        <p className="text-[10px] text-slate-500 mb-6">
                            Pendaftar,
                        </p>
                        <div className="h-10"></div>
                        <p className="text-[10px] font-medium text-slate-700 border-t border-slate-500 pt-1">
                            {data.nama_lengkap}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-[9px] text-slate-400 print:text-[8px]">
                    <p>
                        Simpan bukti ini untuk mengecek status pendaftaran di
                        psb.al-amanah.id/cek
                    </p>
                    <p className="mt-1">
                        &copy; {new Date().getFullYear()} Pondok Pesantren
                        Al-Amanah
                    </p>
                </div>

                {/* Tombol Cetak */}
                <div className="text-center mt-6 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-lg"
                    >
                        Cetak
                    </button>
                </div>
            </div>
        </div>
    );
}

const Row = ({ label, value }) => (
    <div className="flex justify-between border-b border-dotted border-slate-200 py-1.5">
        <span className="text-slate-500 text-[11px] print:text-[10px]">
            {label}
        </span>
        <span className="font-medium text-slate-700 text-right text-[11px] print:text-[10px]">
            {value || "-"}
        </span>
    </div>
);
