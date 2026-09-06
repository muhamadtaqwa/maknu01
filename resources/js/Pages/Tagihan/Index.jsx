import { useState, useRef } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { tagihan, rekening } = usePage().props;
    const [filter, setFilter] = useState("semua");
    const [showUpload, setShowUpload] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const [fileName, setFileName] = useState("");
    const fileRef = useRef(null);

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

    const handleUpload = (id) => {
        const file = fileRef.current?.files[0];
        if (!file) return toast.error("Pilih file dulu");
        setUploadingId(id);
        const formData = new FormData();
        formData.append("bukti", file);
        router.post(`/pembayaran/${id}/upload-bukti`, formData, {
            onSuccess: () => {
                setShowUpload(null);
                setFileName("");
                setUploadingId(null);
                toast.success("Bukti berhasil diupload!");
            },
            onError: () => {
                toast.error("Gagal upload. Coba lagi.");
                setUploadingId(null);
            },
            forceFormData: true,
        });
    };

    const filtered =
        filter === "semua"
            ? tagihan
            : tagihan.filter((t) => t.status === filter);

    const totalSemua = tagihan.reduce(
        (s, t) => s + parseInt(t.nominal || 0),
        0,
    );
    const totalBelum = tagihan
        .filter((t) => t.status === "menunggu" || t.status === "dicicil")
        .reduce((s, t) => s + (t.sisa || 0), 0);
    const totalLunas = tagihan
        .filter((t) => t.status === "lunas")
        .reduce((s, t) => s + parseInt(t.nominal || 0), 0);

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Tagihan
                </h2>

                <div className="space-y-2 mb-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Total Semua
                        </span>
                        <span className="text-base font-extrabold text-[#3D7ABA] font-mono tracking-tight">
                            Rp {parseInt(totalSemua || 0).toLocaleString()}
                        </span>
                    </div>
                    {totalLunas > 0 && (
                        <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                            <span className="text-sm text-slate-500">
                                Lunas
                            </span>
                            <span className="text-base font-extrabold text-emerald-600 font-mono tracking-tight">
                                Rp {parseInt(totalLunas || 0).toLocaleString()}
                            </span>
                        </div>
                    )}
                    {totalBelum > 0 && (
                        <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                            <span className="text-sm text-slate-500">
                                Belum Lunas
                            </span>
                            <span className="text-base font-extrabold text-red-500 font-mono tracking-tight">
                                Rp {parseInt(totalBelum || 0).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {rekening && (
                    <div className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl mb-4">
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">
                            Rekening Yayasan
                        </h4>
                        <Row label="Bank" value={rekening.bank} />
                        <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">No. Rekening</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-600">
                                    {rekening.nomor_rekening}
                                </span>
                                <button
                                    onClick={() =>
                                        salin(rekening.nomor_rekening)
                                    }
                                    className="text-slate-400 hover:text-[#3D7ABA] transition"
                                    aria-label="Salin nomor rekening"
                                >
                                    <i className="fa-solid fa-copy text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <Row label="Atas Nama" value={rekening.atas_nama} />
                    </div>
                )}

                {/* Kontak WA Pondok */}
                <div className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl mb-4">
                    <h4 className="text-xs font-semibold text-slate-500 mb-2">
                        Kontak Pondok
                    </h4>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">No. WhatsApp</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-600">
                                085708075004
                            </span>
                            <button
                                onClick={() => salin("085708075004")}
                                className="text-slate-400 hover:text-[#3D7ABA] transition"
                                aria-label="Salin nomor WhatsApp"
                            >
                                <i className="fa-solid fa-copy text-xs"></i>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] mt-1">
                        <span className="text-slate-400">Tautan Chat</span>
                        <a
                            href="https://wa.me/6285708075004"
                            target="_blank"
                            className="font-medium text-emerald-600 hover:underline"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    {["semua", "menunggu", "lunas"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`py-2 rounded-full text-xs font-medium transition ${filter === f ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500"}`}
                        >
                            {f === "semua"
                                ? "Semua"
                                : f === "menunggu"
                                  ? "Belum"
                                  : "Lunas"}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-slate-400 py-10 sm:col-span-2">
                            Tidak ada tagihan
                        </p>
                    )}
                    {filtered.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full">
                                        {t.jenis}
                                    </span>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.status === "lunas" ? "bg-emerald-50 text-emerald-600" : t.status === "ditolak" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}
                                    >
                                        {t.status === "lunas"
                                            ? "Lunas"
                                            : t.status === "ditolak"
                                              ? "Ditolak"
                                              : "Menunggu"}
                                    </span>
                                </div>
                                <p className="text-base font-bold font-mono tracking-tight">
                                    Rp{" "}
                                    {parseInt(t.nominal || 0).toLocaleString()}
                                </p>
                            </div>
                            <h3 className="font-semibold text-sm truncate mb-2">
                                {t.nama_pembayaran
                                    ?.replace("Kas Bulanan - ", "")
                                    .replace("SPP - ", "")
                                    .replace(` - ${t.santri?.nama_lengkap}`, "")
                                    .trim()}
                            </h3>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                                <Row label="NIS" value={t.nis} />
                                <Row
                                    label="Santri"
                                    value={t.santri?.nama_lengkap}
                                />
                                {t.total_dibayar > 0 && (
                                    <>
                                        <Row
                                            label="Dibayar"
                                            value={`Rp ${parseInt(t.total_dibayar || 0).toLocaleString()}`}
                                        />
                                        <Row
                                            label="Sisa"
                                            value={`Rp ${parseInt(t.sisa || 0).toLocaleString()}`}
                                        />
                                    </>
                                )}
                            </div>
                            {t.total_dibayar > 0 && (
                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 mb-3">
                                    <div
                                        className="bg-emerald-500 h-1.5 rounded-full"
                                        style={{
                                            width: `${(t.total_dibayar / t.nominal) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            )}
                            {t.status !== "lunas" && (
                                <div className="pt-3 border-t">
                                    {t.bukti ? (
                                        <p className="text-xs text-[#3D7ABA] bg-[#3D7ABA]/5 px-3 py-2 rounded-2xl">
                                            ✅ Bukti diupload - Menunggu
                                            verifikasi
                                        </p>
                                    ) : (
                                        <>
                                            {showUpload === t.id ? (
                                                <div>
                                                    <label className="flex items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-3 cursor-pointer hover:border-[#20B5E8] transition mb-2">
                                                        {fileName ? (
                                                            <span className="text-xs text-emerald-600 font-medium">
                                                                📄 {fileName}
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <i className="fa-solid fa-cloud-upload text-slate-400"></i>
                                                                <span className="text-xs text-slate-500">
                                                                    Klik untuk
                                                                    pilih file
                                                                </span>
                                                            </>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={fileRef}
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file =
                                                                    e.target
                                                                        .files[0];
                                                                if (file)
                                                                    setFileName(
                                                                        file.name,
                                                                    );
                                                            }}
                                                        />
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleUpload(
                                                                    t.id,
                                                                )
                                                            }
                                                            disabled={
                                                                uploadingId ===
                                                                t.id
                                                            }
                                                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg disabled:opacity-50"
                                                        >
                                                            {uploadingId ===
                                                            t.id
                                                                ? "Mengupload..."
                                                                : "Upload"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowUpload(
                                                                    null,
                                                                );
                                                                setFileName("");
                                                            }}
                                                            className="text-xs text-slate-400"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setShowUpload(t.id)
                                                    }
                                                    className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg"
                                                >
                                                    Upload Bukti Transfer
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

const Row = ({ label, value }) => (
    <div className="flex justify-between text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-600 text-right ml-4">
            {value || "-"}
        </span>
    </div>
);
