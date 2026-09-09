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
    const { auth } = usePage().props;
    const user = auth.user;
    const profil = user.guru || user.siswa;
    const [showModal, setShowModal] = useState(false);

    const [provinsiList, setProvinsiList] = useState([]);
    const [kabupatenList, setKabupatenList] = useState([]);
    const [kecamatanList, setKecamatanList] = useState([]);
    const [desaList, setDesaList] = useState([]);

    const prodiList = [
        "Rekayasa Perangkat Lunak",
        "Teknik Komputer dan Jaringan",
    ];

    const initialData = () => {
        if (user.role === "guru") {
            return {
                nama_lengkap: profil?.nama_lengkap || "",
                nik: profil?.nik || "",
                tempat_lahir: profil?.tempat_lahir || "",
                tanggal_lahir: profil?.tanggal_lahir || "",
                jenis_kelamin: profil?.jenis_kelamin || "",
                pendidikan_terakhir: profil?.pendidikan_terakhir || "",
                alamat: profil?.alamat || "",
                nomor_hp: profil?.nomor_hp || "",
                password: "",
            };
        }
        if (user.role === "siswa") {
            return {
                nama_lengkap: profil?.nama_lengkap || "",
                nik: profil?.nik || "",
                tempat_lahir: profil?.tempat_lahir || "",
                tanggal_lahir: profil?.tanggal_lahir || "",
                jenis_kelamin: profil?.jenis_kelamin || "",
                alamat: profil?.alamat || "",
                desa: profil?.desa || "",
                kecamatan: profil?.kecamatan || "",
                kabupaten: profil?.kabupaten || "",
                provinsi: profil?.provinsi || "",
                program_studi: profil?.program_studi || "",
                kelas: profil?.kelas || "",
                angkatan: profil?.angkatan || "",
                nomor_hp: profil?.nomor_hp || "",
                nama_ayah: profil?.nama_ayah || "",
                nik_ayah: profil?.nik_ayah || "",
                pekerjaan_ayah: profil?.pekerjaan_ayah || "",
                nama_ibu: profil?.nama_ibu || "",
                nik_ibu: profil?.nik_ibu || "",
                pekerjaan_ibu: profil?.pekerjaan_ibu || "",
                no_hp_orang_tua: profil?.no_hp_orang_tua || "",
                password: "",
            };
        }
        return { nama_lengkap: "", password: "" };
    };

    const { data, setData, put, processing } = useForm(initialData());
    const passwordForm = useForm({ username: "", password_baru: "" });

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

    const formatTgl = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleLogout = () => {
        router.post("/logout");
    };

    const submit = (e) => {
        e.preventDefault();
        put("/profil", {
            onSuccess: () => {
                setShowModal(false);
                toast.success("Profil berhasil diupdate!");
            },
            onError: () => toast.error("Gagal mengupdate profil."),
        });
    };

    const handleGantiPassword = (e) => {
        e.preventDefault();
        passwordForm.post("/profil/ganti-password", {
            onSuccess: () => {
                passwordForm.reset();
                toast.success("Password berhasil diubah!");
            },
            onError: () => toast.error("Gagal mengubah password."),
        });
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Kolom 1: Card Profil */}
                    <div className="rounded-[30px] bg-gradient-to-br from-[#009788] to-[#00b5a5] p-6 shadow-2xl text-white text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mb-3 border-2 border-white/30 mx-auto">
                            {profil?.nama_lengkap?.charAt(0) || "A"}
                        </div>
                        <h3 className="font-bold text-lg">
                            {profil?.nama_lengkap || "Admin Sekolah"}
                        </h3>
                        <p className="text-white/80 text-sm capitalize mt-1">
                            {user.role === "guru"
                                ? "Guru"
                                : user.role === "siswa"
                                  ? "Siswa"
                                  : user.role}
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                            {user.username}
                        </p>
                    </div>

                    {/* Kolom 2: Informasi Profil / Ganti Password */}
                    {(user.role === "guru" || user.role === "siswa") && (
                        <div className="rounded-[30px] border border-teal-100 bg-white p-5 shadow-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                                    Informasi Profil
                                </h3>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg"
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                                {user.role === "guru" && (
                                    <>
                                        <Row label="NIK" value={profil?.nik} />
                                        <Row
                                            label="Nama"
                                            value={profil?.nama_lengkap}
                                        />
                                        <Row
                                            label="Tempat, Tgl Lahir"
                                            value={`${profil?.tempat_lahir || "-"}, ${formatTgl(profil?.tanggal_lahir)}`}
                                        />
                                        <Row
                                            label="Jenis Kelamin"
                                            value={
                                                profil?.jenis_kelamin ===
                                                "laki-laki"
                                                    ? "Laki-laki"
                                                    : profil?.jenis_kelamin ===
                                                        "perempuan"
                                                      ? "Perempuan"
                                                      : "-"
                                            }
                                        />
                                        <Row
                                            label="Pendidikan"
                                            value={profil?.pendidikan_terakhir}
                                        />
                                        <Row
                                            label="Alamat"
                                            value={profil?.alamat}
                                        />
                                        <Row
                                            label="Nomor HP"
                                            value={profil?.nomor_hp}
                                        />
                                    </>
                                )}
                                {user.role === "siswa" && (
                                    <>
                                        <Row label="NIS" value={profil?.nis} />
                                        <Row
                                            label="Kelas"
                                            value={profil?.kelas}
                                        />
                                        <Row label="NIK" value={profil?.nik} />
                                        <Row
                                            label="Nama"
                                            value={profil?.nama_lengkap}
                                        />
                                        <Row
                                            label="Tempat, Tgl Lahir"
                                            value={`${profil?.tempat_lahir || "-"}, ${formatTgl(profil?.tanggal_lahir)}`}
                                        />
                                        <Row
                                            label="Jenis Kelamin"
                                            value={
                                                profil?.jenis_kelamin ===
                                                "laki-laki"
                                                    ? "Laki-laki"
                                                    : profil?.jenis_kelamin ===
                                                        "perempuan"
                                                      ? "Perempuan"
                                                      : "-"
                                            }
                                        />
                                        <Row
                                            label="Jurusan"
                                            value={profil?.program_studi}
                                        />
                                        <Row
                                            label="Angkatan"
                                            value={profil?.angkatan}
                                        />
                                        <Row
                                            label="Nomor HP"
                                            value={profil?.nomor_hp}
                                        />
                                        <hr className="border-slate-100 my-2" />
                                        <p className="font-semibold text-slate-600">
                                            Orang Tua
                                        </p>
                                        <Row
                                            label="Nama Ayah"
                                            value={profil?.nama_ayah}
                                        />
                                        <Row
                                            label="Nama Ibu"
                                            value={profil?.nama_ibu}
                                        />
                                        <Row
                                            label="No HP Ortu"
                                            value={profil?.no_hp_orang_tua}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {user.role === "admin" && (
                        <div className="rounded-[30px] border border-teal-100 bg-white p-5 shadow-2xl">
                            <h3 className="font-semibold text-sm text-slate-700 mb-3">
                                Ganti Password User
                            </h3>
                            <form
                                onSubmit={handleGantiPassword}
                                className="space-y-2.5"
                            >
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={passwordForm.data.username}
                                    onChange={(e) =>
                                        passwordForm.setData(
                                            "username",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password Baru"
                                    value={passwordForm.data.password_baru}
                                    onChange={(e) =>
                                        passwordForm.setData(
                                            "password_baru",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="w-full bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white py-2 rounded-xl text-sm font-semibold shadow-lg disabled:opacity-50"
                                >
                                    Simpan
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Kolom 3: Logout */}
                    <div className="space-y-4">
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 text-white py-3 rounded-2xl text-sm font-semibold shadow-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-black/50"
                                onClick={() => setShowModal(false)}
                            ></div>
                            <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-teal-100 my-4">
                                <h3 className="font-semibold text-lg mb-4">
                                    Edit Profil
                                </h3>
                                <form
                                    onSubmit={submit}
                                    className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1"
                                >
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
                                    {user.role === "guru" && (
                                        <>
                                            <input
                                                type="text"
                                                placeholder="NIK"
                                                value={data.nik}
                                                onChange={(e) =>
                                                    setData(
                                                        "nik",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
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
                                            </div>
                                            <select
                                                value={data.jenis_kelamin}
                                                onChange={(e) =>
                                                    setData(
                                                        "jenis_kelamin",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                            >
                                                <option value="">
                                                    Pilih Jenis Kelamin
                                                </option>
                                                <option value="laki-laki">
                                                    Laki-laki
                                                </option>
                                                <option value="perempuan">
                                                    Perempuan
                                                </option>
                                            </select>
                                            <select
                                                value={data.pendidikan_terakhir}
                                                onChange={(e) =>
                                                    setData(
                                                        "pendidikan_terakhir",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                            >
                                                <option value="">
                                                    Pendidikan Terakhir
                                                </option>
                                                <option value="SMA/Sederajat">
                                                    SMA/Sederajat
                                                </option>
                                                <option value="D1">D1</option>
                                                <option value="D2">D2</option>
                                                <option value="D3">D3</option>
                                                <option value="S1">S1</option>
                                                <option value="S2">S2</option>
                                                <option value="S3">S3</option>
                                            </select>
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
                                        </>
                                    )}
                                    {user.role === "siswa" && (
                                        <>
                                            <input
                                                type="text"
                                                placeholder="NIK"
                                                value={data.nik}
                                                onChange={(e) =>
                                                    setData(
                                                        "nik",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
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
                                            </div>
                                            <select
                                                value={data.jenis_kelamin}
                                                onChange={(e) =>
                                                    setData(
                                                        "jenis_kelamin",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                            >
                                                <option value="">
                                                    Pilih Jenis Kelamin
                                                </option>
                                                <option value="laki-laki">
                                                    Laki-laki
                                                </option>
                                                <option value="perempuan">
                                                    Perempuan
                                                </option>
                                            </select>
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
                                                <option value="">
                                                    Provinsi
                                                </option>
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
                                                <option value="">
                                                    Kabupaten
                                                </option>
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
                                                <option value="">
                                                    Kecamatan
                                                </option>
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
                                                    setData(
                                                        "desa",
                                                        e.target.value,
                                                    )
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
                                                    Pilih Jurusan
                                                </option>
                                                {prodiList.map((p) => (
                                                    <option key={p} value={p}>
                                                        {p}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Kelas"
                                                value={data.kelas}
                                                onChange={(e) =>
                                                    setData(
                                                        "kelas",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                            />
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
                                            <hr className="border-slate-100" />
                                            <p className="text-xs font-semibold text-slate-500">
                                                Data Orang Tua
                                            </p>
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
                                            <div className="grid grid-cols-2 gap-2">
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
                                            </div>
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
                                            <div className="grid grid-cols-2 gap-2">
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
                                            </div>
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
                                        </>
                                    )}
                                    <input
                                        type="password"
                                        placeholder="Password Baru (opsional)"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    />
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                        >
                                            Simpan
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
