import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from "qrcode.react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import AppLayout from "@/Layouts/AppLayout";

export default function Index() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [mode, setMode] = useState("camera");
    const [manualInput, setManualInput] = useState("");
    const [sending, setSending] = useState(false);
    const scannerRef = useRef(null);
    const inputRef = useRef(null);
    const qrRef = useRef(null); // Tambahan ref untuk QR code

    const isAdmin = user.role === "admin";
    const profil = user.ustadz || user.santri;
    const qrValue =
        user.role === "ustadz"
            ? profil?.niu
            : user.role === "santri"
              ? profil?.nis
              : "";
    const nama = profil?.nama_lengkap || "Admin";

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    useEffect(() => {
        if (mode === "manual" && inputRef.current) {
            inputRef.current.focus();
        }
    }, [mode]);

    // Kirim presensi saat scan berhasil
    useEffect(() => {
        if (scanResult && isAdmin) {
            kirimPresensi(scanResult);
        }
    }, [scanResult]);

    const kirimPresensi = (nis) => {
        setSending(true);
        router.post(
            "/presensi-santri",
            { nis },
            {
                onSuccess: () => {
                    playBeep();
                    toast.success(`Presensi ${nis} berhasil!`);
                    setScanResult(null);
                    setManualInput("");
                    setSending(false);
                    // Auto-restart setelah 1,5 detik
                    setTimeout(() => {
                        if (mode === "camera") startScan();
                    }, 1500);
                },
                onError: (errors) => {
                    toast.error(
                        errors?.error ||
                            "Santri sudah presensi atau data tidak ditemukan.",
                    );
                    setTimeout(() => {
                        setScanResult(null);
                        setManualInput("");
                        if (mode === "camera") startScan();
                    }, 2000);
                    setSending(false);
                },
            },
        );
    };

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

    const startScan = async () => {
        setScanning(true);
        setScanResult(null);
        try {
            const scanner = new Html5Qrcode("reader");
            scannerRef.current = scanner;
            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    setScanResult(decodedText);
                    scanner.stop();
                    setScanning(false);
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

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            kirimPresensi(manualInput.trim());
        }
    };

    // Fungsi untuk download QR code
    const downloadQRCode = () => {
        const svg = qrRef.current?.querySelector("svg");
        if (!svg) {
            toast.error("QR Code tidak ditemukan");
            return;
        }

        try {
            // Clone SVG untuk dimodifikasi
            const cloneSvg = svg.cloneNode(true);

            // Buat canvas dengan ukuran yang sama
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Set ukuran canvas (2x untuk kualitas lebih baik)
            const size = 180 * 2; // 360px
            canvas.width = size;
            canvas.height = size;

            // Convert SVG to data URL
            const svgData = new XMLSerializer().serializeToString(cloneSvg);
            const svgBlob = new Blob([svgData], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                // Background putih
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, size, size);

                // Draw image
                ctx.drawImage(img, 0, 0, size, size);

                // Download
                const link = document.createElement("a");
                link.download = `QR-${nama}-${qrValue}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();

                // Cleanup
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
                    {isAdmin ? "Presensi Santri" : "QR Code Saya"}
                </h2>

                {isAdmin ? (
                    <>
                        <div className="flex gap-2 mb-4 bg-slate-100 rounded-full p-1">
                            <button
                                onClick={() => {
                                    setMode("camera");
                                    stopScan();
                                }}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${mode === "camera" ? "bg-white shadow text-[#3D7ABA]" : "text-slate-500"}`}
                            >
                                Kamera
                            </button>
                            <button
                                onClick={() => {
                                    setMode("manual");
                                    stopScan();
                                }}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${mode === "manual" ? "bg-white shadow text-[#3D7ABA]" : "text-slate-500"}`}
                            >
                                Input Manual
                            </button>
                        </div>

                        {mode === "camera" && (
                            <>
                                <div
                                    id="reader"
                                    className="mx-auto rounded-2xl overflow-hidden shadow-2xl mb-4"
                                ></div>
                                {!scanning ? (
                                    <button
                                        onClick={startScan}
                                        disabled={sending}
                                        className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-8 py-4 rounded-full text-base font-semibold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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
                            </>
                        )}

                        {mode === "manual" && (
                            <form
                                onSubmit={handleManualSubmit}
                                className="space-y-3"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={manualInput}
                                    onChange={(e) =>
                                        setManualInput(e.target.value)
                                    }
                                    placeholder="Scan barcode atau input manual..."
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-xs text-center font-mono tracking-widest focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 outline-none"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg disabled:opacity-50"
                                >
                                    Simpan Presensi
                                </button>
                            </form>
                        )}

                        {sending && (
                            <p className="text-xs text-slate-400 mt-4">
                                Menyimpan presensi...
                            </p>
                        )}
                    </>
                ) : (
                    <div className="bg-gradient-to-br from-[#3D7ABA] to-[#20B5E8] rounded-[30px] p-8 shadow-2xl text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 border-2 border-white/30">
                            {nama?.charAt(0) || "A"}
                        </div>
                        <h3 className="font-bold text-lg">{nama}</h3>
                        <p className="text-sm text-white/70">
                            {user.role.toUpperCase()} • {qrValue}
                        </p>
                        <div
                            ref={qrRef}
                            className="mt-6 bg-white rounded-2xl p-4 inline-block shadow-lg"
                        >
                            <QRCodeSVG
                                value={qrValue}
                                size={180}
                                level="H"
                                includeMargin
                            />
                        </div>

                        {/* Tombol Download tanpa icon */}
                        <div className="mt-4">
                            <button
                                onClick={downloadQRCode}
                                className="bg-white text-[#3D7ABA] px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all mx-auto"
                            >
                                Download QR Code
                            </button>
                        </div>
                    </div>
                )}

                <p className="text-xs text-slate-400 mt-6">
                    {isAdmin
                        ? "Scan QR santri untuk presensi"
                        : `© ${new Date().getFullYear()} Pondok Pesantren Al-Amanah`}
                </p>
            </div>
        </AppLayout>
    );
}
