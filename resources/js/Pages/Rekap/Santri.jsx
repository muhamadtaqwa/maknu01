import { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function Santri() {
    const { santris, filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleSearch = (value) => {
        setSearch(value);
        router.get(
            "/rekap/santri",
            { search: value },
            { preserveState: true, replace: true },
        );
    };

    const handleLihat = async (nis) => {
        setShowPopup(true);
        setLoading(true);
        try {
            const res = await fetch(`/api/rekap/santri/${nis}`, {
                headers: { Accept: "application/json" },
            });
            const data = await res.json();
            setSelected(data.santri);
            setDetail(data.rekap);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Rekap Per Santri
                </h2>

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

                <input
                    type="text"
                    placeholder="Cari nama atau NIS..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none mb-4"
                />

                {/* 2 Kolom di desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {santris.data.length === 0 && (
                        <p className="text-center text-slate-400 py-10 md:col-span-2">
                            Tidak ada data
                        </p>
                    )}
                    {santris.data.map((s) => (
                        <div
                            key={s.nis}
                            className="rounded-2xl p-4 flex items-center gap-3 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                {s.nama_lengkap?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                    {s.nama_lengkap}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {s.nis}
                                </p>
                            </div>
                            <button
                                onClick={() => handleLihat(s.nis)}
                                className="text-xs bg-[#3D7ABA]/10 text-[#3D7ABA] px-3 py-1.5 rounded-full font-medium hover:bg-[#3D7ABA]/20 transition shrink-0"
                            >
                                Lihat
                            </button>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {santris.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() =>
                                router.get(
                                    santris.prev_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            disabled={!santris.prev_page_url}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="text-xs text-slate-400">
                            Halaman {santris.current_page} dari{" "}
                            {santris.last_page}
                        </span>
                        <button
                            onClick={() =>
                                router.get(
                                    santris.next_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            disabled={!santris.next_page_url}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}

                {showPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowPopup(false)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-md p-6 border border-sky-100 max-h-[80vh] overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-slate-400 py-8">
                                    Memuat...
                                </p>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-[#3D7ABA] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {selected?.nama_lengkap?.charAt(
                                                    0,
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#3D7ABA]">
                                                    {selected?.nama_lengkap}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {selected?.nis}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowPopup(false)}
                                            className="text-slate-400 hover:text-slate-600 text-lg"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {detail?.map((d) => (
                                            <div
                                                key={d.jenis}
                                                className="bg-slate-50 rounded-2xl p-3"
                                            >
                                                <div className="flex justify-between text-sm font-medium mb-1">
                                                    <span>{d.jenis}</span>
                                                    <span
                                                        className={
                                                            d.total_belum === 0
                                                                ? "text-emerald-600"
                                                                : "text-red-500"
                                                        }
                                                    >
                                                        {d.total_belum === 0
                                                            ? "Lunas"
                                                            : `${d.total_belum} Belum`}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 space-y-0.5">
                                                    <Row
                                                        label="Total"
                                                        value={`Rp ${parseInt(d.total_nominal).toLocaleString()}`}
                                                    />
                                                    <Row
                                                        label="Lunas"
                                                        value={`Rp ${parseInt(d.nominal_lunas).toLocaleString()}`}
                                                    />
                                                    <Row
                                                        label="Belum"
                                                        value={`Rp ${parseInt(d.nominal_belum).toLocaleString()}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
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
