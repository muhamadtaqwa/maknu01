import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Verifikasi() {
    const { pendaftar, filters } = usePage().props;
    const [filter, setFilter] = useState(filters.status || "semua");
    const [search, setSearch] = useState(filters.search || "");
    const [detail, setDetail] = useState(null);
    const [confirmTerima, setConfirmTerima] = useState(null);
    const [confirmTolak, setConfirmTolak] = useState(null);
    const [confirmBatal, setConfirmBatal] = useState(null);
    const [catatan, setCatatan] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleFilter = (value) => {
        setFilter(value);
        router.get(
            "/psb/verifikasi",
            {
                status: value,
                search: search,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleSearch = (value) => {
        setSearch(value);
        router.get(
            "/psb/verifikasi",
            {
                status: filter,
                search: value,
            },
            { preserveState: true, replace: true },
        );
    };

    const formatTgl = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const handleVerifikasi = (id, status) => {
        setSubmitting(true);
        router.put(
            `/psb/${id}/verifikasi`,
            {
                status: status,
                catatan: status === "ditolak" ? catatan : null,
            },
            {
                onSuccess: () => {
                    setConfirmTerima(null);
                    setConfirmTolak(null);
                    setDetail(null);
                    setCatatan("");
                    toast.success(
                        status === "diterima"
                            ? "Pendaftar diterima!"
                            : "Pendaftar ditolak!",
                    );
                },
                onError: () => toast.error("Gagal memverifikasi."),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const handleBatalkan = (id) => {
        router.put(
            `/psb/${id}/batalkan`,
            {},
            {
                onSuccess: () => {
                    setConfirmBatal(null);
                    setDetail(null);
                    toast.success("Status dikembalikan ke menunggu.");
                },
                onError: () => toast.error("Gagal membatalkan."),
            },
        );
    };

    const countMenunggu =
        pendaftar.total > 0
            ? pendaftar.data.filter((p) => p.status === "menunggu").length
            : 0;

    return (
        <AppLayout>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Verifikasi PSB
                    </h2>
                    <div className="flex gap-2">
                        <a
                            href="/psb"
                            target="_blank"
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            Form PSB
                        </a>
                        <a
                            href="/psb/cek"
                            target="_blank"
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-lg"
                        >
                            Cek Status
                        </a>
                    </div>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cari nama, NIK, atau NISN..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none"
                    />
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                    {["semua", "menunggu", "diterima", "ditolak"].map((f) => (
                        <button
                            key={f}
                            onClick={() => handleFilter(f)}
                            className={`py-2 rounded-full text-xs font-medium transition ${filter === f ? "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-lg" : "bg-white border border-slate-200 text-slate-500"}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {pendaftar.data.length === 0 && (
                        <p className="text-center text-slate-400 py-10">
                            Tidak ada data
                        </p>
                    )}
                    {pendaftar.data.map((p) => (
                        <div
                            key={p.id}
                            onClick={() =>
                                setDetail(detail?.id === p.id ? null : p)
                            }
                            className="rounded-[30px] border border-sky-100 bg-white p-5 shadow-2xl cursor-pointer hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                                            {p.nik}
                                        </span>
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === "menunggu" ? "bg-amber-50 text-amber-600" : p.status === "diterima" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
                                        >
                                            {p.status.charAt(0).toUpperCase() +
                                                p.status.slice(1)}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm truncate">
                                        {p.nama_lengkap}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {p.program_studi} • {p.nomor_hp}
                                    </p>
                                </div>
                                <i
                                    className={`fa-solid fa-chevron-${detail?.id === p.id ? "up" : "down"} text-slate-300 ml-2`}
                                ></i>
                            </div>

                            {detail?.id === p.id && (
                                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                                    <Row label="NIK" value={p.nik} />
                                    <Row label="NISN" value={p.nisn} />
                                    <Row label="Nama" value={p.nama_lengkap} />
                                    <Row
                                        label="Tempat, Tgl Lahir"
                                        value={`${p.tempat_lahir || "-"}, ${formatTgl(p.tanggal_lahir)}`}
                                    />
                                    <Row
                                        label="Jenis Kelamin"
                                        value={
                                            p.jenis_kelamin === "laki-laki"
                                                ? "Laki-laki"
                                                : p.jenis_kelamin ===
                                                    "perempuan"
                                                  ? "Perempuan"
                                                  : "-"
                                        }
                                    />
                                    <Row
                                        label="Program Studi"
                                        value={p.program_studi}
                                    />
                                    <Row label="Angkatan" value={p.angkatan} />
                                    <Row label="Nomor HP" value={p.nomor_hp} />
                                    <Row
                                        label="Alamat"
                                        value={`${p.alamat || "-"}, ${p.desa || "-"}, ${p.kecamatan || "-"}, ${p.kabupaten || "-"}, ${p.provinsi || "-"}`}
                                    />
                                    <hr className="border-slate-100" />
                                    <p className="font-semibold text-slate-600">
                                        Orang Tua
                                    </p>
                                    <Row
                                        label="Nama Ayah"
                                        value={p.nama_ayah}
                                    />
                                    <Row label="NIK Ayah" value={p.nik_ayah} />
                                    <Row
                                        label="Pekerjaan Ayah"
                                        value={p.pekerjaan_ayah}
                                    />
                                    <Row label="Nama Ibu" value={p.nama_ibu} />
                                    <Row label="NIK Ibu" value={p.nik_ibu} />
                                    <Row
                                        label="Pekerjaan Ibu"
                                        value={p.pekerjaan_ibu}
                                    />
                                    <Row
                                        label="No HP Orang Tua"
                                        value={p.no_hp_orang_tua}
                                    />

                                    {/* Bukti Pembayaran */}
                                    {p.bukti_pembayaran && (
                                        <>
                                            <hr className="border-slate-100" />
                                            <p className="font-semibold text-slate-600">
                                                Bukti Pembayaran
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400">
                                                    File
                                                </span>
                                                <a
                                                    href={`/storage/${p.bukti_pembayaran}`}
                                                    target="_blank"
                                                    className="text-[#3D7ABA] hover:underline font-medium"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    Lihat Bukti
                                                </a>
                                            </div>
                                        </>
                                    )}

                                    {p.catatan && (
                                        <Row
                                            label="Catatan"
                                            value={p.catatan}
                                        />
                                    )}

                                    {p.status === "menunggu" && (
                                        <div className="flex gap-2 pt-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmTerima(p);
                                                }}
                                                className="flex-1 bg-emerald-500 text-white py-2 rounded-2xl text-xs font-semibold hover:bg-emerald-600 transition"
                                            >
                                                Terima
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmTolak(p);
                                                }}
                                                className="flex-1 bg-red-500 text-white py-2 rounded-2xl text-xs font-semibold hover:bg-red-600 transition"
                                            >
                                                Tolak
                                            </button>
                                        </div>
                                    )}

                                    {(p.status === "diterima" ||
                                        p.status === "ditolak") && (
                                        <div className="flex gap-2 pt-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmBatal(p);
                                                }}
                                                className="w-full bg-slate-500 text-white py-2 rounded-2xl text-xs font-semibold hover:bg-slate-600 transition"
                                            >
                                                Batalkan Verifikasi
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {pendaftar.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() =>
                                router.get(
                                    pendaftar.prev_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            disabled={!pendaftar.prev_page_url}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="text-xs text-slate-400">
                            Halaman {pendaftar.current_page} dari{" "}
                            {pendaftar.last_page}
                        </span>
                        <button
                            onClick={() =>
                                router.get(
                                    pendaftar.next_page_url,
                                    {},
                                    { preserveState: true },
                                )
                            }
                            disabled={!pendaftar.next_page_url}
                            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Popup Konfirmasi Terima */}
                {confirmTerima && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setConfirmTerima(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100 text-center">
                            <h3 className="font-semibold text-lg">
                                Terima Pendaftar?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                <strong>{confirmTerima.nama_lengkap}</strong>{" "}
                                akan diterima sebagai santri.
                            </p>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => setConfirmTerima(null)}
                                    className="flex-1 border py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        handleVerifikasi(
                                            confirmTerima.id,
                                            "diterima",
                                        )
                                    }
                                    disabled={submitting}
                                    className="flex-1 bg-emerald-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    {submitting ? "..." : "Ya, Terima"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popup Konfirmasi Tolak */}
                {confirmTolak && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => {
                                setConfirmTolak(null);
                                setCatatan("");
                            }}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100">
                            <h3 className="font-semibold text-lg">
                                Tolak Pendaftar?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                <strong>{confirmTolak.nama_lengkap}</strong>{" "}
                                akan ditolak.
                            </p>
                            <textarea
                                placeholder="Alasan penolakan (opsional)..."
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-2 text-xs outline-none mt-3"
                                rows={2}
                            ></textarea>
                            <div className="flex gap-2 pt-3">
                                <button
                                    onClick={() => {
                                        setConfirmTolak(null);
                                        setCatatan("");
                                    }}
                                    className="flex-1 border py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        handleVerifikasi(
                                            confirmTolak.id,
                                            "ditolak",
                                        )
                                    }
                                    disabled={submitting}
                                    className="flex-1 bg-red-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    {submitting ? "..." : "Ya, Tolak"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popup Konfirmasi Batalkan */}
                {confirmBatal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setConfirmBatal(null)}
                        ></div>
                        <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-6 border border-sky-100 text-center">
                            <h3 className="font-semibold text-lg">
                                Batalkan Verifikasi?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Status{" "}
                                <strong>{confirmBatal.nama_lengkap}</strong>{" "}
                                akan kembali ke <strong>menunggu</strong>.
                            </p>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => setConfirmBatal(null)}
                                    className="flex-1 border py-2.5 rounded-2xl text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() =>
                                        handleBatalkan(confirmBatal.id)
                                    }
                                    className="flex-1 bg-slate-500 text-white py-2.5 rounded-2xl text-sm font-semibold"
                                >
                                    Ya, Batalkan
                                </button>
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
