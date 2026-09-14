import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import { FileText, Upload } from "lucide-react";

export default function Index() {
    const { rpps, gurus, isAdmin, isGuru, myGuruId } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        mata_pelajaran: "",
        guru_id: "",
        file: null,
    });

    const openCreate = () => {
        reset();
        setEditData(null);
        setShowModal(true);
    };

    const openEdit = (rpp) => {
        setEditData(rpp);
        setData({
            mata_pelajaran: rpp.mata_pelajaran,
            guru_id: rpp.guru_id,
            file: null,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(`/rpp/${editData.id}`, {
                onSuccess: () => {
                    closeModal();
                    toast.success("RPP berhasil diupdate!");
                },
                onError: () => toast.error("Gagal mengupdate RPP."),
            });
        } else {
            post("/rpp", {
                onSuccess: () => {
                    closeModal();
                    toast.success("RPP berhasil diupload!");
                },
                onError: () => toast.error("Gagal mengupload RPP."),
            });
        }
    };

    const handleDelete = (id, nama) => {
        if (confirm(`Hapus RPP "${nama}"?`)) {
            router.delete(`/rpp/${id}`, {
                onSuccess: () => toast.success("RPP berhasil dihapus!"),
                onError: () => toast.error("Gagal menghapus RPP."),
            });
        }
    };

    const bisaEdit = (rpp) => isAdmin || (isGuru && rpp.guru_id === myGuruId);

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Upload RPP
                    </h2>
                    <button
                        onClick={openCreate}
                        className="bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition"
                    >
                        + Upload RPP
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rpps.length === 0 && (
                        <p className="text-center text-slate-400 py-10 md:col-span-2">
                            Belum ada RPP
                        </p>
                    )}
                    {rpps.map((rpp) => (
                        <div
                            key={rpp.id}
                            className="rounded-[30px] border border-teal-100 bg-white p-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs bg-[#009788]/10 text-[#009788] px-2.5 py-1 rounded-full font-medium">
                                    {rpp.mata_pelajaran}
                                </span>
                                {bisaEdit(rpp) && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEdit(rpp)}
                                            className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs hover:bg-[#009788]/10 hover:text-[#009788] transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    rpp.id,
                                                    rpp.mata_pelajaran,
                                                )
                                            }
                                            className="bg-red-50 text-red-500 px-2.5 py-1 rounded-lg text-xs hover:bg-red-100 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="text-[11px] text-slate-500 space-y-0.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">
                                        Mata Pelajaran
                                    </span>
                                    <span className="font-medium text-slate-600">
                                        {rpp.mata_pelajaran}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Guru</span>
                                    <span className="font-medium text-slate-600">
                                        {rpp.guru?.nama_lengkap}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <a
                                    href={`/storage/${rpp.file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white px-3 py-2 rounded-full text-xs font-semibold hover:scale-105 transition"
                                >
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={closeModal}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-teal-100">
                            <h3 className="font-semibold text-lg mb-4">
                                {editData ? "Edit" : "Upload"} RPP
                            </h3>
                            <form onSubmit={submit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Mata Pelajaran *"
                                    value={data.mata_pelajaran}
                                    onChange={(e) =>
                                        setData(
                                            "mata_pelajaran",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    required
                                />

                                <select
                                    value={data.guru_id}
                                    onChange={(e) =>
                                        setData("guru_id", e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    required
                                >
                                    <option value="">Pilih Guru *</option>
                                    {gurus.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.nama_lengkap}
                                        </option>
                                    ))}
                                </select>

                                {/* Upload File Custom */}
                                <label className="cursor-pointer block">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) =>
                                            setData("file", e.target.files[0])
                                        }
                                        className="hidden"
                                    />
                                    <div className="border-2 border-dashed border-teal-200 rounded-2xl p-4 text-center hover:bg-teal-50 transition">
                                        {data.file ? (
                                            <div className="space-y-1">
                                                <FileText className="w-8 h-8 mx-auto text-[#009788]" />
                                                <p className="text-sm font-medium text-slate-700 break-all">
                                                    {data.file.name}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Klik untuk ganti file
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <Upload className="w-8 h-8 mx-auto text-slate-400" />
                                                <p className="text-sm font-medium text-slate-600">
                                                    Pilih File PDF
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </label>

                                {errors.file && (
                                    <p className="text-xs text-red-500">
                                        {errors.file}
                                    </p>
                                )}

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
                                        className="flex-1 bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white py-2.5 rounded-2xl text-sm font-semibold shadow-lg transition disabled:opacity-50"
                                    >
                                        {editData ? "Update" : "Upload"}
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
