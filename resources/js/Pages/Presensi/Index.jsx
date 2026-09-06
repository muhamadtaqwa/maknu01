import { useState, useEffect, useRef } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { jadwal, hari, tanggal: tgl, rekap, auth } = usePage().props;
    const isAdmin = auth.user.role === "admin";
    const [tanggal, setTanggal] = useState(
        tgl || new Date().toISOString().split("T")[0],
    );
    const dateRef = useRef(null);

    useEffect(() => {
        if (dateRef.current) {
            dateRef.current.value = "";
            setTimeout(() => {
                const today = new Date().toISOString().split("T")[0];
                dateRef.current.value = today;
                setTanggal(today);
            }, 50);
        }
    }, []);

    const handleSimpan = (niu, status, honorDefault) => {
        router.post(
            "/presensi",
            {
                niu,
                tanggal,
                status,
                honor: status === "hadir" ? honorDefault : 0,
            },
            {
                onSuccess: () => toast.success("Presensi tersimpan!"),
                onError: () => toast.error("Gagal menyimpan presensi."),
            },
        );
    };

    const handleBatal = (id) => {
        if (confirm("Hapus?")) {
            router.delete(`/presensi/${id}`, {
                onSuccess: () => toast.success("Presensi dibatalkan!"),
                onError: () => toast.error("Gagal membatalkan."),
            });
        }
    };

    const totalHonor = rekap.reduce(
        (s, r) => s + parseInt(r.total_honor || 0),
        0,
    );

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

                <div className="mb-3">
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => {
                            setTanggal(e.target.value);
                            router.get(
                                "/presensi",
                                { tanggal: e.target.value },
                                { preserveState: true },
                            );
                        }}
                        className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                    />
                </div>

                <p className="text-sm text-slate-500 mb-3">
                    {formatTgl(tanggal)}
                </p>

                <div className="space-y-3 mb-6">
                    {jadwal.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada jadwal
                        </p>
                    )}
                    {jadwal.map((item) => (
                        <div
                            key={item.niu}
                            className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#009788] rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        {item.nama?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {item.nama}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {item.niu}
                                        </p>
                                    </div>
                                </div>
                                {isAdmin &&
                                    (item.sudah_absen ? (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.status === "hadir" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                                            >
                                                {item.status === "hadir"
                                                    ? "Hadir"
                                                    : "Tidak Hadir"}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleBatal(
                                                        item.presensi_id,
                                                    )
                                                }
                                                className="text-xs text-slate-400 hover:text-red-500 font-medium"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() =>
                                                    handleSimpan(
                                                        item.niu,
                                                        "hadir",
                                                        item.honor_default,
                                                    )
                                                }
                                                className="bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg"
                                            >
                                                Hadir
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleSimpan(
                                                        item.niu,
                                                        "tidak_hadir",
                                                        item.honor_default,
                                                    )
                                                }
                                                className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold"
                                            >
                                                Tidak
                                            </button>
                                        </div>
                                    ))}
                                {!isAdmin && item.sudah_absen && (
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${item.status === "hadir" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                                    >
                                        {item.status === "hadir"
                                            ? "Hadir"
                                            : "Tidak Hadir"}
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                                {item.kitab && (
                                    <Row label="Mapel" value={item.kitab} />
                                )}
                                {isAdmin && (
                                    <Row
                                        label="Honor"
                                        value={`Rp ${item.honor_default?.toLocaleString()}`}
                                    />
                                )}
                                {item.sesi && (
                                    <Row label="Sesi" value={item.sesi} />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Rekap Kehadiran Bulan Ini
                    </h3>
                    {rekap.length === 0 ? (
                        <p className="text-xs text-slate-400">Belum ada data</p>
                    ) : (
                        <div className="space-y-2">
                            {rekap.map((r) => (
                                <div
                                    key={r.niu}
                                    className="rounded-2xl border border-teal-100 bg-white p-4 text-sm"
                                >
                                    <h4 className="font-semibold text-slate-700 mb-2">
                                        {r.ustad?.nama_lengkap || r.niu}
                                    </h4>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-slate-500">
                                            Hadir
                                        </span>
                                        <span className="font-medium text-slate-700">
                                            {r.total_hadir}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            Tidak
                                        </span>
                                        <span className="font-medium text-slate-700">
                                            {r.total_tidak_hadir}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-slate-500">
                                                    Honor
                                                </span>
                                                <span className="font-bold text-[#009788] font-mono">
                                                    Rp{" "}
                                                    {parseInt(
                                                        r.total_honor || 0,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {isAdmin && (
                                <div className="rounded-2xl bg-[#009788]/10 p-4 flex items-center justify-between text-sm font-bold">
                                    <span className="text-[#009788]">
                                        Total Honor
                                    </span>
                                    <span className="text-[#009788] font-mono">
                                        Rp {totalHonor.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
