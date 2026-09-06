import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { inventaris, auth } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState("");

    const { data, setData, post, put, reset, processing } = useForm({
        nama_barang: "",
        kategori: "",
        jumlah: 1,
        kondisi: "baik",
        lokasi: "",
        keterangan: "",
    });

    const openCreate = () => {
        reset();
        setEditData(null);
        setShowModal(true);
    };
    const openEdit = (item) => {
        setEditData(item);
        setData({
            nama_barang: item.nama_barang,
            kategori: item.kategori || "",
            jumlah: item.jumlah,
            kondisi: item.kondisi,
            lokasi: item.lokasi || "",
            keterangan: item.keterangan || "",
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
            ? put(`/inventaris/${editData.id}`, {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Barang berhasil diupdate!");
                  },
                  onError: () => toast.error("Gagal mengupdate barang."),
              })
            : post("/inventaris", {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Barang berhasil ditambah!");
                  },
                  onError: () => toast.error("Gagal menambah barang."),
              });
    };
    const handleDelete = (id) => {
        if (confirm("Hapus?")) {
            router.delete(`/inventaris/${id}`, {
                onSuccess: () => toast.success("Barang berhasil dihapus!"),
                onError: () => toast.error("Gagal menghapus barang."),
            });
        }
    };

    const filtered = inventaris.filter(
        (i) =>
            i.nama_barang?.toLowerCase().includes(search.toLowerCase()) ||
            i.kode?.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Inventaris
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={openCreate}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg"
                        >
                            + Tambah
                        </button>
                    )}
                </div>

                <input
                    type="text"
                    placeholder="Cari nama atau kode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm mb-4 focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10 sm:col-span-2">
                            Tidak ada data
                        </p>
                    )}
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                                        {item.kode}
                                    </span>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.kondisi === "baik" ? "bg-emerald-50 text-emerald-600" : item.kondisi === "rusak" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"}`}
                                    >
                                        {item.kondisi.charAt(0).toUpperCase() +
                                            item.kondisi.slice(1)}
                                    </span>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEdit(item)}
                                            className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs hover:bg-[#3D7ABA]/10 hover:text-[#3D7ABA] transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                            className="bg-red-50 text-red-500 px-2.5 py-1 rounded-lg text-xs hover:bg-red-100 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h3 className="font-semibold text-sm truncate mb-2">
                                {item.nama_barang}
                            </h3>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                                {item.kategori && (
                                    <Row
                                        label="Kategori"
                                        value={item.kategori}
                                    />
                                )}
                                <Row label="Jumlah" value={item.jumlah} />
                                {item.lokasi && (
                                    <Row label="Lokasi" value={item.lokasi} />
                                )}
                                {item.keterangan && (
                                    <Row
                                        label="Keterangan"
                                        value={item.keterangan}
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
                                {editData ? "Edit" : "Tambah"} Barang
                            </h3>
                            <form onSubmit={submit} className="space-y-3">
                                {editData && (
                                    <p className="text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl">
                                        Kode: {editData.kode}
                                    </p>
                                )}
                                <input
                                    type="text"
                                    placeholder="Nama Barang"
                                    value={data.nama_barang}
                                    onChange={(e) =>
                                        setData("nama_barang", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Kategori"
                                    value={data.kategori}
                                    onChange={(e) =>
                                        setData("kategori", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Jumlah"
                                        value={data.jumlah}
                                        onChange={(e) =>
                                            setData("jumlah", e.target.value)
                                        }
                                        className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                    <select
                                        value={data.kondisi}
                                        onChange={(e) =>
                                            setData("kondisi", e.target.value)
                                        }
                                        className="w-full border rounded-2xl px-4 py-2.5 text-sm bg-white"
                                    >
                                        <option value="baik">Baik</option>
                                        <option value="rusak">Rusak</option>
                                        <option value="hilang">Hilang</option>
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Lokasi"
                                    value={data.lokasi}
                                    onChange={(e) =>
                                        setData("lokasi", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <textarea
                                    placeholder="Keterangan"
                                    value={data.keterangan}
                                    onChange={(e) =>
                                        setData("keterangan", e.target.value)
                                    }
                                    className="w-full border rounded-2xl px-4 py-2.5 text-sm"
                                    rows={2}
                                ></textarea>
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
