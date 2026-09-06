import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Index() {
    const { cashflow, kategori, bulan, tahun, pemasukan, pengeluaran, total } =
        usePage().props;

    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("pemasukan");
    const [editData, setEditData] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [form, setForm] = useState({
        tanggal: "",
        nominal: "",
        keterangan: "",
    });

    const kategoriList = [
        { key: "kas_putra", label: "Kas Putra" },
        { key: "kas_putri", label: "Kas Putri" },
        { key: "anjem", label: "Anjem" },
    ];

    const handleKategori = (key) => {
        router.get(
            "/cashflow",
            { kategori: key, bulan, tahun },
            { preserveState: true },
        );
    };

    const bukaTambah = (tipe) => {
        setPopupType(tipe);
        setEditData(null);
        setForm({
            tanggal: new Date().toISOString().slice(0, 10),
            nominal: "",
            keterangan: "",
        });
        setShowPopup(true);
    };

    const bukaEdit = (item) => {
        setEditData(item);
        setPopupType(item.tipe);
        setForm({
            tanggal: item.tanggal,
            nominal: item.nominal,
            keterangan: item.keterangan,
        });
        setShowPopup(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editData) {
            router.put(`/cashflow/${editData.id}`, form, {
                onSuccess: () => {
                    toast.success("Data diupdate!");
                    setShowPopup(false);
                    setEditData(null);
                },
                onError: () => toast.error("Gagal mengupdate."),
            });
        } else {
            router.post(
                "/cashflow",
                { ...form, kategori, tipe: popupType },
                {
                    onSuccess: () => {
                        toast.success("Data ditambah!");
                        setShowPopup(false);
                    },
                    onError: () => toast.error("Gagal menambah."),
                },
            );
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/cashflow/${deleteTarget.id}`, {
            onSuccess: () => {
                toast.success("Data dihapus!");
                setDeleteTarget(null);
            },
            onError: () => toast.error("Gagal menghapus."),
        });
    };

    const bulanSebelumnya = () => {
        let b = bulan - 1;
        let t = tahun;
        if (b < 1) {
            b = 12;
            t--;
        }
        router.get(
            "/cashflow",
            { kategori, bulan: b, tahun: t },
            { preserveState: true },
        );
    };

    const bulanBerikutnya = () => {
        let b = bulan + 1;
        let t = tahun;
        if (b > 12) {
            b = 1;
            t++;
        }
        router.get(
            "/cashflow",
            { kategori, bulan: b, tahun: t },
            { preserveState: true },
        );
    };

    const formatRupiah = (n) => `Rp ${parseInt(n || 0).toLocaleString()}`;
    const formatTanggal = (tgl) =>
        new Date(tgl + "T12:00:00").toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    const namaBulan = new Date(tahun, bulan - 1).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    });

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Cashflow
                </h2>

                {/* Tab Kategori */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {kategoriList.map((k) => (
                        <button
                            key={k.key}
                            onClick={() => handleKategori(k.key)}
                            className={`py-2 rounded-full text-xs font-semibold transition ${kategori === k.key ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500"}`}
                        >
                            {k.label}
                        </button>
                    ))}
                </div>

                {/* Ringkasan */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-400">Pemasukan</p>
                        <p className="text-base font-bold text-emerald-600 mt-1 font-mono">
                            {formatRupiah(pemasukan)}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-400">Pengeluaran</p>
                        <p className="text-base font-bold text-red-500 mt-1 font-mono">
                            {formatRupiah(pengeluaran)}
                        </p>
                    </div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm mb-4 flex justify-between items-center">
                    <span className="text-sm text-slate-500">Total</span>
                    <span
                        className={`text-base font-extrabold font-mono ${total >= 0 ? "text-[#3D7ABA]" : "text-red-500"}`}
                    >
                        {formatRupiah(total)}
                    </span>
                </div>

                {/* Tombol Tambah */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        onClick={() => bukaTambah("pemasukan")}
                        className="bg-emerald-500 text-white py-2.5 rounded-2xl text-sm font-semibold shadow-lg"
                    >
                        Pemasukan
                    </button>
                    <button
                        onClick={() => bukaTambah("pengeluaran")}
                        className="bg-red-500 text-white py-2.5 rounded-2xl text-sm font-semibold shadow-lg"
                    >
                        Pengeluaran
                    </button>
                </div>

                {/* Navigasi Bulan */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={bulanSebelumnya}
                        className="bg-white border border-slate-200 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-[#3D7ABA] transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <p className="text-sm font-bold text-slate-700">
                        {namaBulan}
                    </p>
                    <button
                        onClick={bulanBerikutnya}
                        className="bg-white border border-slate-200 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-[#3D7ABA] transition"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Riwayat */}
                <div className="space-y-2">
                    {cashflow.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada data
                        </p>
                    )}
                    {cashflow.map((item) => (
                        <div
                            key={
                                item.id === 0
                                    ? "saldo-bulan-lalu"
                                    : `cashflow-${item.id}`
                            }
                            className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-1 gap-2">
                                <p className="text-xs text-slate-400 shrink-0">
                                    {formatTanggal(item.tanggal)}
                                </p>
                                {item.id !== 0 && (
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={() => bukaEdit(item)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#3D7ABA] hover:bg-[#3D7ABA]/10 transition"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeleteTarget(item)
                                            }
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm text-slate-600 break-words flex-1 min-w-0">
                                    {item.keterangan}
                                </p>
                                <p
                                    className={`text-sm font-bold font-mono whitespace-nowrap shrink-0 ${item.tipe === "pemasukan" ? "text-emerald-600" : "text-red-500"}`}
                                >
                                    {item.tipe === "pemasukan" ? "+" : "-"}{" "}
                                    {formatRupiah(item.nominal)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Popup Tambah/Edit */}
                {showPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowPopup(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    {editData ? "Edit" : "Tambah"}{" "}
                                    {popupType === "pemasukan"
                                        ? "Pemasukan"
                                        : "Pengeluaran"}
                                </h3>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg"
                                >
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Keterangan"
                                    value={form.keterangan}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            keterangan: e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Nominal"
                                    value={form.nominal}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nominal: e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    required
                                />
                                <input
                                    type="date"
                                    value={form.tanggal}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            tanggal: e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    required
                                />
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPopup(false)}
                                        className="flex-1 border border-slate-200 py-2.5 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                                    >
                                        {editData ? "Update" : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Popup Hapus */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setDeleteTarget(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100 text-center">
                            <h3 className="font-semibold text-lg">
                                Hapus Data?
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
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
