import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { pinjam, auth } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState("");

    const { data, setData, post, put, reset, processing } = useForm({
        nama_peminjam: "",
        gedung: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        jam_mulai: "",
        jam_selesai: "",
        keperluan: "",
        status: "aktif",
    });

    const openCreate = () => {
        reset();
        setEditData(null);
        setShowModal(true);
    };
    const openEdit = (p) => {
        setEditData(p);
        setData(p);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        reset();
    };
    const submit = (e) => {
        e.preventDefault();
        editData
            ? put(`/pinjam-gedung/${editData.id}`, {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Peminjaman berhasil diupdate!");
                  },
                  onError: () => toast.error("Gagal mengupdate."),
              })
            : post("/pinjam-gedung", {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Peminjaman berhasil dicatat!");
                  },
                  onError: () => toast.error("Gagal mencatat."),
              });
    };
    const handleDelete = (id) => {
        if (confirm("Hapus?")) {
            router.delete(`/pinjam-gedung/${id}`, {
                onSuccess: () => toast.success("Peminjaman berhasil dihapus!"),
                onError: () => toast.error("Gagal menghapus."),
            });
        }
    };

    const filtered = pinjam.filter(
        (p) =>
            p.nama_peminjam?.toLowerCase().includes(search.toLowerCase()) ||
            p.gedung?.toLowerCase().includes(search.toLowerCase()) ||
            p.keperluan?.toLowerCase().includes(search.toLowerCase()),
    );

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
                        Pinjam Gedung
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition"
                        >
                            + Catat
                        </button>
                    )}
                </div>

                <input
                    type="text"
                    placeholder="Cari..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm mb-4 focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10 sm:col-span-2">
                            Tidak ada data
                        </p>
                    )}
                    {filtered.map((p) => (
                        <div
                            key={p.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === "aktif" ? "bg-emerald-50 text-emerald-600" : p.status === "selesai" ? "bg-[#3D7ABA]/10 text-[#3D7ABA]" : "bg-red-50 text-red-500"}`}
                                    >
                                        {p.status.charAt(0).toUpperCase() +
                                            p.status.slice(1)}
                                    </span>
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
                                            onClick={() => handleDelete(p.id)}
                                            className="bg-red-50 text-red-500 px-2.5 py-1 rounded-lg text-xs hover:bg-red-100 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-semibold text-sm truncate mb-2">
                                {p.nama_peminjam}
                            </h3>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                                <Row label="Gedung" value={p.gedung} />
                                <Row
                                    label="Tanggal"
                                    value={`${formatTgl(p.tanggal_mulai)}${p.tanggal_selesai ? ` - ${formatTgl(p.tanggal_selesai)}` : ""}`}
                                />
                                <Row
                                    label="Waktu"
                                    value={`${p.jam_mulai?.slice(0, 5)} - ${p.jam_selesai?.slice(0, 5)}`}
                                />
                                {p.keperluan && (
                                    <Row
                                        label="Keperluan"
                                        value={p.keperluan}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && isAdmin && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={closeModal}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <h3 className="font-semibold text-lg mb-4">
                                {editData ? "Edit" : "Catat"} Peminjaman
                            </h3>
                            <form onSubmit={submit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nama Peminjam"
                                    value={data.nama_peminjam}
                                    onChange={(e) =>
                                        setData("nama_peminjam", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Gedung"
                                    value={data.gedung}
                                    onChange={(e) =>
                                        setData("gedung", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <p className="text-[11px] font-semibold text-slate-500">
                                    Tanggal
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={data.tanggal_mulai}
                                        onChange={(e) =>
                                            setData(
                                                "tanggal_mulai",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                    <input
                                        type="date"
                                        value={data.tanggal_selesai}
                                        onChange={(e) =>
                                            setData(
                                                "tanggal_selesai",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                                <p className="text-[11px] font-semibold text-slate-500">
                                    Waktu
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="time"
                                        value={data.jam_mulai}
                                        onChange={(e) =>
                                            setData("jam_mulai", e.target.value)
                                        }
                                        className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                    <input
                                        type="time"
                                        value={data.jam_selesai}
                                        onChange={(e) =>
                                            setData(
                                                "jam_selesai",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Keperluan"
                                    value={data.keperluan}
                                    onChange={(e) =>
                                        setData("keperluan", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm bg-white"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="selesai">Selesai</option>
                                    <option value="batal">Batal</option>
                                </select>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 border py-2.5 rounded-2xl text-sm"
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
