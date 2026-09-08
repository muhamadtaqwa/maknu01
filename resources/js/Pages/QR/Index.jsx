import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from "qrcode.react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { auth, presensiHariIni } = usePage().props;
    const user = auth.user;
    const [scanning, setScanning] = useState(false);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState("guru");
    const scannerRef = useRef(null);
    const qrRef = useRef(null);

    const isAdmin = user.role === "admin";
    const isGuru = user.role === "guru";
    const isSiswa = user.role === "siswa";
    const profil = user.guru || user.siswa;

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

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

    const kirimPresensi = (kode) => {
        setSending(true);

        if (isGuru) {
            router.post(
                "/presensi-guru",
                { guru_id: profil?.id },
                {
                    onSuccess: () => {
                        playBeep();
                        toast.success("Presensi berhasil!");
                        setSending(false);
                    },
                    onError: (errors) => {
                        toast.error(errors?.error || "Presensi gagal.");
                        setSending(false);
                    },
                },
            );
        } else if (isSiswa) {
            router.post(
                "/presensi-siswa",
                { nis: profil?.nis },
                {
                    onSuccess: () => {
                        playBeep();
                        toast.success("Presensi berhasil!");
                        setSending(false);
                    },
                    onError: (errors) => {
                        toast.error(errors?.error || "Presensi gagal.");
                        setSending(false);
                    },
                },
            );
        }
    };

    const startScan = async () => {
        setScanning(true);
        try {
            const scanner = new Html5Qrcode("reader");
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    scanner.stop();
                    setScanning(false);
                    kirimPresensi(decodedText);
                },
                () => {},
            );
        } catch (err) {
            console.error(err);
            setScanning(false);
        }
    };

    const stopScan = async () => {
        if (scannerRef.current) {
            await scannerRef.current.stop();
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleBatalkan = () => {
        if (!presensiHariIni) return;
        if (!confirm("Batalkan presensi hari ini?")) return;

        const url = isGuru
            ? `/presensi-guru/${presensiHariIni.id}`
            : `/presensi-siswa/${presensiHariIni.id}`;

        router.delete(url, {
            onSuccess: () => toast.success("Presensi dibatalkan."),
            onError: () => toast.error("Gagal membatalkan."),
        });
    };

    const downloadQRCode = (nama) => {
        const svg = qrRef.current?.querySelector("svg");
        if (!svg) {
            toast.error("QR Code tidak ditemukan");
            return;
        }

        try {
            const cloneSvg = svg.cloneNode(true);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const size = 180 * 2;
            canvas.width = size;
            canvas.height = size;

            const svgData = new XMLSerializer().serializeToString(cloneSvg);
            const svgBlob = new Blob([svgData], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);

                const link = document.createElement("a");
                link.download = `QR-${nama}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();

                URL.revokeObjectURL(url);
                toast.success("QR Code berhasil didownload!");
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                toast.error("Gagal membuat QR Code");
            };

            img.src = url;
        } catch (error) {
            console.error("Error downloading QR:", error);
            toast.error("Gagal mendownload QR Code");
        }
    };

    return (
        <AppLayout>
            <div className="max-w-md mx-auto text-center">
                <h2 className="text-lg font-bold text-slate-800 mb-6">
                    {isAdmin ? "QR Presensi" : "Scan Presensi"}
                </h2>

                {isAdmin ? (
                    <>
                        {/* Tab QR Guru & QR Siswa */}
                        <div className="flex gap-2 mb-4 bg-slate-100 rounded-full p-1">
                            <button
                                onClick={() => setActiveTab("guru")}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${activeTab === "guru" ? "bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white shadow" : "text-slate-500"}`}
                            >
                                QR Guru
                            </button>
                            <button
                                onClick={() => setActiveTab("siswa")}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${activeTab === "siswa" ? "bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white shadow" : "text-slate-500"}`}
                            >
                                QR Siswa
                            </button>
                        </div>

                        {activeTab === "guru" ? (
                            <div className="rounded-[30px] border border-teal-100 bg-white p-6 shadow-2xl">
                                <h3 className="font-semibold text-sm text-slate-700 mb-3">
                                    QR Guru
                                </h3>
                                <div
                                    ref={qrRef}
                                    className="bg-white rounded-2xl p-4 inline-block shadow-lg"
                                >
                                    <QRCodeSVG
                                        value="ruang-guru"
                                        size={180}
                                        level="H"
                                        includeMargin
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => downloadQRCode("Guru")}
                                        className="bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Download QR Guru
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[30px] border border-teal-100 bg-white p-6 shadow-2xl">
                                <h3 className="font-semibold text-sm text-slate-700 mb-3">
                                    QR Siswa
                                </h3>
                                <div
                                    ref={qrRef}
                                    className="bg-white rounded-2xl p-4 inline-block shadow-lg"
                                >
                                    <QRCodeSVG
                                        value="kelas"
                                        size={180}
                                        level="H"
                                        includeMargin
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => downloadQRCode("Siswa")}
                                        className="bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Download QR Siswa
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Status Presensi Hari Ini */}
                        <div className="rounded-[30px] border border-teal-100 bg-white p-6 shadow-2xl mb-4">
                            <h3 className="font-semibold text-sm text-slate-700 mb-3">
                                Status Hari Ini
                            </h3>
                            {presensiHariIni ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-emerald-600 font-semibold">
                                        ✅ Sudah presensi
                                    </p>
                                    {isGuru && (
                                        <>
                                            <p className="text-xs text-slate-500">
                                                Masuk:{" "}
                                                {presensiHariIni.jam_masuk?.slice(
                                                    0,
                                                    5,
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Pulang:{" "}
                                                {presensiHariIni.jam_pulang?.slice(
                                                    0,
                                                    5,
                                                ) || "-"}
                                            </p>
                                        </>
                                    )}
                                    {isSiswa && (
                                        <p className="text-xs text-slate-500">
                                            Jam:{" "}
                                            {presensiHariIni.jam_masuk?.slice(
                                                0,
                                                5,
                                            )}
                                        </p>
                                    )}
                                    <button
                                        onClick={handleBatalkan}
                                        className="mt-2 bg-red-50 text-red-500 px-4 py-2 rounded-full text-xs font-semibold hover:bg-red-100 transition"
                                    >
                                        Batalkan Presensi
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">
                                    Belum presensi hari ini
                                </p>
                            )}
                        </div>

                        {/* Scanner */}
                        <div
                            id="reader"
                            className="mx-auto rounded-2xl overflow-hidden shadow-2xl mb-4"
                        ></div>
                        {!scanning ? (
                            <button
                                onClick={startScan}
                                disabled={sending}
                                className="bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                Mulai Scan
                            </button>
                        ) : (
                            <button
                                onClick={stopScan}
                                className="bg-red-500 text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Berhenti
                            </button>
                        )}

                        <p className="text-xs text-slate-400 mt-6">
                            {isGuru
                                ? "Scan QR di ruang guru untuk presensi"
                                : "Scan QR di kelas untuk presensi"}
                        </p>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
