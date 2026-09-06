import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { letters } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [filterKategori, setFilterKategori] = useState("semua");

    const { data, setData, post, put, reset, processing } = useForm({
        kategori: "SK",
        tanggal: new Date().toISOString().split("T")[0],
        perihal: "",
        tujuan: "",
        isi: "",
        penandatangan: "",
    });

    const salin = (teks) => {
        navigator.clipboard
            .writeText(teks)
            .then(() => {
                toast.success("Nomor surat tersalin!");
            })
            .catch(() => {
                toast.error("Gagal menyalin.");
            });
    };

    const openCreate = () => {
        reset();
        setEditData(null);
        setShowModal(true);
    };
    const openEdit = (l) => {
        setEditData(l);
        setData({
            kategori: l.kategori,
            tanggal: l.tanggal,
            perihal: l.perihal,
            tujuan: l.tujuan || "",
            isi: l.isi || "",
            penandatangan: l.penandatangan || "",
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
            ? put(`/surat/${editData.id}`, {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Surat diupdate!");
                  },
                  onError: () => toast.error("Gagal mengupdate."),
              })
            : post("/surat", {
                  onSuccess: () => {
                      closeModal();
                      toast.success("Surat berhasil dibuat!");
                  },
                  onError: () => toast.error("Gagal membuat surat."),
              });
    };
    const handleDelete = (id) => {
        if (confirm("Batalkan surat ini?")) {
            router.delete(`/surat/${id}`, {
                onSuccess: () => toast.success("Surat dibatalkan!"),
            });
        }
    };

    const kategoriList = ["SK", "SE", "SU", "SKt", "ST"];
    const kategoriLabel = (k) => {
        const map = {
            SK: "Surat Keputusan",
            SE: "Surat Edaran",
            SU: "Surat Undangan",
            SKt: "Surat Keterangan",
            ST: "Surat Tugas",
        };
        return map[k] || k;
    };

    const filtered =
        filterKategori === "semua"
            ? letters
            : letters.filter((l) => l.kategori === filterKategori);

    const formatTgl = (tgl) => {
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
                        Arsip Surat
                    </h2>
                    <button
                        onClick={openCreate}
                        className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg"
                    >
                        + Buat Surat Baru
                    </button>
                </div>

                <div className="mb-4">
                    <select
                        value={filterKategori}
                        onChange={(e) => setFilterKategori(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                    >
                        <option value="semua">Semua Kategori</option>
                        {kategoriList.map((k) => (
                            <option key={k} value={k}>
                                {k} - {kategoriLabel(k)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10 sm:col-span-2">
                            Belum ada surat
                        </p>
                    )}
                    {filtered.map((l) => (
                        <div
                            key={l.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-[#3D7ABA]/10 text-[#3D7ABA] px-2.5 py-1 rounded-full font-medium">
                                        {l.kategori}
                                    </span>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${l.status === "dibatalkan" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}
                                    >
                                        {l.status === "dibatalkan"
                                            ? "Dibatalkan"
                                            : "Aktif"}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEdit(l)}
                                        className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs"
                                    >
                                        Edit
                                    </button>
                                    {l.status !== "dibatalkan" && (
                                        <button
                                            onClick={() => handleDelete(l.id)}
                                            className="bg-red-50 text-red-500 px-2.5 py-1 rounded-lg text-xs"
                                        >
                                            Batal
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-mono text-slate-400">
                                    {l.nomor_surat}
                                </p>
                                <button
                                    onClick={() => salin(l.nomor_surat)}
                                    className="text-slate-400 hover:text-[#3D7ABA] transition"
                                    aria-label="Salin nomor surat"
                                >
                                    <i className="fa-solid fa-copy text-xs"></i>
                                </button>
                            </div>
                            <h3 className="font-semibold text-sm truncate">
                                {l.perihal}
                            </h3>
                            <div className="text-[11px] text-slate-500 space-y-0.5 mt-2">
                                <Row
                                    label="Tanggal"
                                    value={formatTgl(l.tanggal)}
                                />
                                {l.tujuan && (
                                    <Row label="Tujuan" value={l.tujuan} />
                                )}
                                <Row
                                    label="Penandatangan"
                                    value={l.penandatangan}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div
                                className="fixed inset-0 bg-black/50"
                                onClick={closeModal}
                            ></div>
                            <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-lg p-6 border border-sky-100 my-4">
                                <h3 className="font-semibold text-lg mb-4">
                                    {editData ? "Edit" : "Buat"} Surat
                                </h3>
                                <form
                                    onSubmit={submit}
                                    className="space-y-3 max-h-[70vh] overflow-y-auto pr-1"
                                >
                                    {!editData && (
                                        <>
                                            <select
                                                value={data.kategori}
                                                onChange={(e) =>
                                                    setData(
                                                        "kategori",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                                required
                                            >
                                                {kategoriList.map((k) => (
                                                    <option key={k} value={k}>
                                                        {k} - {kategoriLabel(k)}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="date"
                                                value={data.tanggal}
                                                onChange={(e) =>
                                                    setData(
                                                        "tanggal",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                                required
                                            />
                                        </>
                                    )}
                                    {editData && (
                                        <p className="text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl">
                                            {editData.kategori} •{" "}
                                            {editData.nomor_surat} •{" "}
                                            {formatTgl(editData.tanggal)}
                                        </p>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="Perihal"
                                        value={data.perihal}
                                        onChange={(e) =>
                                            setData("perihal", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tujuan (opsional)"
                                        value={data.tujuan}
                                        onChange={(e) =>
                                            setData("tujuan", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                    />
                                    <textarea
                                        placeholder="Isi surat (opsional)"
                                        value={data.isi}
                                        onChange={(e) =>
                                            setData("isi", e.target.value)
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                        rows={5}
                                    ></textarea>
                                    <input
                                        type="text"
                                        placeholder="Penandatangan"
                                        value={data.penandatangan}
                                        onChange={(e) =>
                                            setData(
                                                "penandatangan",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
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
