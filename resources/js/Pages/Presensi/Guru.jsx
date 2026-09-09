import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Guru() {
    const {
        auth,
        presensi,
        tanggal,
        mode,
        hadir,
        belumHadir,
        rekap,
        bulan,
        tahun,
    } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [selectedDate, setSelectedDate] = useState(tanggal);
    const [activeMode, setActiveMode] = useState(mode || "harian");
    const [activeTab, setActiveTab] = useState("hadir");

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        router.get(
            "/presensi-guru",
            { tanggal: e.target.value, mode: activeMode },
            { preserveState: true },
        );
    };

    const handleModeChange = (m) => {
        setActiveMode(m);
        router.get(
            "/presensi-guru",
            { mode: m, tanggal: selectedDate, bulan, tahun },
            { preserveState: true },
        );
    };

    const handleBulanChange = (e) => {
        router.get(
            "/presensi-guru",
            { mode: "bulanan", bulan: e.target.value, tahun },
            { preserveState: true },
        );
    };

    const handleTahunChange = (e) => {
        router.get(
            "/presensi-guru",
            { mode: "bulanan", bulan, tahun: e.target.value },
            { preserveState: true },
        );
    };

    const handleBatalkan = (id) => {
        if (!confirm("Batalkan presensi ini?")) return;
        router.delete(`/presensi-guru/${id}`, {
            onSuccess: () => toast.success("Presensi dibatalkan."),
            onError: () => toast.error("Gagal membatalkan."),
        });
    };

    const formatJam = (jam) => jam?.slice(0, 5);

    const formatTgl = (tgl) =>
        new Date(tgl + "T12:00:00").toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Presensi Guru
                </h2>

                {/* Tab Mode */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {["harian", "mingguan", "bulanan"].map((m) => (
                        <button
                            key={m}
                            onClick={() => handleModeChange(m)}
                            className={`py-2 rounded-full text-xs font-semibold transition ${activeMode === m ? "bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white shadow-lg" : "bg-white text-slate-500"}`}
                        >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tanggal - hanya harian */}
                {activeMode === "harian" && (
                    <div className="mb-3">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                        />
                    </div>
                )}

                {/* HARIAN */}
                {activeMode === "harian" && (
                    <>
                        {/* Sub Tab Hadir / Belum */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                                onClick={() => setActiveTab("hadir")}
                                className={`py-2 rounded-full text-xs font-semibold transition ${activeTab === "hadir" ? "bg-emerald-500 text-white" : "bg-white text-slate-500"}`}
                            >
                                Hadir ({hadir.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("belum")}
                                className={`py-2 rounded-full text-xs font-semibold transition ${activeTab === "belum" ? "bg-red-500 text-white" : "bg-white text-slate-500"}`}
                            >
                                Belum Hadir ({belumHadir.length})
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 mb-3">
                            {formatTgl(selectedDate)}
                        </p>

                        {activeTab === "hadir" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {hadir.length === 0 && (
                                    <p className="text-center text-slate-400 py-10">
                                        Belum ada guru hadir
                                    </p>
                                )}
                                {hadir.map((p) => (
                                    <div
                                        key={p.id}
                                        className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                    {p.nama?.charAt(0)}
                                                </div>
                                                <p className="font-semibold text-sm">
                                                    {p.nama}
                                                </p>
                                            </div>
                                            {p.status === "terlambat" && (
                                                <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                                                    Terlambat
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">
                                                    Jam Masuk
                                                </span>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {formatJam(p.jam_masuk)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">
                                                    Jam Pulang
                                                </span>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {formatJam(p.jam_pulang) ||
                                                        "-"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">
                                                    Jarak
                                                </span>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {p.jarak
                                                        ? `${p.jarak} meter`
                                                        : "-"}
                                                </span>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="mt-3 pt-3 border-t border-slate-100">
                                                <button
                                                    onClick={() =>
                                                        handleBatalkan(p.id)
                                                    }
                                                    className="w-full bg-red-500 text-white px-3 py-2 rounded-full text-xs font-semibold hover:bg-red-600 transition-all"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "belum" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {belumHadir.length === 0 && (
                                    <p className="text-center text-slate-400 py-10">
                                        Semua guru sudah hadir
                                    </p>
                                )}
                                {belumHadir.map((p) => (
                                    <div
                                        key={p.guru_id}
                                        className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {p.nama?.charAt(0)}
                                            </div>
                                            <p className="font-semibold text-sm">
                                                {p.nama}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* MINGGUAN & BULANAN */}
                {(activeMode === "mingguan" || activeMode === "bulanan") && (
                    <>
                        {activeMode === "bulanan" && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <select
                                    value={bulan}
                                    onChange={handleBulanChange}
                                    className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                >
                                    {Array.from(
                                        { length: 12 },
                                        (_, i) => i + 1,
                                    ).map((b) => (
                                        <option key={b} value={b}>
                                            {new Date(
                                                2024,
                                                b - 1,
                                            ).toLocaleDateString("id-ID", {
                                                month: "long",
                                            })}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={tahun}
                                    onChange={handleTahunChange}
                                    className="border border-slate-200 rounded-2xl px-4 py-2.5 text-sm bg-white outline-none"
                                >
                                    {Array.from(
                                        { length: 5 },
                                        (_, i) => new Date().getFullYear() - i,
                                    ).map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {activeMode === "mingguan" && (
                            <p className="text-sm text-slate-500 mb-3">
                                Minggu ini
                            </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {rekap.length === 0 && (
                                <p className="text-center text-slate-400 py-10">
                                    Belum ada data
                                </p>
                            )}
                            {rekap.map((r) => (
                                <div
                                    key={r.guru_id}
                                    className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-[#009788] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {r.nama?.charAt(0)}
                                            </div>
                                            <p className="font-semibold text-sm">
                                                {r.nama}
                                            </p>
                                        </div>
                                        <div className="flex gap-3 text-center">
                                            <div>
                                                <p className="text-sm font-bold text-emerald-600">
                                                    {r.total_hadir}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Hadir
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-red-500">
                                                    {r.total_tidak}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Tidak
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-amber-500">
                                                    {r.total_terlambat || 0}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Terlambat
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
