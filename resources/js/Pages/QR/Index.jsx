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
    const [target, setTarget] = useState("siswa");
    const scannerRef = useRef(null);
    const inputRef = useRef(null);
    const qrRef = useRef(null);

    const isAdmin = user.role === "admin";
    const profil = user.guru || user.siswa;
    const qrValue =
        user.role === "guru"
            ? String(profil?.id)
            : user.role === "siswa"
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

    useEffect(() => {
        if (scanResult && isAdmin) {
            kirimPresensi(scanResult);
        }
    }, [scanResult]);

    const kirimPresensi = (nilai) => {
        setSending(true);

        const url = target === "guru" ? "/presensi-guru" : "/presensi-siswa";
        const data = target === "guru" ? { guru_id: nilai } : { nis: nilai };

        router.post(url, data, {
            onSuccess: () => {
                playBeep();
                toast.success("Presensi berhasil!");
                setScanResult(null);
                setManualInput("");
                setSending(false);
                setTimeout(() => {
                    if (mode === "camera") startScan();
                }, 1500);
            },
            onError: (errors) => {
                toast.error(errors?.error || "Presensi gagal.");
                setTimeout(() => {
                    setScanResult(null);
                    setManualInput("");
                    if (mode === "camera") startScan();
                }, 2000);
                setSending(false);
            },
        });
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

    const downloadQRCode = () => {
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
                link.download = `QR-${nama}-${qrValue}.png`;
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
                    {isAdmin ? "Scan Presensi" : "QR Code Saya"}
                </h2>

                {isAdmin ? (
                    <>
                        {/* Pilih target presensi */}
                        <div className="flex gap-2 mb-4 bg-slate-100 rounded-full p-1">
                            <button
                                onClick={() => setTarget("siswa")}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${target === "siswa" ? "bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white shadow" : "text-slate-500"}`}
                            >
                                Siswa
                            </button>
                            <button
                                onClick={() => setTarget("guru")}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${target === "guru" ? "bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white shadow" : "text-slate-500"}`}
                            >
                                Guru
                            </button>
                        </div>

                        <div className="flex gap-2 mb-4 bg-slate-100 rounded-full p-1">
                            <button
                                onClick={() => {
                                    setMode("camera");
                                    stopScan();
                                }}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${mode === "camera" ? "bg-white shadow text-[#009788]" : "text-slate-500"}`}
                            >
                                Kamera
                            </button>
                            <button
                                onClick={() => {
                                    setMode("manual");
                                    stopScan();
                                }}
                                className={`flex-1 py-2 rounded-full text-xs font-medium transition ${mode === "manual" ? "bg-white shadow text-[#009788]" : "text-slate-500"}`}
                            >
                                Manual
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
                                    placeholder={
                                        target === "guru"
                                            ? "Masukkan ID Guru"
                                            : "Masukkan NIS Siswa"
                                    }
                                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-xs text-center font-mono tracking-widest focus:border-[#009788] focus:ring-4 focus:ring-teal-100 outline-none"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="bg-gradient-to-r from-[#009788] to-[#00b5a5] text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg disabled:opacity-50"
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
                    <div className="bg-gradient-to-br from-[#009788] to-[#00b5a5] rounded-[30px] p-8 shadow-2xl text-white">
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

                        <div className="mt-4">
                            <button
                                onClick={downloadQRCode}
                                className="bg-white text-[#009788] px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all mx-auto"
                            >
                                Download QR Code
                            </button>
                        </div>
                    </div>
                )}

                <p className="text-xs text-slate-400 mt-6">
                    {isAdmin
                        ? "Scan QR untuk presensi"
                        : `© ${new Date().getFullYear()} MAK NU 01 Kota Semarang`}
                </p>
            </div>
        </AppLayout>
    );
}
