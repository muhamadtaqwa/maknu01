import { useState, useEffect, useRef } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { pembayaran, santris, jenisPembayaran, filters, auth } =
        usePage().props;
    const isAdmin = auth.user.role === "admin";

    const [showModal, setShowModal] = useState(false);
    const [showGenerate, setShowGenerate] = useState(false);
    const [showKategori, setShowKategori] = useState(false);
    const [showCicilan, setShowCicilan] = useState(null);
    const [nominalCicilan, setNominalCicilan] = useState("");
    const [cicilanError, setCicilanError] = useState("");
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState(filters.search || "");
    const [verifyingId, setVerifyingId] = useState(null);
    const [cicilanSubmitting, setCicilanSubmitting] = useState(false);
    const [lunasiSubmitting, setLunasiSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deletingKategoriId, setDeletingKategoriId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteKategoriTarget, setDeleteKategoriTarget] = useState(null);
    const [statusFilter, setStatusFilter] = useState(filters.status || "semua");
    const [showBukti, setShowBukti] = useState(null);
    const [verifikasiTarget, setVerifikasiTarget] = useState(null);
    const [nominalVerifikasi, setNominalVerifikasi] = useState("");
    const firstFieldRef = useRef(null);

    const { data, setData, reset, processing, errors, clearErrors } = useForm({
        nis: "",
        jenis: jenisPembayaran[0]?.nama || "SPP",
        nama_pembayaran: "",
        nominal: "",
        tgl_jatuh_tempo: "",
        semester: "Semester Gasal",
        bulan: "Januari",
        tahun: String(new Date().getFullYear()),
    });

    const generateForm = useForm({
        jenis: jenisPembayaran[0]?.nama || "SPP",
        nama_pembayaran: "",
        nominal: "",
        semester: "Semester Gasal",
        bulan: "Januari",
        tahun: String(new Date().getFullYear()),
        target: "putra",
        kecualikan: "",
    });

    const bulanList = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];

    const tahunList = ["2025", "2026", "2027"];

    const getNamaOtomatis = (jenis, semester, bulan, tahun) => {
        if (jenis === "SPP") return `${semester} ${tahun}`;
        if (jenis === "Kas") return `${bulan} ${tahun}`;
        return "";
    };

    useEffect(() => {
        if (showModal) firstFieldRef.current?.focus();
    }, [showModal]);

    const openCreate = () => {
        reset();
        clearErrors();
        setEditData(null);
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditData(p);
        clearErrors();
        setData({
            nis: p.nis,
            jenis: p.jenis,
            nama_pembayaran: p.nama_pembayaran,
            nominal: p.nominal,
            tgl_jatuh_tempo: p.tgl_jatuh_tempo || "",
            semester: "Semester Gasal",
            bulan: "Januari",
            tahun: String(new Date().getFullYear()),
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditData(null);
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        let finalData = { ...data };
        if (!editData) {
            const namaOtomatis = getNamaOtomatis(
                data.jenis,
                data.semester,
                data.bulan,
                data.tahun,
            );
            if (namaOtomatis && data.jenis !== "Kitab") {
                finalData.nama_pembayaran = namaOtomatis;
            }
        }

        if (editData) {
            router.put(`/pembayaran/${editData.id}`, finalData, {
                onSuccess: () => {
                    toast.success("Pembayaran diupdate!");
                    setShowModal(false);
                    setEditData(null);
                },
                onError: () => toast.error("Gagal mengupdate."),
            });
        } else {
            router.post("/pembayaran", finalData, {
                onSuccess: () => {
                    toast.success("Pembayaran ditambah!");
                    setShowModal(false);
                },
                onError: () => toast.error("Gagal menambah."),
            });
        }
    };

    const handleSearch = (value) => {
        setSearch(value);
        router.get(
            "/pembayaran",
            {
                search: value,
                jenis: filters.jenis || "",
                status: statusFilter,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        router.get(
            "/pembayaran",
            {
                status: value,
                jenis: filters.jenis || "",
                search: search,
            },
            { preserveState: true, replace: true },
        );
    };

    const confirmDeletePembayaran = (id, nama) => setDeleteTarget({ id, nama });
    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);
        router.delete(`/pembayaran/${deleteTarget.id}`, {
            onSuccess: () => toast.success("Pembayaran dihapus!"),
            onError: () => toast.error("Gagal menghapus."),
            onFinish: () => {
                setDeletingId(null);
                setDeleteTarget(null);
            },
        });
    };

    const openCicilan = (id) => {
        setShowCicilan(id);
        setNominalCicilan("");
        setCicilanError("");
    };

    const handleCicilan = (p) => {
        const value = Number(nominalCicilan);
        if (!nominalCicilan || value <= 0) {
            setCicilanError("Masukkan nominal yang valid.");
            return;
        }
        if (typeof p.sisa === "number" && value > p.sisa) {
            setCicilanError("Nominal melebihi sisa tagihan.");
            return;
        }
        setCicilanError("");
        setCicilanSubmitting(true);
        router.post(
            `/pembayaran/${p.id}/cicilan`,
            { nominal: nominalCicilan },
            {
                onSuccess: () => {
                    setShowCicilan(null);
                    setNominalCicilan("");
                    toast.success("Cicilan berhasil!");
                },
                onError: (errs) => {
                    setCicilanError(Object.values(errs)[0] || "Gagal.");
                    toast.error("Gagal menyimpan cicilan.");
                },
                onFinish: () => setCicilanSubmitting(false),
            },
        );
    };

    const handleLunasi = (p) => {
        const sisa = p.sisa || p.nominal;
        if (!confirm(`Lunasi tagihan ini? (Rp ${sisa.toLocaleString()})`))
            return;
        setLunasiSubmitting(true);
        router.post(
            `/pembayaran/${p.id}/cicilan`,
            { nominal: sisa },
            {
                onSuccess: () => toast.success("Tagihan dilunasi!"),
                onError: () => toast.error("Gagal melunasi."),
                onFinish: () => setLunasiSubmitting(false),
            },
        );
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        generateForm.post("/pembayaran/generate", {
            onSuccess: () => {
                setShowGenerate(false);
                toast.success("Tagihan digenerate!");
            },
            onError: () => toast.error("Gagal generate."),
        });
    };

    const openVerifikasi = (p) => {
        setVerifikasiTarget(p);
        setNominalVerifikasi(p.sisa || "");
    };

    const handleVerifikasi = (p, status) => {
        setVerifyingId(p.id);
        router.post(
            `/pembayaran/${p.id}/verifikasi`,
            {
                status_verifikasi: status,
                nominal_dibayar:
                    status === "lunas" ? nominalVerifikasi : undefined,
            },
            {
                onSuccess: () => {
                    toast.success(
                        status === "lunas"
                            ? "Pembayaran disetujui!"
                            : "Pembayaran ditolak!",
                    );
                    setVerifikasiTarget(null);
                    setNominalVerifikasi("");
                },
                onError: () => toast.error("Gagal verifikasi."),
                onFinish: () => setVerifyingId(null),
            },
        );
    };

    const confirmDeleteKategori = (id, nama) =>
        setDeleteKategoriTarget({ id, nama });
    const handleDeleteKategori = () => {
        if (!deleteKategoriTarget) return;
        setDeletingKategoriId(deleteKategoriTarget.id);
        router.delete(`/jenis-pembayaran/${deleteKategoriTarget.id}`, {
            onSuccess: () => {
                toast.success("Kategori dihapus!");
                setDeleteKategoriTarget(null);
                setShowKategori(false);
            },
            onError: () => toast.error("Gagal menghapus kategori."),
            onFinish: () => setDeletingKategoriId(null),
        });
    };

    const statusColor = (s) =>
        s === "lunas"
            ? "bg-emerald-50 text-emerald-600"
            : s === "ditolak"
              ? "bg-red-50 text-red-500"
              : s === "dicicil"
                ? "bg-amber-50 text-amber-600"
                : "bg-slate-100 text-slate-500";

    const statusLabel = (s) =>
        s === "lunas"
            ? "Lunas"
            : s === "ditolak"
              ? "Ditolak"
              : s === "dicicil"
                ? "Dicicil"
                : "Menunggu";

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-slate-800">
                        Pembayaran
                    </h2>
                </div>

                {isAdmin && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button
                            onClick={() => setShowKategori(true)}
                            className="bg-white border border-slate-200 text-slate-600 py-2.5 rounded-2xl text-xs font-medium hover:bg-slate-50 transition"
                        >
                            Kategori
                        </button>
                        <button
                            onClick={() => setShowGenerate(true)}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            Generate
                        </button>
                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            + Tambah
                        </button>
                    </div>
                )}

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari NIS, nama santri, atau pembayaran..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                    />
                </div>

                {/* Filter */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <select
                        value={filters.jenis || "semua"}
                        onChange={(e) => {
                            const val = e.target.value;
                            router.get(
                                "/pembayaran",
                                {
                                    jenis: val === "semua" ? "" : val,
                                    status: statusFilter,
                                    search: search,
                                },
                                { preserveState: true, replace: true },
                            );
                        }}
                        className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                    >
                        <option value="semua">Semua Kategori</option>
                        {jenisPembayaran?.map((j) => (
                            <option key={j.id} value={j.nama}>
                                {j.nama}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                    >
                        <option value="semua">Semua Status</option>
                        <option value="belum">Belum</option>
                        <option value="dicicil">Dicicil</option>
                        <option value="lunas">Lunas</option>
                        <option value="ditolak">Ditolak</option>
                    </select>
                </div>

                {/* Modal Lihat Bukti */}
                {showBukti && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/70"
                            onClick={() => setShowBukti(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-lg p-4 border border-sky-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-lg">
                                    Bukti Transfer
                                </h3>
                                <button
                                    onClick={() => setShowBukti(null)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>
                            <img
                                src={`/storage/${showBukti}`}
                                alt="Bukti Transfer"
                                className="w-full rounded-2xl"
                            />
                        </div>
                    </div>
                )}

                {/* Modal Verifikasi */}
                {verifikasiTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setVerifikasiTarget(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100">
                            <h3 className="font-semibold text-lg mb-4">
                                Verifikasi Pembayaran
                            </h3>
                            {verifikasiTarget.bukti && (
                                <img
                                    src={`/storage/${verifikasiTarget.bukti}`}
                                    alt="Bukti"
                                    className="w-full h-40 object-cover rounded-2xl mb-3"
                                />
                            )}
                            <div className="text-xs text-slate-500 mb-3">
                                <p>
                                    Santri:{" "}
                                    {verifikasiTarget.santri?.nama_lengkap}
                                </p>
                                <p>
                                    Nominal Tagihan: Rp{" "}
                                    {parseInt(
                                        verifikasiTarget.nominal || 0,
                                    ).toLocaleString()}
                                </p>
                                <p>
                                    Sisa: Rp{" "}
                                    {parseInt(
                                        verifikasiTarget.sisa || 0,
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <input
                                type="number"
                                value={nominalVerifikasi}
                                onChange={(e) =>
                                    setNominalVerifikasi(e.target.value)
                                }
                                placeholder="Nominal yang dibayar"
                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none mb-3"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        handleVerifikasi(
                                            verifikasiTarget,
                                            "ditolak",
                                        )
                                    }
                                    disabled={
                                        verifyingId === verifikasiTarget.id
                                    }
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    Tolak
                                </button>
                                <button
                                    onClick={() =>
                                        handleVerifikasi(
                                            verifikasiTarget,
                                            "lunas",
                                        )
                                    }
                                    disabled={
                                        verifyingId === verifikasiTarget.id ||
                                        !nominalVerifikasi
                                    }
                                    className="flex-1 bg-emerald-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    Terima
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Kategori Modal */}
                {showKategori && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowKategori(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    Kategori Tagihan
                                </h3>
                                <button
                                    onClick={() => setShowKategori(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {jenisPembayaran?.map((j) => (
                                    <span
                                        key={j.id}
                                        className="text-xs bg-[#3D7ABA]/10 text-[#3D7ABA] px-3 py-1.5 rounded-full flex items-center gap-2"
                                    >
                                        {j.nama}
                                        <button
                                            onClick={() =>
                                                confirmDeleteKategori(
                                                    j.id,
                                                    j.nama,
                                                )
                                            }
                                            className="text-red-400 hover:text-red-600 ml-1"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = e.target.nama;
                                    router.post(
                                        "/jenis-pembayaran",
                                        { nama: input.value },
                                        {
                                            onSuccess: () => {
                                                input.value = "";
                                                toast.success(
                                                    "Kategori ditambah!",
                                                );
                                                setShowKategori(false);
                                            },
                                            onError: () =>
                                                toast.error(
                                                    "Gagal menambah kategori.",
                                                ),
                                        },
                                    );
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    name="nama"
                                    placeholder="Nama kategori baru..."
                                    className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-5 py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    Tambah
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Generate Modal */}
                {showGenerate && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowGenerate(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    Generate Tagihan
                                </h3>
                                <button
                                    onClick={() => setShowGenerate(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>
                            <form
                                onSubmit={handleGenerate}
                                className="space-y-3"
                            >
                                <select
                                    value={generateForm.data.jenis}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "jenis",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                >
                                    {jenisPembayaran?.map((j) => (
                                        <option key={j.id} value={j.nama}>
                                            {j.nama}
                                        </option>
                                    ))}
                                </select>

                                {generateForm.data.jenis === "SPP" && (
                                    <>
                                        <select
                                            value={generateForm.data.semester}
                                            onChange={(e) =>
                                                generateForm.setData(
                                                    "semester",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            <option value="Semester Gasal">
                                                Semester Gasal
                                            </option>
                                            <option value="Semester Genap">
                                                Semester Genap
                                            </option>
                                        </select>
                                        <select
                                            value={generateForm.data.tahun}
                                            onChange={(e) =>
                                                generateForm.setData(
                                                    "tahun",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            {tahunList.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}

                                {generateForm.data.jenis === "Kas" && (
                                    <>
                                        <select
                                            value={generateForm.data.target}
                                            onChange={(e) =>
                                                generateForm.setData(
                                                    "target",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            <option value="putra">
                                                Putra (PA)
                                            </option>
                                            <option value="putri">
                                                Putri (PI)
                                            </option>
                                        </select>
                                        <select
                                            value={generateForm.data.bulan}
                                            onChange={(e) =>
                                                generateForm.setData(
                                                    "bulan",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            {bulanList.map((b) => (
                                                <option key={b} value={b}>
                                                    {b}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={generateForm.data.tahun}
                                            onChange={(e) =>
                                                generateForm.setData(
                                                    "tahun",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            {tahunList.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}

                                {!["SPP", "Kas"].includes(
                                    generateForm.data.jenis,
                                ) && (
                                    <input
                                        type="text"
                                        placeholder="Nama Pembayaran"
                                        value={
                                            generateForm.data.nama_pembayaran
                                        }
                                        onChange={(e) =>
                                            generateForm.setData(
                                                "nama_pembayaran",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                )}

                                <input
                                    type="number"
                                    placeholder="Nominal"
                                    value={generateForm.data.nominal}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "nominal",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Kecualikan NIS (pisah koma)"
                                    value={generateForm.data.kecualikan}
                                    onChange={(e) =>
                                        generateForm.setData(
                                            "kecualikan",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowGenerate(false)}
                                        className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={generateForm.processing}
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Card List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pembayaran.data.length === 0 && (
                        <p className="text-center text-slate-400 py-10 sm:col-span-2">
                            Tidak ada data
                        </p>
                    )}
                    {pembayaran.data.map((p) => {
                        const nominal = Number(p.nominal) || 0;
                        const dibayar = Number(p.total_dibayar) || 0;
                        const percent =
                            nominal > 0
                                ? Math.min(
                                      100,
                                      Math.max(0, (dibayar / nominal) * 100),
                                  )
                                : 0;
                        return (
                            <div
                                key={p.id}
                                className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                                            {p.jenis}
                                        </span>
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(p.status)}`}
                                        >
                                            {statusLabel(p.status)}
                                        </span>
                                        {p.bukti && (
                                            <button
                                                onClick={() =>
                                                    setShowBukti(p.bukti)
                                                }
                                                className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full"
                                            >
                                                Lihat Bukti
                                            </button>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs hover:bg-[#3D7ABA]/10 hover:text-[#3D7ABA] transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    confirmDeletePembayaran(
                                                        p.id,
                                                        p.nama_pembayaran,
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
                                    {p.nama_pembayaran}
                                </h3>
                                <div className="text-[11px] text-slate-500 space-y-0.5 mb-2">
                                    <Row label="NIS" value={p.nis} />
                                    <Row
                                        label="Santri"
                                        value={p.santri?.nama_lengkap}
                                    />
                                    <Row
                                        label="Nominal"
                                        value={`Rp ${nominal.toLocaleString()}`}
                                    />
                                    {dibayar > 0 && (
                                        <>
                                            <Row
                                                label="Dibayar"
                                                value={`Rp ${dibayar.toLocaleString()}`}
                                            />
                                            <Row
                                                label="Sisa"
                                                value={`Rp ${Math.max(0, nominal - dibayar).toLocaleString()}`}
                                            />
                                        </>
                                    )}
                                </div>
                                {dibayar > 0 && (
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                                        <div
                                            className="bg-emerald-500 h-1.5 rounded-full"
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                )}
                                {isAdmin && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {p.status !== "lunas" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        openCicilan(p.id)
                                                    }
                                                    className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg"
                                                >
                                                    Cicilan
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleLunasi(p)
                                                    }
                                                    disabled={lunasiSubmitting}
                                                    className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg"
                                                >
                                                    {lunasiSubmitting
                                                        ? "..."
                                                        : "Lunasi"}
                                                </button>
                                            </>
                                        )}
                                        {p.status_verifikasi === "menunggu" &&
                                            p.bukti && (
                                                <button
                                                    onClick={() =>
                                                        openVerifikasi(p)
                                                    }
                                                    className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg"
                                                >
                                                    Verifikasi
                                                </button>
                                            )}
                                    </div>
                                )}
                                {showCicilan === p.id && isAdmin && (
                                    <div className="mt-3 pt-3 border-t flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Nominal"
                                            value={nominalCicilan}
                                            onChange={(e) => {
                                                setNominalCicilan(
                                                    e.target.value,
                                                );
                                                setCicilanError("");
                                            }}
                                            className="flex-1 border border-slate-200 rounded-2xl px-4 py-2 text-sm"
                                        />
                                        <button
                                            onClick={() => handleCicilan(p)}
                                            disabled={cicilanSubmitting}
                                            className="bg-amber-500 text-white px-4 py-2 rounded-2xl text-sm"
                                        >
                                            Bayar
                                        </button>
                                        <button
                                            onClick={() => setShowCicilan(null)}
                                            className="text-slate-400"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {pembayaran.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() =>
                                router.get(
                                    pembayaran.prev_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            disabled={!pembayaran.prev_page_url}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="text-xs text-slate-400">
                            Halaman {pembayaran.current_page} dari{" "}
                            {pembayaran.last_page}
                        </span>
                        <button
                            onClick={() =>
                                router.get(
                                    pembayaran.next_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            disabled={!pembayaran.next_page_url}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Tambah/Edit Modal */}
                {showModal && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={closeModal}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    {editData ? "Edit" : "Tambah"} Pembayaran
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={submit} className="space-y-3">
                                {!editData ? (
                                    <select
                                        value={data.nis}
                                        onChange={(e) =>
                                            setData("nis", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        required
                                    >
                                        <option value="">Pilih Santri</option>
                                        {santris.map((s) => (
                                            <option key={s.nis} value={s.nis}>
                                                {s.nama_lengkap} ({s.nis})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={data.nis}
                                        disabled
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm disabled:bg-slate-50"
                                    />
                                )}

                                <select
                                    value={data.jenis}
                                    onChange={(e) =>
                                        setData("jenis", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                >
                                    {jenisPembayaran?.map((j) => (
                                        <option key={j.id} value={j.nama}>
                                            {j.nama}
                                        </option>
                                    ))}
                                </select>

                                {data.jenis === "SPP" && (
                                    <>
                                        <select
                                            value={data.semester}
                                            onChange={(e) =>
                                                setData(
                                                    "semester",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            <option value="Semester Gasal">
                                                Semester Gasal
                                            </option>
                                            <option value="Semester Genap">
                                                Semester Genap
                                            </option>
                                        </select>
                                        <select
                                            value={data.tahun}
                                            onChange={(e) =>
                                                setData("tahun", e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            {tahunList.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}

                                {data.jenis === "Kas" && (
                                    <>
                                        <select
                                            value={data.bulan}
                                            onChange={(e) =>
                                                setData("bulan", e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            {bulanList.map((b) => (
                                                <option key={b} value={b}>
                                                    {b}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={data.tahun}
                                            onChange={(e) =>
                                                setData("tahun", e.target.value)
                                            }
                                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white"
                                        >
                                            {tahunList.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}

                                {!["SPP", "Kas"].includes(data.jenis) && (
                                    <input
                                        type="text"
                                        placeholder="Nama Pembayaran"
                                        value={data.nama_pembayaran}
                                        onChange={(e) =>
                                            setData(
                                                "nama_pembayaran",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                )}

                                <input
                                    type="number"
                                    placeholder="Nominal"
                                    value={data.nominal}
                                    onChange={(e) =>
                                        setData("nominal", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="date"
                                    value={data.tgl_jatuh_tempo}
                                    onChange={(e) =>
                                        setData(
                                            "tgl_jatuh_tempo",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                    >
                                        {editData ? "Update" : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Pembayaran Modal */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setDeleteTarget(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100 text-center">
                            <h3 className="font-semibold text-lg">
                                Hapus Pembayaran?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Data ini akan dihapus permanen.
                            </p>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={!!deletingId}
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    {deletingId ? "Menghapus..." : "Hapus"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Kategori Modal */}
                {deleteKategoriTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setDeleteKategoriTarget(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100 text-center">
                            <h3 className="font-semibold text-lg">
                                Hapus Kategori?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Kategori{" "}
                                <strong>{deleteKategoriTarget.nama}</strong>{" "}
                                akan dihapus permanen.
                            </p>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() =>
                                        setDeleteKategoriTarget(null)
                                    }
                                    className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteKategori}
                                    disabled={!!deletingKategoriId}
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    {deletingKategoriId
                                        ? "Menghapus..."
                                        : "Hapus"}
                                </button>
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
