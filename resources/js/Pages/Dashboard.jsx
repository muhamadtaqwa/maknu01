import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { usePage } from "@inertiajs/react";
import {
    BarChart,
    Bar,
    XAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
    const { auth, stats, aktivitas, presensiSantri, grafikPresensi } =
        usePage().props;
    const user = auth.user;
    const [time, setTime] = useState(new Date());
    const [hijri, setHijri] = useState("");

    const nama =
        user.role === "admin"
            ? "Admin Pondok"
            : user.santri?.nama_lengkap || user.ustadz?.nama_lengkap || "User";

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const now = new Date();
        const today = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
        fetch(`https://api.aladhan.com/v1/gToH?date=${today}`)
            .then((res) => res.json())
            .then((data) => {
                const h = data.data?.hijri;
                if (h) setHijri(`${h.day} ${h.month.en} ${h.year}`);
            })
            .catch(() => setHijri(""));
    }, []);

    return (
        <AppLayout>
            <div className="space-y-4">
                {/* Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] p-4 text-white shadow-lg">
                    <h1 className="text-lg font-bold">
                        Assalamu'alaikum, {nama}
                    </h1>
                    <p className="text-xs text-white/70 mt-0.5">
                        Selamat datang di Al-Amanah Mobile
                    </p>
                    <p className="text-xs text-white/50 mt-0.5 capitalize">
                        {user.role}
                    </p>
                    <div className="mt-3 pt-3 border-t border-white/20 space-y-0.5">
                        <p className="text-xs text-white/80">
                            {time.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })}{" "}
                            WIB
                        </p>
                        <p className="text-xs text-white/80">
                            {time.toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        {hijri && (
                            <p className="text-xs text-white/80">{hijri} H</p>
                        )}
                    </div>
                </div>

                {/* ========== ADMIN ========== */}
                {user.role === "admin" && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total Santri
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#3D7ABA]">
                                    {stats?.totalSantri || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total Ustadz
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#20B5E8]">
                                    {stats?.totalUstadz || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Santri Putra
                                </p>
                                <p className="mt-1 text-lg font-bold text-blue-500">
                                    {stats?.santriPutra || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Santri Putri
                                </p>
                                <p className="mt-1 text-lg font-bold text-pink-500">
                                    {stats?.santriPutri || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Belum Bayar
                                </p>
                                <p className="mt-1 text-lg font-bold text-orange-500">
                                    {stats?.totalBelumBayar || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Sudah Bayar
                                </p>
                                <p className="mt-1 text-lg font-bold text-emerald-500">
                                    {stats?.totalSudahBayar || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    User Aktif
                                </p>
                                <p className="mt-1 text-lg font-bold text-indigo-500">
                                    {stats?.userAktif || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total User
                                </p>
                                <p className="mt-1 text-lg font-bold text-purple-500">
                                    {stats?.totalUser || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Kunjungan Hari Ini
                                </p>
                                <p className="mt-1 text-lg font-bold text-amber-600">
                                    {stats?.kunjunganHariIni || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total Kunjungan
                                </p>
                                <p className="mt-1 text-lg font-bold text-pink-500">
                                    {stats?.totalKunjungan || 0}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-2">
                                Aktivitas Terbaru
                            </h2>
                            <div className="space-y-2">
                                {(!aktivitas || aktivitas.length === 0) && (
                                    <p className="text-xs text-slate-400">
                                        Belum ada aktivitas
                                    </p>
                                )}
                                {aktivitas &&
                                    aktivitas.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between text-xs text-slate-600"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#3D7ABA] shrink-0"></div>
                                                {item.teks}
                                            </div>
                                            <span className="text-slate-400 text-[10px] shrink-0 ml-2">
                                                {item.waktu}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ========== USTADZ ========== */}
                {user.role === "ustadz" && (
                    <>
                        {/* Info pribadi */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    NIU
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#3D7ABA]">
                                    {user.ustadz?.niu}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Status
                                </p>
                                <p className="mt-1 text-lg font-bold text-emerald-500">
                                    {user.ustadz?.status
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        user.ustadz?.status?.slice(1)}
                                </p>
                            </div>
                        </div>

                        {/* Statistik - sama seperti admin */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total Santri
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#3D7ABA]">
                                    {stats?.totalSantri || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Total Ustadz
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#20B5E8]">
                                    {stats?.totalUstadz || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Santri Putra
                                </p>
                                <p className="mt-1 text-lg font-bold text-blue-500">
                                    {stats?.santriPutra || 0}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Santri Putri
                                </p>
                                <p className="mt-1 text-lg font-bold text-pink-500">
                                    {stats?.santriPutri || 0}
                                </p>
                            </div>
                        </div>

                        {/* Grafik Presensi Minggu Ini */}
                        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-2">
                                Presensi Santri Minggu Ini
                            </h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={grafikPresensi}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                    />
                                    <XAxis
                                        dataKey="hari"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="hadir"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="tidak"
                                        fill="#ef4444"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Menu cepat */}
                        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-2">
                                Menu Cepat
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href="/presensi"
                                    className="rounded-xl bg-[#3D7ABA]/10 p-3 text-center text-xs font-medium text-[#3D7ABA]"
                                >
                                    Presensi Ustadz
                                </a>
                                <a
                                    href="/presensi-santri"
                                    className="rounded-xl bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-600"
                                >
                                    Presensi Santri
                                </a>
                                <a
                                    href="/timeline"
                                    className="rounded-xl bg-blue-50 p-3 text-center text-xs font-medium text-blue-500"
                                >
                                    Timeline
                                </a>
                                <a
                                    href="/qr"
                                    className="rounded-xl bg-[#20B5E8]/10 p-3 text-center text-xs font-medium text-[#20B5E8]"
                                >
                                    QR Code
                                </a>
                            </div>
                        </div>
                    </>
                )}

                {/* ========== SANTRI ========== */}
                {user.role === "santri" && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    NIS
                                </p>
                                <p className="mt-1 text-lg font-bold text-[#3D7ABA]">
                                    {user.santri?.nis}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] text-slate-400">
                                    Status
                                </p>
                                <p className="mt-1 text-lg font-bold text-emerald-500">
                                    {user.santri?.status
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        user.santri?.status?.slice(1)}
                                </p>
                            </div>
                        </div>

                        {/* Kalender Presensi */}
                        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-3">
                                Presensi Bulan Ini
                            </h2>
                            <CalendarPresensi data={presensiSantri || []} />
                        </div>

                        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-700 mb-2">
                                Menu Cepat
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href="/tagihan"
                                    className="rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-500"
                                >
                                    Tagihan
                                </a>
                                <a
                                    href="/timeline"
                                    className="rounded-xl bg-blue-50 p-3 text-center text-xs font-medium text-blue-500"
                                >
                                    Timeline
                                </a>
                                <a
                                    href="/qr"
                                    className="rounded-xl bg-[#20B5E8]/10 p-3 text-center text-xs font-medium text-[#20B5E8]"
                                >
                                    QR Code
                                </a>
                                <a
                                    href="/profil"
                                    className="rounded-xl bg-slate-100 p-3 text-center text-xs font-medium text-slate-600"
                                >
                                    Profil
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function CalendarPresensi({ data }) {
    const today = new Date();
    const tahun = today.getFullYear();
    const bulan = today.getMonth();

    const firstDay = new Date(tahun, bulan, 1);
    const lastDay = new Date(tahun, bulan + 1, 0);
    const totalDays = lastDay.getDate();
    const startOffset = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startOffset; i++) {
        days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
        days.push(d);
    }

    const namaBulan = new Date(tahun, bulan).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
    });
    const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    return (
        <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">
                {namaBulan}
            </p>
            <div className="grid grid-cols-7 gap-1 mb-1">
                {namaHari.map((h) => (
                    <div
                        key={h}
                        className="text-center text-[10px] text-slate-400 font-medium"
                    >
                        {h}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    if (!day) return <div key={i}></div>;
                    const tglStr = `${tahun}-${String(bulan + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const hadir = data.includes(tglStr);
                    const isFuture = day > today.getDate();
                    return (
                        <div
                            key={i}
                            className={`h-9 rounded-lg flex items-center justify-center text-xs font-medium ${
                                hadir
                                    ? "bg-emerald-500 text-white"
                                    : isFuture
                                      ? "bg-white text-slate-300"
                                      : "bg-slate-100 text-slate-400"
                            }`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
