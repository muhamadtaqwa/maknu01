import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Santri() {
    const {
        auth,
        presensi,
        tanggal,
        mode,
        hadir,
        tidakHadir,
        rekap,
        bulan,
        tahun,
    } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [selectedDate, setSelectedDate] = useState(tanggal);
    const [activeMode, setActiveMode] = useState(mode || "harian");
    const [activeTab, setActiveTab] = useState("hadir");
    const [nis, setNis] = useState("");
    const [sending, setSending] = useState(false);

    const playBeep = () => {
        try {
            const ctx = new (
                window.AudioContext || window.webkitAudioContext
            )();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 1200;
            gain.gain.value = 0.1;
            osc.start();
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, 300);
        } catch (e) {
            console.log("Audio tidak didukung");
        }
    };

    const handleScan = (nisTerbaca) => {
        setSending(true);
        router.post(
            "/presensi-santri",
            { nis: nisTerbaca },
            {
                onSuccess: () => {
                    playBeep();
                    toast.success("Presensi berhasil!");
                    setNis("");
                    setSending(false);
                },
                onError: (errors) => {
                    toast.error(
                        errors?.error ||
                            "Santri sudah presensi atau data tidak ditemukan.",
                    );
                    setNis("");
                    setSending(false);
                },
            },
        );
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        router.get(
            "/presensi-santri",
            { tanggal: e.target.value, mode: activeMode },
            { preserveState: true },
        );
    };

    const handleModeChange = (m) => {
        setActiveMode(m);
        router.get(
            "/presensi-santri",
            { mode: m, tanggal: selectedDate, bulan, tahun },
            { preserveState: true },
        );
    };

    const handleBulanChange = (e) => {
        router.get(
            "/presensi-santri",
            { mode: "bulanan", bulan: e.target.value, tahun },
            { preserveState: true },
        );
    };

    const handleTahunChange = (e) => {
        router.get(
            "/presensi-santri",
            { mode: "bulanan", bulan, tahun: e.target.value },
            { preserveState: true },
        );
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
                    Presensi Santri
                </h2>

                {/* Input manual NIS - hanya admin & harian */}
                {isAdmin && activeMode === "harian" && (
                    <div className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Masukkan NIS santri"
                                value={nis}
                                onChange={(e) =>
                                    setNis(e.target.value.toUpperCase())
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && nis) {
                                        e.preventDefault();
                                        handleScan(nis);
                                    }
                                }}
                                className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                                autoFocus
                            />
                            <button
                                onClick={() => handleScan(nis)}
                                disabled={!nis || sending}
                                className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-lg disabled:opacity-50"
                            >
                                Simpan
                            </button>
                        </div>

                        {sending && (
                            <p className="text-xs text-slate-400 mt-2">
                                Menyimpan...
                            </p>
                        )}
                    </div>
                )}

                {/* Tab Mode */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {["harian", "mingguan", "bulanan"].map((m) => (
                        <button
                            key={m}
                            onClick={() => handleModeChange(m)}
                            className={`py-2 rounded-full text-xs font-semibold transition ${activeMode === m ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white text-slate-500"}`}
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
                        {/* Sub Tab Hadir / Tidak */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                                onClick={() => setActiveTab("hadir")}
                                className={`py-2 rounded-full text-xs font-semibold transition ${activeTab === "hadir" ? "bg-emerald-500 text-white" : "bg-white text-slate-500"}`}
                            >
                                Hadir ({hadir.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("tidak")}
                                className={`py-2 rounded-full text-xs font-semibold transition ${activeTab === "tidak" ? "bg-red-500 text-white" : "bg-white text-slate-500"}`}
                            >
                                Tidak Hadir ({tidakHadir.length})
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 mb-3">
                            {formatTgl(selectedDate)}
                        </p>

                        {activeTab === "hadir" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {hadir.length === 0 && (
                                    <p className="text-center text-slate-400 py-10">
                                        Belum ada santri hadir
                                    </p>
                                )}
                                {hadir.map((p) => (
                                    <div
                                        key={p.nis}
                                        className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                    {p.nama?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        {p.nama}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {p.nis}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-mono text-slate-400">
                                                {formatJam(p.jam)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "tidak" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {tidakHadir.length === 0 && (
                                    <p className="text-center text-slate-400 py-10">
                                        Semua santri hadir 🎉
                                    </p>
                                )}
                                {tidakHadir.map((p) => (
                                    <div
                                        key={p.nis}
                                        className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {p.nama?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {p.nama}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {p.nis}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* MINGGUAN */}
                {activeMode === "mingguan" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <p className="text-sm text-slate-500 mb-3">
                            Minggu ini
                        </p>
                        {rekap.length === 0 && (
                            <p className="text-center text-slate-400 py-10">
                                Belum ada data
                            </p>
                        )}
                        {rekap.map((r) => (
                            <div
                                key={r.nis}
                                className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-[#3D7ABA] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                            {r.nama?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {r.nama}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {r.nis}
                                            </p>
                                        </div>
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
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* BULANAN */}
                {activeMode === "bulanan" && (
                    <>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {rekap.length === 0 && (
                                <p className="text-center text-slate-400 py-10">
                                    Belum ada data
                                </p>
                            )}
                            {rekap.map((r) => (
                                <div
                                    key={r.nis}
                                    className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-[#3D7ABA] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {r.nama?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {r.nama}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {r.nis}
                                                </p>
                                            </div>
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
