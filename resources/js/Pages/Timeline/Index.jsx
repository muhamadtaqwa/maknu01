import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { timeline, auth } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const isAdmin = auth.user.role === "admin";

    const { data, setData, post, put, reset, processing } = useForm({
        tanggal: "",
        waktu: "",
        acara: "",
        tempat: "",
    });

    const openCreate = () => {
        reset();
        setEditId(null);
        setShowForm(true);
    };
    const openEdit = (item) => {
        setEditId(item.id);
        setData({
            tanggal: item.tanggal,
            waktu: item.waktu || "",
            acara: item.acara,
            tempat: item.tempat || "",
        });
        setShowForm(true);
    };
    const submit = (e) => {
        e.preventDefault();
        editId
            ? put(`/timeline/${editId}`, {
                  onSuccess: () => {
                      reset();
                      setShowForm(false);
                      toast.success("Acara diupdate!");
                  },
                  onError: () => toast.error("Gagal mengupdate."),
              })
            : post("/timeline", {
                  onSuccess: () => {
                      reset();
                      setShowForm(false);
                      toast.success("Acara ditambah!");
                  },
                  onError: () => toast.error("Gagal menambah."),
              });
    };
    const handleDelete = (id) => {
        if (confirm("Hapus acara?")) {
            router.delete(`/timeline/${id}`, {
                onSuccess: () => toast.success("Acara dihapus!"),
                onError: () => toast.error("Gagal menghapus."),
            });
        }
    };

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Timeline Pondok
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

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowForm(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-8 border border-sky-100">
                            <h3 className="font-semibold text-lg mb-4">
                                {editId ? "Edit" : "Tambah"} Acara
                            </h3>
                            <form onSubmit={submit} className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) =>
                                            setData("tanggal", e.target.value)
                                        }
                                        className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                        required
                                    />
                                    <input
                                        type="time"
                                        value={data.waktu}
                                        onChange={(e) =>
                                            setData("waktu", e.target.value)
                                        }
                                        className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nama acara..."
                                    value={data.acara}
                                    onChange={(e) =>
                                        setData("acara", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Tempat..."
                                    value={data.tempat}
                                    onChange={(e) =>
                                        setData("tempat", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm"
                                />
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 border border-slate-200 py-3 rounded-2xl text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold"
                                    >
                                        {editId ? "Update" : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="relative pl-6 ml-[7px] space-y-3 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-[#3D7ABA]/20">
                    {timeline.length === 0 && (
                        <p className="text-slate-400 text-sm">
                            Belum ada acara
                        </p>
                    )}
                    {timeline.map((item) => (
                        <div key={item.id} className="relative">
                            <div className="absolute -left-[31px] top-6 w-4 h-4 bg-[#3D7ABA] rounded-full border-2 border-white shadow"></div>
                            <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-[11px] text-[#3D7ABA] font-medium">
                                            {new Date(
                                                item.tanggal,
                                            ).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                            {item.waktu &&
                                                ` • ${item.waktu.slice(0, 5)}`}
                                            {item.tempat && ` • ${item.tempat}`}
                                        </p>
                                        <p className="text-sm font-medium text-slate-800 mt-0.5">
                                            {item.acara}
                                        </p>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex flex-col border-l border-slate-200 pl-2 ml-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="text-xs text-slate-400 py-0.5"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                                className="text-xs text-red-400 py-0.5 border-t border-slate-100"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
