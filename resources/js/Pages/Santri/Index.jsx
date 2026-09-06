import { useState, useEffect } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import {
    getProvinsi,
    getKabupaten,
    getKecamatan,
    getDesa,
} from "@/Services/Wilayah";

export default function Index() {
    const { santris, filters, auth } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState(filters.search || "");

    const [provinsiList, setProvinsiList] = useState([]);
    const [kabupatenList, setKabupatenList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [desaList, setDesaList] = useState([]);

    const salin = (teks) => {
        navigator.clipboard
            .writeText(teks)
            .then(() => {
                toast.success("Tersalin!");
            })
            .catch(() => {
                toast.error("Gagal menyalin.");
            });
    };

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

    const { data, setData, post, put, reset, processing } = useForm({
        jenis_kelamin: "",
        nisn: "",
        nik: "",
        nama_lengkap: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        alamat: "",
        desa: "",
        kecamatan: "",
        kabupaten: "",
        provinsi: "",
        program_studi: "",
        angkatan: "",
        tahun_masuk: "",
        kamar: "",
        nomor_hp: "",
        status: "aktif",
        nama_ayah: "",
        nik_ayah: "",
        pekerjaan_ayah: "",
        nama_ibu: "",
        nik_ibu: "",
        pekerjaan_ibu: "",
        no_hp_orang_tua: "",
        password: "",
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

    const handleSearch = (value) => {
        setSearch(value);
        router.get(
            "/santri",
            { search: value },
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        reset();
        setEditData(null);
        setShowModal(true);
    };
    const openEdit = (santri) => {
        setEditData(santri);
        setData({
            jenis_kelamin: santri.jenis_kelamin || "",
            nisn: santri.nisn || "",
            nik: santri.nik || "",
            nama_lengkap: santri.nama_lengkap,
            tempat_lahir: santri.tempat_lahir || "",
            tanggal_lahir: santri.tanggal_lahir || "",
            alamat: santri.alamat || "",
            desa: santri.desa || "",
            kecamatan: santri.kecamatan || "",
            kabupaten: santri.kabupaten || "",
            provinsi: santri.provinsi || "",
            program_studi: santri.program_studi || "",
            angkatan: santri.angkatan || "",
            tahun_masuk: santri.tahun_masuk || "",
            kamar: santri.kamar || "",
            nomor_hp: santri.nomor_hp || "",
            status: santri.status || "aktif",
            nama_ayah: santri.nama_ayah || "",
            nik_ayah: santri.nik_ayah || "",
            pekerjaan_ayah: santri.pekerjaan_ayah || "",
            nama_ibu: santri.nama_ibu || "",
            nik_ibu: santri.nik_ibu || "",
            pekerjaan_ibu: santri.pekerjaan_ibu || "",
            no_hp_orang_tua: santri.no_hp_orang_tua || "",
            password: "",
        });
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        reset();
    };
    const submit = (e) => {
        e.preventDefault();
        editData
            ? put(`/santri/${editData.id}`, {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Santri berhasil diupdate!");
                  },
                  onError: () => toast.error("Gagal mengupdate santri."),
              })
            : post("/santri", {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Santri berhasil ditambah!");
                  },
                  onError: () => toast.error("Gagal menambah santri."),
              });
    };
    const handleDelete = (id, nama) => {
        if (confirm(`Hapus santri "${nama}"?`)) {
            router.delete(`/santri/${id}`, {
                onSuccess: () => toast.success("Santri berhasil dihapus!"),
                onError: () => toast.error("Gagal menghapus santri."),
            });
        }
    };

    const formatTgl = (tgl) => {
        if (!tgl) return null;
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Data Santri
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition"
                        >
                            + Tambah
                        </button>
                    )}
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama atau NIS..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {santris.data.length === 0 && (
                        <p className="text-center text-slate-400 py-10 sm:col-span-2">
                            Tidak ada data santri
                        </p>
                    )}
                    {santris.data.map((santri) => (
                        <div
                            key={santri.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-[#3D7ABA]/10 text-[#3D7ABA] px-2.5 py-1 rounded-full font-medium">
                                        {santri.nis}
                                    </span>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                            santri.status === "aktif"
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-red-50 text-red-500"
                                        }`}
                                    >
                                        {santri.status
                                            ?.charAt(0)
                                            .toUpperCase() +
                                            santri.status?.slice(1)}
                                    </span>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEdit(santri)}
                                            className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs hover:bg-[#3D7ABA]/10 hover:text-[#3D7ABA] transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    santri.id,
                                                    santri.nama_lengkap,
                                                )
                                            }
                                            className="bg-red-50 text-red-500 px-2.5 py-1 rounded-lg text-xs hover:bg-red-100 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-semibold text-sm truncate mb-2">
                                {santri.nama_lengkap}
                            </h3>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                                {santri.nisn && (
                                    <Row label="NISN" value={santri.nisn} />
                                )}
                                {santri.nik && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">
                                            NIK
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-600">
                                                {santri.nik}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    salin(santri.nik)
                                                }
                                                className="text-slate-400 hover:text-[#3D7ABA]"
                                                aria-label="Salin NIK"
                                            >
                                                <i className="fa-solid fa-copy text-[10px]"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {(santri.tempat_lahir ||
                                    santri.tanggal_lahir) && (
                                    <Row
                                        label="TTL"
                                        value={`${santri.tempat_lahir || "-"}, ${formatTgl(santri.tanggal_lahir) || "-"}`}
                                    />
                                )}
                                {santri.jenis_kelamin && (
                                    <Row
                                        label="JK"
                                        value={
                                            santri.jenis_kelamin === "laki-laki"
                                                ? "Laki-laki"
                                                : "Perempuan"
                                        }
                                    />
                                )}
                                {santri.program_studi && (
                                    <Row
                                        label="Prodi"
                                        value={santri.program_studi}
                                    />
                                )}
                                {santri.angkatan && (
                                    <Row
                                        label="Angkatan"
                                        value={santri.angkatan}
                                    />
                                )}
                                {santri.tahun_masuk && (
                                    <Row
                                        label="Tahun Masuk"
                                        value={santri.tahun_masuk}
                                    />
                                )}
                                {santri.kamar && (
                                    <Row label="Kamar" value={santri.kamar} />
                                )}
                                {santri.nomor_hp && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">
                                            HP
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-600">
                                                {santri.nomor_hp}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    salin(santri.nomor_hp)
                                                }
                                                className="text-slate-400 hover:text-[#3D7ABA]"
                                                aria-label="Salin nomor HP"
                                            >
                                                <i className="fa-solid fa-copy text-[10px]"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {santris.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() =>
                                router.get(
                                    santris.prev_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            disabled={!santris.prev_page_url}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="text-xs text-slate-400">
                            Halaman {santris.current_page} dari{" "}
                            {santris.last_page}
                        </span>
                        <button
                            onClick={() =>
                                router.get(
                                    santris.next_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            disabled={!santris.next_page_url}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}

                {showModal && isAdmin && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-black/50"
                                onClick={closeModal}
                            ></div>
                            <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm md:max-w-5xl p-6 border border-sky-100 my-4">
                                <h3 className="font-semibold text-lg mb-4">
                                    {editData ? "Edit" : "Tambah"} Santri
                                </h3>
                                <form
                                    onSubmit={submit}
                                    className="space-y-3 max-h-[70vh] md:max-h-[80vh] overflow-y-auto pr-1"
                                >
                                    <div className="md:grid md:grid-rows-9 md:grid-flow-col md:auto-cols-fr md:gap-x-4 md:gap-y-3 space-y-3 md:space-y-0">
                                        {!editData ? (
                                            <select
                                                value={data.jenis_kelamin}
                                                onChange={(e) =>
                                                    setData(
                                                        "jenis_kelamin",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                                required
                                            >
                                                <option value="">
                                                    Putra/Putri *
                                                </option>
                                                <option value="laki-laki">
                                                    Putra (PA)
                                                </option>
                                                <option value="perempuan">
                                                    Putri (PI)
                                                </option>
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={editData.nis}
                                                disabled
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm disabled:bg-slate-50 outline-none"
                                            />
                                        )}
                                        <input
                                            type="text"
                                            placeholder="NISN"
                                            value={data.nisn}
                                            onChange={(e) =>
                                                setData("nisn", e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="NIK"
                                            value={data.nik}
                                            onChange={(e) =>
                                                setData("nik", e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nama Lengkap"
                                            value={data.nama_lengkap}
                                            onChange={(e) =>
                                                setData(
                                                    "nama_lengkap",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Tempat Lahir"
                                            value={data.tempat_lahir}
                                            onChange={(e) =>
                                                setData(
                                                    "tempat_lahir",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="date"
                                            value={data.tanggal_lahir}
                                            onChange={(e) =>
                                                setData(
                                                    "tanggal_lahir",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        {editData && (
                                            <input
                                                type="text"
                                                value={
                                                    editData.jenis_kelamin ===
                                                    "laki-laki"
                                                        ? "Laki-laki"
                                                        : "Perempuan"
                                                }
                                                disabled
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm disabled:bg-slate-50 outline-none"
                                            />
                                        )}
                                        <input
                                            type="text"
                                            placeholder="Alamat"
                                            value={data.alamat}
                                            onChange={(e) =>
                                                setData(
                                                    "alamat",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />

                                        <select
                                            value={data.provinsi}
                                            onChange={(e) =>
                                                handleProvinsiChange(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none capitalize"
                                        >
                                            <option value="">Provinsi</option>
                                            {provinsiList.map((p) => (
                                                <option
                                                    key={p.id}
                                                    value={p.name}
                                                >
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={data.kabupaten}
                                            onChange={(e) =>
                                                handleKabupatenChange(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none capitalize"
                                            disabled={!data.provinsi}
                                        >
                                            <option value="">Kabupaten</option>
                                            {kabupatenList.map((k) => (
                                                <option
                                                    key={k.id}
                                                    value={k.name}
                                                >
                                                    {k.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={data.kecamatan}
                                            onChange={(e) =>
                                                handleKecamatanChange(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none capitalize"
                                            disabled={!data.kabupaten}
                                        >
                                            <option value="">Kecamatan</option>
                                            {kecamatanList.map((k) => (
                                                <option
                                                    key={k.id}
                                                    value={k.name}
                                                >
                                                    {k.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={data.desa}
                                            onChange={(e) =>
                                                setData("desa", e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none capitalize"
                                            disabled={!data.kecamatan}
                                        >
                                            <option value="">Desa</option>
                                            {desaList.map((d) => (
                                                <option
                                                    key={d.id}
                                                    value={d.name}
                                                >
                                                    {d.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={data.program_studi}
                                            onChange={(e) =>
                                                setData(
                                                    "program_studi",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                        >
                                            <option value="">
                                                Program Studi
                                            </option>
                                            {prodiList.map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Angkatan"
                                            value={data.angkatan}
                                            onChange={(e) =>
                                                setData(
                                                    "angkatan",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Tahun Masuk"
                                            value={data.tahun_masuk}
                                            onChange={(e) =>
                                                setData(
                                                    "tahun_masuk",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Kamar"
                                            value={data.kamar}
                                            onChange={(e) =>
                                                setData("kamar", e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nomor HP"
                                            value={data.nomor_hp}
                                            onChange={(e) =>
                                                setData(
                                                    "nomor_hp",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <select
                                            value={data.status}
                                            onChange={(e) =>
                                                setData(
                                                    "status",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="tidak aktif">
                                                Tidak Aktif
                                            </option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Nama Ayah"
                                            value={data.nama_ayah}
                                            onChange={(e) =>
                                                setData(
                                                    "nama_ayah",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="NIK Ayah"
                                            value={data.nik_ayah}
                                            onChange={(e) =>
                                                setData(
                                                    "nik_ayah",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Pekerjaan Ayah"
                                            value={data.pekerjaan_ayah}
                                            onChange={(e) =>
                                                setData(
                                                    "pekerjaan_ayah",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nama Ibu"
                                            value={data.nama_ibu}
                                            onChange={(e) =>
                                                setData(
                                                    "nama_ibu",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="NIK Ibu"
                                            value={data.nik_ibu}
                                            onChange={(e) =>
                                                setData(
                                                    "nik_ibu",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Pekerjaan Ibu"
                                            value={data.pekerjaan_ibu}
                                            onChange={(e) =>
                                                setData(
                                                    "pekerjaan_ibu",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="No HP Orang Tua"
                                            value={data.no_hp_orang_tua}
                                            onChange={(e) =>
                                                setData(
                                                    "no_hp_orang_tua",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        />
                                        {!editData && (
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                                required
                                            />
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm hover:bg-slate-50 transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold shadow-lg transition disabled:opacity-50"
                                        >
                                            {editData ? "Update" : "Simpan"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

const Row = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-600 text-right ml-4">
            {value || "-"}
        </span>
    </div>
);
