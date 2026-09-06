import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";
import { Plus, X, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { suratPerJuz } from "@/Services/DataTahfidz";

export default function Index() {
    const {
        santris,
        penyimak,
        rekap,
        rekapBulanan,
        bulan,
        tahun,
        auth,
        isSantriBiasa,
    } = usePage().props;

    const nisPenyimak = ["PA04", "PI04", "PI10", "PI11"];
    const isSantri = auth.user.role === "santri";
    const canInput =
        auth.user.role === "admin" ||
        auth.user.role === "ustadz" ||
        (isSantri && nisPenyimak.includes(auth.user.santri?.nis));

    const [activeTab, setActiveTab] = useState("riwayat");
    const [showPopup, setShowPopup] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const [suratList, setSuratList] = useState(suratPerJuz[1] || []);

    const [form, setForm] = useState({
        nis: "",
        juz: "1",
        surat: "",
        sampai_ayat: "",
        tanggal: new Date().toISOString().slice(0, 10),
        keterangan: "lanjut",
        penyimak: "",
    });

    const formatTanggal = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl + "T12:00:00").toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleJuzChange = (juz) => {
        setForm({ ...form, juz: juz, surat: "" });
        setSuratList(suratPerJuz[juz] || []);
    };

    const openInput = () => {
        setEditMode(false);
        setEditId(null);
        setForm({
            nis: "",
            juz: "1",
            surat: "",
            sampai_ayat: "",
            tanggal: new Date().toISOString().slice(0, 10),
            keterangan: "lanjut",
            penyimak: "",
        });
        setSuratList(suratPerJuz[1] || []);
        setShowPopup(true);
    };

    const openEdit = (r) => {
        const s = r.setoran_terakhir;
        if (!s) return;
        setEditMode(true);
        setEditId(s.id);
        setForm({
            nis: r.nis,
            juz: String(s.juz),
            surat: String(s.surat_id),
            sampai_ayat: String(s.sampai_ayat),
            tanggal: s.tanggal,
            keterangan: s.keterangan,
            penyimak: s.penyimak_nis,
        });
        setSuratList(suratPerJuz[s.juz] || []);
        setShowPopup(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editMode) {
            router.put(`/tahfidz/${editId}`, form, {
                onSuccess: () => {
                    toast.success("Setoran tahfidz diupdate!");
                    setShowPopup(false);
                },
                onError: () => toast.error("Gagal mengupdate setoran."),
            });
        } else {
            router.post("/tahfidz", form, {
                onSuccess: () => {
                    toast.success("Setoran tahfidz dicatat!");
                    setShowPopup(false);
                },
                onError: () => toast.error("Gagal mencatat setoran."),
            });
        }
    };

    const bulanSebelumnya = () => {
        let b = bulan - 1;
        let t = tahun;
        if (b < 1) {
            b = 12;
            t--;
        }
        router.get(
            "/tahfidz",
            { tab: "rekap", bulan: b, tahun: t },
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
            "/tahfidz",
            { tab: "rekap", bulan: b, tahun: t },
            { preserveState: true },
        );
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "rekap") {
            router.get(
                "/tahfidz",
                { tab: "rekap", bulan, tahun },
                { preserveState: true },
            );
        }
    };

    const filtered = rekap.filter(
        (r) =>
            r.nama?.toLowerCase().includes(search.toLowerCase()) ||
            r.nis?.toLowerCase().includes(search.toLowerCase()),
    );

    const filteredBulanan = rekapBulanan.filter(
        (r) =>
            r.nama?.toLowerCase().includes(search.toLowerCase()) ||
            r.nis?.toLowerCase().includes(search.toLowerCase()),
    );

    const namaBulan = new Date(tahun, bulan - 1).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    });

    const renderKalender = (tanggalSetoran) => {
        const firstDay = new Date(tahun, bulan - 1, 1);
        const lastDay = new Date(tahun, bulan, 0);
        const totalDays = lastDay.getDate();
        const startOffset = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startOffset; i++) days.push(null);
        for (let d = 1; d <= totalDays; d++) days.push(d);

        return (
            <div className="grid grid-cols-7 gap-0.5 mt-2">
                {["M", "S", "S", "R", "K", "J", "S"].map((h, i) => (
                    <div
                        key={i}
                        className="text-center text-[9px] text-slate-400 font-medium"
                    >
                        {h}
                    </div>
                ))}
                {days.map((day, i) => {
                    if (!day) return <div key={i}></div>;
                    const tglStr = `${tahun}-${String(bulan).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSetoran = tanggalSetoran.includes(tglStr);
                    return (
                        <div
                            key={i}
                            className={`h-7 rounded-md flex items-center justify-center text-[10px] font-medium ${isSetoran ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Program Tahfidz
                    </h2>
                    {canInput && (
                        <button
                            onClick={openInput}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg"
                        >
                            + Input
                        </button>
                    )}
                </div>

                {/* Tab */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        onClick={() => handleTabChange("riwayat")}
                        className={`py-2 rounded-full text-xs font-semibold transition ${activeTab === "riwayat" ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500"}`}
                    >
                        Riwayat
                    </button>
                    <button
                        onClick={() => handleTabChange("rekap")}
                        className={`py-2 rounded-full text-xs font-semibold transition ${activeTab === "rekap" ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500"}`}
                    >
                        Rekap Bulanan
                    </button>
                </div>

                {!isSantriBiasa && (
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Cari nama atau NIS..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none"
                        />
                    </div>
                )}

                {/* TAB RIWAYAT */}
                {activeTab === "riwayat" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filtered.length === 0 && (
                            <p className="text-center text-slate-400 py-10 md:col-span-2">
                                Tidak ada data
                            </p>
                        )}
                        {filtered.map((r) => (
                            <div
                                key={r.nis}
                                className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-2 gap-2">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                            {r.nama?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm break-words">
                                                {r.nama}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {r.nis}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {canInput && r.setoran_terakhir && (
                                            <button
                                                onClick={() => openEdit(r)}
                                                className="w-7 h-7 rounded-full bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] flex items-center justify-center text-white shadow-md hover:scale-110 transition"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                        )}
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-600">
                                                Juz {r.juz_terakhir}/30
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {r.progress}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full"
                                        style={{ width: `${r.progress}%` }}
                                    ></div>
                                </div>

                                {r.setoran_terakhir && (
                                    <div className="space-y-1 mb-2">
                                        <Row
                                            label="Surat"
                                            value={r.setoran_terakhir.surat}
                                        />
                                        <Row
                                            label="Sampai Ayat"
                                            value={
                                                r.setoran_terakhir.sampai_ayat
                                            }
                                        />
                                        <Row
                                            label="Penyimak"
                                            value={r.setoran_terakhir.penyimak}
                                        />
                                        <Row
                                            label="Tanggal"
                                            value={formatTanggal(
                                                r.setoran_terakhir.tanggal,
                                            )}
                                        />
                                        <div className="flex justify-between">
                                            <span className="text-[11px] text-slate-400">
                                                Keterangan
                                            </span>
                                            <span
                                                className={`text-[11px] font-semibold ${r.setoran_terakhir.keterangan === "lanjut" ? "text-emerald-600" : "text-red-500"}`}
                                            >
                                                {r.setoran_terakhir
                                                    .keterangan === "lanjut"
                                                    ? "Ziyadah"
                                                    : "Muraja'ah"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB REKAP PER BULAN */}
                {activeTab === "rekap" && (
                    <>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredBulanan.length === 0 && (
                                <p className="text-center text-slate-400 py-10 md:col-span-2">
                                    Tidak ada data
                                </p>
                            )}
                            {filteredBulanan.map((r) => (
                                <div
                                    key={r.nis}
                                    className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                                {r.nama?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm break-words">
                                                    {r.nama}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {r.nis}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600 shrink-0">
                                            {r.total_setoran}x Setoran
                                        </span>
                                    </div>

                                    {renderKalender(r.tanggal_setoran)}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Popup Input/Edit */}
                {showPopup && canInput && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowPopup(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">
                                    {editMode ? "Edit" : "Input"} Setoran
                                    Tahfidz
                                </h3>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {!editMode && (
                                    <select
                                        value={form.nis}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                nis: e.target.value,
                                            })
                                        }
                                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                        required
                                    >
                                        <option value="">Pilih Santri</option>
                                        {santris.map((s) => (
                                            <option key={s.nis} value={s.nis}>
                                                {s.nama_lengkap} ({s.nis})
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <select
                                    value={form.juz}
                                    onChange={(e) =>
                                        handleJuzChange(e.target.value)
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    required
                                >
                                    {Array.from(
                                        { length: 30 },
                                        (_, i) => i + 1,
                                    ).map((j) => (
                                        <option key={j} value={j}>
                                            Juz {j}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={form.surat}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            surat: e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    required
                                >
                                    <option value="">Pilih Surat</option>
                                    {suratList.map((s) => (
                                        <option
                                            key={`surat-${s.id}`}
                                            value={s.id}
                                        >
                                            {s.nama}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    placeholder="Sampai Ayat"
                                    value={form.sampai_ayat}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            sampai_ayat: e.target.value,
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

                                <select
                                    value={form.keterangan}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            keterangan: e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    required
                                >
                                    <option value="lanjut">Ziyadah</option>
                                    <option value="ulang">Muraja'ah</option>
                                </select>

                                <select
                                    value={form.penyimak}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            penyimak: e.target.value,
                                        })
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                    required
                                >
                                    <option value="">Pilih Penyimak</option>
                                    {penyimak.map((p) => (
                                        <option key={p.nis} value={p.nis}>
                                            {p.nama_lengkap} ({p.nis})
                                        </option>
                                    ))}
                                </select>

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
                                        {editMode ? "Update" : "Simpan"}
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
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="text-[11px] font-medium text-slate-600 text-right ml-4">
            {value || "-"}
        </span>
    </div>
);
