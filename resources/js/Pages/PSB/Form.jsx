import { useState, useEffect, useRef } from "react";
import { useForm, usePage } from "@inertiajs/react";
import {
    getProvinsi,
    getKabupaten,
    getKecamatan,
    getDesa,
} from "@/Services/Wilayah";

export default function Form() {
    const { rekening, nomorAdmin } = usePage().props;
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const [copied, setCopied] = useState(null); // State untuk feedback copy

    const prodiList = [
        "S1 Kedokteran",
        "S1 Bimbingan dan Penyuluhan Islam",
        "S1 Komunikasi dan Penyiaran Islam",
        "S1 Manajemen Dakwah",
        "S1 Pengembangan Masyarakat Islam",
        "S1 Manajemen Haji dan Umrah",
        "S1 Hukum Keluarga Islam",
        "S1 Hukum Pidana Islam",
        "S1 Hukum Ekonomi Syariah",
        "S1 Ilmu Falak",
        "S1 Ilmu Hukum",
        "S1 Pendidikan Agama Islam",
        "S1 Pendidikan Bahasa Arab",
        "S1 Manajemen Pendidikan Islam",
        "S1 Pendidikan Bahasa Inggris",
        "S1 Pendidikan Guru Madrasah Ibtidaiyah",
        "S1 Pendidikan Islam Anak Usia Dini",
        "S1 Aqidah dan Filsafat Islam",
        "S1 Ilmu Al-Qur'an dan Tafsir",
        "S1 Studi Agama-Agama",
        "S1 Tasawuf dan Psikoterapi",
        "S1 Ilmu Seni dan Arsitektur Islam",
        "S1 Ilmu Hadis",
        "S1 Ekonomi Syariah",
        "S1 Perbankan Syariah",
        "S1 Akuntansi Syariah",
        "S1 Manajemen",
        "S1 Bisnis Digital",
        "S1 Ilmu Politik",
        "S1 Sosiologi",
        "S1 Psikologi",
        "S1 Gizi",
        "S1 Biologi",
        "S1 Fisika",
        "S1 Kimia",
        "S1 Matematika",
        "S1 Pendidikan Matematika",
        "S1 Pendidikan Fisika",
        "S1 Pendidikan Kimia",
        "S1 Pendidikan Biologi",
        "S1 Teknologi Informasi",
        "S1 Teknik Lingkungan",
        "S2 Komunikasi dan Penyiaran Islam",
        "S2 Ilmu Falak",
        "S2 Hukum",
        "S2 Pendidikan Agama Islam",
        "S2 Manajemen Pendidikan Islam",
        "S2 Pendidikan Bahasa Arab",
        "S2 Ilmu Al-Qur'an dan Tafsir",
        "S2 Ekonomi Syariah",
        "S2 Ilmu Agama Islam",
        "S3 Pendidikan Agama Islam",
        "S3 Studi Islam",
    ];

    const [sukses, setSukses] = useState(false);
    const [suksesId, setSuksesId] = useState(null);

    const [provinsiList, setProvinsiList] = useState([]);
    const [kabupatenList, setKabupatenList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [desaList, setDesaList] = useState([]);

    const { data, setData, post, processing, reset, errors } = useForm({
        nik: "",
        nisn: "",
        nama_lengkap: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jenis_kelamin: "",
        alamat: "",
        desa: "",
        kecamatan: "",
        kabupaten: "",
        provinsi: "",
        program_studi: "",
        angkatan: "",
        kamar: "",
        nomor_hp: "",
        nama_ayah: "",
        nik_ayah: "",
        pekerjaan_ayah: "",
        nama_ibu: "",
        nik_ibu: "",
        pekerjaan_ibu: "",
        no_hp_orang_tua: "",
        bukti_pembayaran: null,
    });

    useEffect(() => {
        getProvinsi()
            .then(setProvinsiList)
            .catch(() => {});
    }, []);

    const handleProvinsiChange = (nama) => {
        setData("provinsi", nama);
        const prov = provinsiList.find((p) => p.name === nama);
        if (prov) {
            getKabupaten(prov.id).then((res) => {
                setKabupatenList(res);
                setKecamatanList([]);
                setDesaList([]);
                setData((prev) => ({
                    ...prev,
                    kabupaten: "",
                    kecamatan: "",
                    desa: "",
                }));
            });
        }
    };

    const handleKabupatenChange = (nama) => {
        setData("kabupaten", nama);
        const kab = kabupatenList.find((k) => k.name === nama);
        if (kab) {
            getKecamatan(kab.id).then((res) => {
                setKecamatanList(res);
                setDesaList([]);
                setData((prev) => ({ ...prev, kecamatan: "", desa: "" }));
            });
        }
    };

    const handleKecamatanChange = (nama) => {
        setData("kecamatan", nama);
        const kec = kecamatanList.find((k) => k.name === nama);
        if (kec) {
            getDesa(kec.id).then(setDesaList);
        }
    };

    const salin = (teks, jenis) => {
        navigator.clipboard.writeText(teks).then(() => {
            setCopied(jenis);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran (maks 2MB)
            if (file.size > 2048 * 1024) {
                alert("Ukuran file maksimal 2MB");
                e.target.value = "";
                setFileName("");
                setData("bukti_pembayaran", null);
                return;
            }

            // Validasi tipe file
            if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
                alert("Format harus JPG atau PNG");
                e.target.value = "";
                setFileName("");
                setData("bukti_pembayaran", null);
                return;
            }

            setFileName(file.name);
            setData("bukti_pembayaran", file);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Validasi bukti wajib
        if (!data.bukti_pembayaran) {
            alert("Upload bukti pembayaran dulu!");
            return;
        }

        post("/psb", {
            forceFormData: true,
            onSuccess: (response) => {
                const id = response?.props?.flash?.psb_id || null;
                setSuksesId(id);
                reset();
                setFileName("");
                setSukses(true);
            },
            onError: (errs) => {
                const errMessages = Object.values(errs || {});
                if (errMessages.length > 0) {
                    alert("Gagal mendaftar:\n• " + errMessages.join("\n• "));
                } else {
                    alert("Gagal mendaftar. Periksa kembali data Anda.");
                }
            },
        });
    };

    if (sukses) {
        return (
            <div className="min-h-screen bg-[#EEF8FD] flex items-center justify-center p-4">
                <div className="bg-white rounded-[30px] shadow-2xl p-8 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-check text-3xl text-emerald-500"></i>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">
                        Pendaftaran Berhasil!
                    </h2>
                    {suksesId && (
                        <p className="text-sm text-slate-500 mb-1">
                            No. Pendaftaran: <strong>{suksesId}</strong>
                        </p>
                    )}
                    <p className="text-xs text-slate-400 mb-6">
                        Data kamu sudah terkirim. Silakan tunggu verifikasi dari
                        admin pondok.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSukses(false)}
                            className="flex-1 border border-slate-200 py-3 rounded-2xl text-sm"
                        >
                            Daftar Lagi
                        </button>
                        {suksesId && (
                            <a
                                href={`/psb/cetak/${suksesId}`}
                                className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold text-center"
                            >
                                Cetak Bukti
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EEF8FD] py-6 px-4">
            <div className="bg-white rounded-[30px] shadow-2xl p-6 md:p-10 max-w-md md:max-w-3xl mx-auto">
                <div className="text-center mb-6">
                    <img
                        src="/images/logo-alamanah.png"
                        alt="Logo"
                        className="h-16 md:h-20 mx-auto mb-2"
                    />
                    <h1 className="text-lg md:text-2xl font-bold text-slate-800">
                        PSB Al-Amanah
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400">
                        Form Pendaftaran Santri Baru
                    </p>
                    <a
                        href="/psb/cek"
                        className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-6 py-2.5 rounded-2xl text-xs md:text-sm font-semibold shadow-lg inline-block mt-3"
                    >
                        Cek Status Pendaftaran
                    </a>
                </div>

                <form onSubmit={submit} className="space-y-2.5">
                    <p className="text-[11px] md:text-sm font-semibold text-slate-500">
                        Data Diri
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <input
                            type="text"
                            placeholder="NIK *"
                            value={data.nik}
                            onChange={(e) => setData("nik", e.target.value)}
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                            required
                        />
                        <input
                            type="text"
                            placeholder="NISN"
                            value={data.nisn}
                            onChange={(e) => setData("nisn", e.target.value)}
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Nama Lengkap *"
                            value={data.nama_lengkap}
                            onChange={(e) =>
                                setData("nama_lengkap", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none md:col-span-2"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Tempat Lahir"
                            value={data.tempat_lahir}
                            onChange={(e) =>
                                setData("tempat_lahir", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="date"
                            value={data.tanggal_lahir}
                            onChange={(e) =>
                                setData("tanggal_lahir", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <select
                            value={data.jenis_kelamin}
                            onChange={(e) =>
                                setData("jenis_kelamin", e.target.value)
                            }
                            required
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none md:col-span-2"
                        >
                            <option value="">Pilih Jenis Kelamin *</option>
                            <option value="laki-laki">Laki-laki</option>
                            <option value="perempuan">Perempuan</option>
                        </select>
                    </div>

                    <p className="text-[11px] md:text-sm font-semibold text-slate-500 mt-2">
                        Alamat
                    </p>
                    <input
                        type="text"
                        placeholder="Alamat"
                        value={data.alamat}
                        onChange={(e) => setData("alamat", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {/* Provinsi */}
                        <select
                            value={data.provinsi}
                            onChange={(e) =>
                                handleProvinsiChange(e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none capitalize"
                        >
                            <option value="">Provinsi</option>
                            {provinsiList.map((p) => (
                                <option key={p.id} value={p.name}>
                                    {p.name}
                                </option>
                            ))}
                        </select>

                        {/* Kabupaten */}
                        <select
                            value={data.kabupaten}
                            onChange={(e) =>
                                handleKabupatenChange(e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none capitalize"
                            disabled={!data.provinsi}
                        >
                            <option value="">Kabupaten</option>
                            {kabupatenList.map((k) => (
                                <option key={k.id} value={k.name}>
                                    {k.name}
                                </option>
                            ))}
                        </select>

                        {/* Kecamatan */}
                        <select
                            value={data.kecamatan}
                            onChange={(e) =>
                                handleKecamatanChange(e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none capitalize"
                            disabled={!data.kabupaten}
                        >
                            <option value="">Kecamatan</option>
                            {kecamatanList.map((k) => (
                                <option key={k.id} value={k.name}>
                                    {k.name}
                                </option>
                            ))}
                        </select>

                        {/* Desa */}
                        <select
                            value={data.desa}
                            onChange={(e) => setData("desa", e.target.value)}
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none capitalize"
                            disabled={!data.kecamatan}
                        >
                            <option value="">Desa</option>
                            {desaList.map((d) => (
                                <option key={d.id} value={d.name}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p className="text-[11px] md:text-sm font-semibold text-slate-500 mt-2">
                        Pendidikan
                    </p>
                    <select
                        value={data.program_studi}
                        onChange={(e) =>
                            setData("program_studi", e.target.value)
                        }
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                        required
                    >
                        <option value="">Pilih Program Studi *</option>
                        {prodiList.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Angkatan (contoh: 2024)"
                        value={data.angkatan}
                        onChange={(e) => setData("angkatan", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />

                    <p className="text-[11px] md:text-sm font-semibold text-slate-500 mt-2">
                        Kontak
                    </p>
                    <input
                        type="text"
                        placeholder="Nomor HP *"
                        value={data.nomor_hp}
                        onChange={(e) => setData("nomor_hp", e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        required
                    />

                    <p className="text-[11px] md:text-sm font-semibold text-slate-500 mt-2">
                        Data Orang Tua
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <input
                            type="text"
                            placeholder="Nama Ayah"
                            value={data.nama_ayah}
                            onChange={(e) =>
                                setData("nama_ayah", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="NIK Ayah"
                            value={data.nik_ayah}
                            onChange={(e) =>
                                setData("nik_ayah", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Pekerjaan Ayah"
                            value={data.pekerjaan_ayah}
                            onChange={(e) =>
                                setData("pekerjaan_ayah", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Nama Ibu"
                            value={data.nama_ibu}
                            onChange={(e) =>
                                setData("nama_ibu", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="NIK Ibu"
                            value={data.nik_ibu}
                            onChange={(e) => setData("nik_ibu", e.target.value)}
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Pekerjaan Ibu"
                            value={data.pekerjaan_ibu}
                            onChange={(e) =>
                                setData("pekerjaan_ibu", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="No HP Orang Tua"
                            value={data.no_hp_orang_tua}
                            onChange={(e) =>
                                setData("no_hp_orang_tua", e.target.value)
                            }
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none md:col-span-2"
                        />
                    </div>

                    {/* Section Pembayaran */}
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200">
                        <p className="text-[11px] md:text-sm font-semibold text-slate-500 mb-2">
                            Pembayaran Pendaftaran
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {/* Nominal Pendaftaran */}
                            <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400">
                                        Biaya Pendaftaran
                                    </span>
                                    <span className="font-bold text-slate-700 font-mono text-sm md:text-base">
                                        Rp 100.000
                                    </span>
                                </div>
                            </div>

                            {rekening && (
                                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3">
                                    <Row label="Bank" value={rekening.bank} />
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-400">
                                            No. Rekening
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-600">
                                                {rekening.nomor_rekening}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    salin(
                                                        rekening.nomor_rekening,
                                                        "rekening",
                                                    )
                                                }
                                                className={`transition ${
                                                    copied === "rekening"
                                                        ? "text-emerald-500"
                                                        : "text-slate-400 hover:text-[#3D7ABA]"
                                                }`}
                                            >
                                                {copied === "rekening" ? (
                                                    <span className="text-[10px] font-semibold">
                                                        Tersalin!
                                                    </span>
                                                ) : (
                                                    <i className="fa-solid fa-copy text-xs"></i>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <Row
                                        label="Atas Nama"
                                        value={rekening.atas_nama}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3 mb-3 mt-2">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400 shrink-0">
                                    No. WhatsApp Admin
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-600">
                                        {nomorAdmin}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            salin(nomorAdmin, "whatsapp")
                                        }
                                        className={`transition ${
                                            copied === "whatsapp"
                                                ? "text-emerald-500"
                                                : "text-slate-400 hover:text-[#3D7ABA]"
                                        }`}
                                    >
                                        {copied === "whatsapp" ? (
                                            <span className="text-[10px] font-semibold">
                                                Tersalin!
                                            </span>
                                        ) : (
                                            <i className="fa-solid fa-copy text-xs"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Upload Bukti Pembayaran */}
                        <label className="flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 md:p-6 cursor-pointer hover:border-[#20B5E8] transition mb-2">
                            {fileName ? (
                                <span className="text-xs text-emerald-600 font-medium">
                                    📄 {fileName}
                                </span>
                            ) : (
                                <>
                                    <span className="flex flex-col items-center gap-1">
                                        <i className="fa-solid fa-cloud-upload text-slate-400 text-lg md:text-2xl"></i>
                                        <span className="text-xs md:text-sm text-slate-500">
                                            Upload Bukti Pembayaran
                                        </span>
                                        <span className="text-[10px] md:text-xs text-slate-400">
                                            JPG/PNG, maks 2MB *
                                        </span>
                                    </span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                ref={fileRef}
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 md:py-4 rounded-2xl text-sm md:text-base font-semibold shadow-lg transition disabled:opacity-50 mt-3"
                    >
                        {processing ? "Mengirim..." : "Daftar Sekarang"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const Row = ({ label, value }) => (
    <div className="flex justify-between text-[11px]">
        <span className="text-slate-400 shrink-0">{label}</span>
        <span className="font-medium text-slate-600 text-right ml-4">
            {value || "-"}
        </span>
    </div>
);
