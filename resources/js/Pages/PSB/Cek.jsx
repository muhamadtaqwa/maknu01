import { useState } from "react";
import { useForm } from "@inertiajs/react";

export default function Cek() {
    const { data, setData, post, processing, errors } = useForm({ nik: "" });
    const [hasil, setHasil] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post("/psb/cek", {
            onSuccess: (response) => {
                setHasil(response.props.hasil);
            },
            onError: () => {
                setHasil(null);
            },
        });
    };

    const formatTgl = (tgl) => {
        if (!tgl) return "-";
        return new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#EEF8FD] py-6 px-4">
            <div className="bg-white rounded-[30px] shadow-2xl p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                    <img
                        src="/images/logo-alamanah.png"
                        alt="Logo"
                        className="h-16 mx-auto mb-2"
                    />
                    <h1 className="text-lg font-bold text-slate-800">
                        Cek Status Pendaftaran
                    </h1>
                    <p className="text-xs text-slate-400">PSB Al-Amanah</p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <input
                            type="text"
                            placeholder="Masukkan NIK"
                            value={data.nik}
                            onChange={(e) => setData("nik", e.target.value)}
                            className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none"
                            required
                        />
                        {errors.nik && (
                            <p className="text-xs text-red-500 mt-1.5 ml-2 font-medium">
                                {errors.nik}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl text-sm font-semibold shadow-lg disabled:opacity-50"
                    >
                        {processing ? "Memeriksa..." : "Cek Status"}
                    </button>
                </form>

                {hasil && (
                    <div className="mt-6 border-t border-slate-100 pt-4 space-y-2 text-sm">
                        <Row label="No. Pendaftaran" value={hasil.id} />
                        <Row
                            label="Tanggal Daftar"
                            value={formatTgl(hasil.created_at)}
                        />
                        <Row label="NIK" value={hasil.nik} />
                        <Row label="Nama" value={hasil.nama_lengkap} />
                        <Row
                            label="Program Studi"
                            value={hasil.program_studi}
                        />
                        <Row
                            label="Status"
                            value={
                                hasil.status === "menunggu"
                                    ? "Menunggu Verifikasi"
                                    : hasil.status === "diterima"
                                      ? "Diterima"
                                      : "Ditolak"
                            }
                        />
                        {hasil.catatan && (
                            <Row label="Catatan" value={hasil.catatan} />
                        )}

                        <div className="pt-3">
                            <a
                                href={`/psb/cetak/${hasil.id}`}
                                className="block text-center bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold"
                            >
                                Cetak Bukti
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const Row = ({ label, value }) => (
    <div className="flex justify-between border-b border-slate-100 py-1.5">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-700">{value || "-"}</span>
    </div>
);
