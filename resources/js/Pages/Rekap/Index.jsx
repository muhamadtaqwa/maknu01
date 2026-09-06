import { usePage, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    BarChart,
    Bar,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

export default function Index() {
    const { rekap, totalSemua, totalLunas, totalBelum } = usePage().props;

    const menu = [
        {
            label: "Santri",
            path: "/rekap/santri",
            bg: "bg-[#3D7ABA]/10",
            text: "text-[#3D7ABA]",
        },
        {
            label: "SPP",
            path: "/rekap/spp",
            bg: "bg-[#20B5E8]/10",
            text: "text-[#20B5E8]",
        },
        {
            label: "Kitab",
            path: "/rekap/kitab",
            bg: "bg-orange-50",
            text: "text-orange-600",
        },
        {
            label: "Kas",
            path: "/rekap/kas",
            bg: "bg-pink-50",
            text: "text-pink-600",
        },
        {
            label: "Anjem",
            path: "/rekap/anjem",
            bg: "bg-purple-50",
            text: "text-purple-600",
        },
    ];

    const COLORS = ["#3D7ABA", "#20B5E8", "#f97316", "#ec4899"];
    const pieData = [
        { name: "Lunas", value: totalLunas },
        { name: "Belum", value: totalBelum },
    ];
    const PIE_COLORS = ["#10b981", "#ef4444"];
    const formatRupiah = (value) => `Rp ${value.toLocaleString()}`;

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Rekap Pembayaran
                </h2>

                {/* Ringkasan */}
                <div className="space-y-2 mb-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Total Semua
                        </span>
                        <span className="text-base font-extrabold text-[#3D7ABA] font-mono tracking-tight">
                            {formatRupiah(totalSemua)}
                        </span>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">Lunas</span>
                        <span className="text-base font-extrabold text-emerald-600 font-mono tracking-tight">
                            {formatRupiah(totalLunas)}
                        </span>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm flex justify-between items-center">
                        <span className="text-sm text-slate-500">
                            Belum Lunas
                        </span>
                        <span className="text-base font-extrabold text-red-500 font-mono tracking-tight">
                            {formatRupiah(totalBelum)}
                        </span>
                    </div>
                </div>

                {/* Menu Pilih Jenis Rekap */}
                <p className="text-sm font-bold text-slate-400 uppercase mb-3">
                    Pilih jenis rekap
                </p>
                <div className="grid grid-cols-5 gap-2 mb-4">
                    {menu.map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`${m.bg} rounded-2xl p-3 text-center active:scale-[0.98] transition-all hover:shadow-md`}
                        >
                            <span
                                className={`font-semibold text-[11px] ${m.text}`}
                            >
                                {m.label}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Grafik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl">
                        <h3 className="text-sm font-bold text-slate-700 mb-2">
                            Total per Jenis
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={rekap}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e2e8f0"
                                />
                                <XAxis
                                    dataKey="jenis"
                                    tick={{ fontSize: 12, fill: "#64748b" }}
                                />
                                <Tooltip
                                    formatter={(value) => formatRupiah(value)}
                                />
                                <Bar
                                    dataKey="total_nominal"
                                    radius={[8, 8, 0, 0]}
                                >
                                    {rekap.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2">
                            {rekap.map((item, index) => (
                                <div
                                    key={item.jenis}
                                    className="flex items-center gap-1.5"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: COLORS[index] }}
                                    ></div>
                                    <span className="text-[10px] text-slate-500">
                                        {item.jenis}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-sky-100 bg-white p-4 shadow-2xl">
                        <h3 className="text-sm font-bold text-slate-700 mb-2">
                            Lunas vs Belum
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={PIE_COLORS[index]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatRupiah(value)}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ background: "#10b981" }}
                                ></div>
                                <span className="text-[10px] text-slate-500">
                                    Lunas
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ background: "#ef4444" }}
                                ></div>
                                <span className="text-[10px] text-slate-500">
                                    Belum
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
