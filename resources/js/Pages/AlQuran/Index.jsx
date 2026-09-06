import {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import AppLayout from "@/Layouts/AppLayout";
import {
    getHalamanMushaf,
    getListSurat,
    getListJuz,
    getHalamanDariSurat,
    getHalamanDariAyat,
} from "@/Services/AlQuran";
import toast from "react-hot-toast";
import {
    Highlighter,
    Minus,
    Plus,
    Bookmark,
    BookmarkCheck,
    Trash2,
    BookOpen,
} from "lucide-react";

export default function Index() {
    const [halaman, setHalaman] = useState(1);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const [ready, setReady] = useState(false);

    // State ukuran font
    const [fontSize, setFontSize] = useState(() => {
        const saved = localStorage.getItem("quran-font-size");
        return saved ? Number(saved) : 16;
    });

    // State mode tandai (stabilo + bookmark)
    const [modeTandai, setModeTandai] = useState(false);
    const [tandaiTarget, setTandaiTarget] = useState(null);
    const [tandaiData, setTandaiData] = useState(() => {
        const saved = localStorage.getItem("quran-tandai");
        return saved ? JSON.parse(saved) : {};
    });

    // State halaman terakhir
    const [halamanTerakhir, setHalamanTerakhir] = useState(() => {
        const saved = localStorage.getItem("quran-halaman-terakhir");
        return saved ? Number(saved) : 1;
    });

    const [listSurat, setListSurat] = useState([]);
    const [listJuz, setListJuz] = useState([]);
    const [pickerMode, setPickerMode] = useState(null);
    const [pickerSearch, setPickerSearch] = useState("");
    const [pilihSurat, setPilihSurat] = useState(1);
    const [pilihAyat, setPilihAyat] = useState(1);

    const pickerRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const stageRef = useRef(null);
    const contentRef = useRef(null);
    const abortRef = useRef(null);

    // Batas ukuran font
    const MIN_FONT_SIZE = 14;
    const MAX_FONT_SIZE = 40;
    const FONT_STEP = 2;

    // Warna stabilo
    const WARNA_STABILO = {
        kuning: { bg: "rgba(250, 204, 21, 0.35)", border: "#EAB308" },
        hijau: { bg: "rgba(74, 222, 128, 0.35)", border: "#22C55E" },
        biru: { bg: "rgba(96, 165, 250, 0.35)", border: "#3B82F6" },
        merah: { bg: "rgba(248, 113, 113, 0.35)", border: "#EF4444" },
    };

    // Fungsi ubah font size
    const zoomIn = () => {
        setFontSize((prev) => {
            const next = Math.min(prev + FONT_STEP, MAX_FONT_SIZE);
            localStorage.setItem("quran-font-size", String(next));
            return next;
        });
        setReady(false);
    };

    const zoomOut = () => {
        setFontSize((prev) => {
            const next = Math.max(prev - FONT_STEP, MIN_FONT_SIZE);
            localStorage.setItem("quran-font-size", String(next));
            return next;
        });
        setReady(false);
    };

    // Simpan halaman terakhir
    useEffect(() => {
        if (halaman && halaman !== halamanTerakhir) {
            setHalamanTerakhir(halaman);
            localStorage.setItem("quran-halaman-terakhir", String(halaman));
        }
    }, [halaman]);

    // Fungsi tandai
    const simpanTandai = (verseKey, tipe, nilai) => {
        const newData = { ...tandaiData };
        const existing = newData[verseKey] || {};

        if (tipe === "stabilo") {
            existing.stabilo = nilai;
        } else if (tipe === "bookmark") {
            existing.bookmark = !existing.bookmark;
        } else if (tipe === "hapus") {
            delete newData[verseKey];
            setTandaiData(newData);
            localStorage.setItem("quran-tandai", JSON.stringify(newData));
            setTandaiTarget(null);
            toast.success("Tanda dihapus");
            return;
        }

        existing.timestamp = new Date().toISOString();
        newData[verseKey] = existing;
        setTandaiData(newData);
        localStorage.setItem("quran-tandai", JSON.stringify(newData));
        setTandaiTarget(null);
        toast.success("Tanda disimpan");
    };

    const handleAyatClick = (verseKey) => {
        if (modeTandai) {
            setTandaiTarget(verseKey);
        }
    };

    const lanjutBaca = () => {
        if (halamanTerakhir && halamanTerakhir !== halaman) {
            setHalaman(halamanTerakhir);
            toast.success(`Lanjut ke halaman ${halamanTerakhir}`);
        } else {
            toast("Anda sudah di halaman terakhir", { icon: "📖" });
        }
        setPickerMode(null);
    };

    useEffect(() => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setReady(false);
        getHalamanMushaf(halaman, controller.signal)
            .then((res) => {
                if (res?.verses) setDetail(res);
                setLoading(false);
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    toast.error("Gagal memuat halaman.");
                    setLoading(false);
                }
            });
    }, [halaman]);

    useEffect(() => {
        getListSurat()
            .then((res) => {
                if (res?.chapters) setListSurat(res.chapters);
            })
            .catch(() => {});
        getListJuz()
            .then((res) => {
                if (res?.juzs) {
                    const unik = res.juzs.filter(
                        (j, i, arr) =>
                            arr.findIndex(
                                (x) => x.juz_number === j.juz_number,
                            ) === i,
                    );
                    setListJuz(unik);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const onClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target))
                setPickerMode(null);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    // Susun ulang kata-kata per baris asli Mushaf Madinah
    const baris = useMemo(() => {
        if (!detail?.verses) return [];
        const perBaris = new Map();
        detail.verses.forEach((v) => {
            const nomorAyat = v.verse_key.split(":")[1];
            const kata = (v.words || []).filter(
                (w) => w.char_type_name !== "end",
            );
            kata.forEach((w, idx) => {
                const arr = perBaris.get(w.line_number) || [];
                arr.push({
                    key: `${v.verse_key}-${w.position}`,
                    text: w.text_uthmani,
                    akhirAyat: idx === kata.length - 1,
                    nomorAyat,
                    verseKey: v.verse_key,
                });
                perBaris.set(w.line_number, arr);
            });
        });
        return [...perBaris.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([nomorBaris, kata]) => ({ nomorBaris, kata }));
    }, [detail]);

    const SAFETY_MARGIN = 0.97;

    const fitToStage = useCallback(() => {
        const stage = stageRef.current;
        const content = contentRef.current;
        if (!stage || !content) return;
        const stageRect = stage.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        if (contentRect.width === 0 || contentRect.height === 0) return;
        const scaleX = (stageRect.width / contentRect.width) * SAFETY_MARGIN;
        const scaleY = (stageRect.height / contentRect.height) * SAFETY_MARGIN;
        const next = Math.min(scaleX, scaleY, 1.5);
        setScale(Math.max(next, 0.2));
        setReady(true);
    }, []);

    useLayoutEffect(() => {
        if (loading || !detail) return;
        fitToStage();
        if (document.fonts?.ready) {
            document.fonts.ready.then(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(fitToStage);
                });
            });
        }
    }, [loading, detail, baris, fitToStage, fontSize]);

    useEffect(() => {
        let raf;
        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(fitToStage);
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onResize);
            cancelAnimationFrame(raf);
        };
    }, [fitToStage]);

    const angkaArab = (angka) => {
        const arab = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
        return String(angka).replace(/[0-9]/g, (d) => arab[Number(d)]);
    };

    const goTo = (n) => {
        if (n < 1 || n > 604) return;
        setHalaman(n);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null || touchStartY.current === null)
            return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) goTo(halaman + 1);
            else goTo(halaman - 1);
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    const pilihSuratHandler = async (suratId) => {
        try {
            const res = await getHalamanDariSurat(suratId);
            const halamanSurat = res?.chapter?.pages?.[0];
            if (halamanSurat) {
                setHalaman(halamanSurat);
            }
        } catch {
            toast.error("Gagal membuka surat.");
        }
        setPickerMode(null);
    };

    const pilihAyatHandlerByKey = async (surat, ayat) => {
        try {
            const res = await getHalamanDariAyat(surat, ayat);
            const halamanAyat = res?.verse?.page_number;
            if (halamanAyat) {
                setHalaman(halamanAyat);
            }
        } catch {
            toast.error("Gagal membuka ayat.");
        }
        setPickerMode(null);
    };

    const pilihAyatHandler = async () => {
        const surat = listSurat.find((s) => s.id === pilihSurat);
        const maxAyat = surat?.verses_count || 1;
        if (pilihAyat < 1 || pilihAyat > maxAyat) {
            toast.error("Ayat tidak valid.");
            return;
        }
        pilihAyatHandlerByKey(pilihSurat, pilihAyat);
    };

    const pilihJuzHandler = (juz) => {
        const mapping = juz.verse_mapping;
        const suratPertama = Object.keys(mapping)[0];
        const ayatPertama = mapping[suratPertama].split("-")[0];
        pilihAyatHandlerByKey(suratPertama, ayatPertama);
    };

    const handleGantiSurat = (suratId) => {
        setPilihSurat(Number(suratId));
        setPilihAyat(1);
    };

    const suratLatin = detail?.meta?.surah_name_simple || "Al-Fatihah";
    const ayatAwal = detail?.verses?.[0]?.verse_key?.split(":")[1] || "1";
    const juzInfo = detail?.meta?.juz || 1;

    const filteredSurat = listSurat.filter(
        (s) =>
            s.name_simple?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
            String(s.id).includes(pickerSearch),
    );

    // Daftar bookmark untuk ditampilkan
    const daftarBookmark = Object.entries(tandaiData)
        .filter(([, v]) => v.bookmark)
        .map(([key, v]) => ({ key, ...v }));

    return (
        <AppLayout>
            <div
                className="h-[100dvh] w-full bg-[#EEF8FD] flex flex-col overflow-hidden overscroll-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Header navigasi */}
                <div className="shrink-0 px-4 py-3 relative" ref={pickerRef}>
                    <div className="grid grid-cols-4 gap-2 mx-auto max-w-md">
                        <button
                            onClick={() => setPickerMode("surat")}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg px-2 flex items-center justify-center"
                        >
                            <span>Surat</span>
                        </button>
                        <button
                            onClick={zoomOut}
                            disabled={fontSize <= MIN_FONT_SIZE}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg px-2 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={zoomIn}
                            disabled={fontSize >= MAX_FONT_SIZE}
                            className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-xs font-semibold shadow-lg px-2 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setModeTandai(!modeTandai);
                                if (modeTandai) setTandaiTarget(null);
                            }}
                            className={`py-2.5 rounded-2xl text-xs font-semibold shadow-lg px-2 flex items-center justify-center transition ${
                                modeTandai
                                    ? "bg-green-500 text-white"
                                    : "bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white"
                            }`}
                            title={
                                modeTandai
                                    ? "Nonaktifkan mode tandai"
                                    : "Aktifkan mode tandai"
                            }
                        >
                            <Highlighter className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Popup tandai (stabilo + bookmark) */}
                    {tandaiTarget && modeTandai && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                            onClick={() => setTandaiTarget(null)}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-xl p-4 mx-4 w-full max-w-xs"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p className="text-sm font-semibold text-slate-700 mb-1 text-center">
                                    Tandai Ayat
                                </p>
                                <p className="text-xs text-slate-500 mb-3 text-center">
                                    {tandaiTarget}
                                </p>

                                {/* Stabilo */}
                                <p className="text-xs font-medium text-slate-600 mb-2">
                                    Stabilo:
                                </p>
                                <div className="flex gap-3 justify-center mb-3">
                                    <button
                                        onClick={() =>
                                            simpanTandai(
                                                tandaiTarget,
                                                "stabilo",
                                                "kuning",
                                            )
                                        }
                                        className="w-9 h-9 rounded-full bg-yellow-400/50 border-2 border-yellow-500 hover:scale-110 transition"
                                        title="Kuning"
                                    />
                                    <button
                                        onClick={() =>
                                            simpanTandai(
                                                tandaiTarget,
                                                "stabilo",
                                                "hijau",
                                            )
                                        }
                                        className="w-9 h-9 rounded-full bg-green-400/50 border-2 border-green-500 hover:scale-110 transition"
                                        title="Hijau"
                                    />
                                    <button
                                        onClick={() =>
                                            simpanTandai(
                                                tandaiTarget,
                                                "stabilo",
                                                "biru",
                                            )
                                        }
                                        className="w-9 h-9 rounded-full bg-blue-400/50 border-2 border-blue-500 hover:scale-110 transition"
                                        title="Biru"
                                    />
                                    <button
                                        onClick={() =>
                                            simpanTandai(
                                                tandaiTarget,
                                                "stabilo",
                                                "merah",
                                            )
                                        }
                                        className="w-9 h-9 rounded-full bg-red-400/50 border-2 border-red-500 hover:scale-110 transition"
                                        title="Merah"
                                    />
                                </div>

                                {/* Bookmark */}
                                <p className="text-xs font-medium text-slate-600 mb-2">
                                    Hafalan:
                                </p>
                                <button
                                    onClick={() =>
                                        simpanTandai(tandaiTarget, "bookmark")
                                    }
                                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                                        tandaiData[tandaiTarget]?.bookmark
                                            ? "bg-amber-100 text-amber-700 border border-amber-300"
                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                    }`}
                                >
                                    {tandaiData[tandaiTarget]?.bookmark ? (
                                        <>
                                            <BookmarkCheck className="w-4 h-4" />
                                            <span>Terbookmark</span>
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark className="w-4 h-4" />
                                            <span>Bookmark Hafalan</span>
                                        </>
                                    )}
                                </button>

                                {/* Hapus */}
                                <button
                                    onClick={() =>
                                        simpanTandai(tandaiTarget, "hapus")
                                    }
                                    className="w-full py-2 mt-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Hapus Semua Tanda</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Panel Surat */}
                    {pickerMode === "surat" && (
                        <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-sky-100 overflow-hidden z-50 mx-auto max-w-md">
                            <div className="p-2 border-b border-slate-100">
                                <input
                                    autoFocus
                                    type="text"
                                    value={pickerSearch}
                                    onChange={(e) =>
                                        setPickerSearch(e.target.value)
                                    }
                                    placeholder="Cari surat..."
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-[#20B5E8]"
                                />
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {/* Tombol Lanjut Baca */}
                                <button
                                    onClick={lanjutBaca}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left bg-amber-50 hover:bg-amber-100 transition border-b border-amber-100"
                                >
                                    <span className="w-7 h-7 shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                        <BookOpen className="w-4 h-4" />
                                    </span>
                                    <span className="text-sm font-medium text-amber-700">
                                        Lanjut Baca - Halaman {halamanTerakhir}
                                    </span>
                                </button>

                                {/* Daftar Bookmark */}
                                {daftarBookmark.length > 0 && (
                                    <div className="border-b border-slate-100">
                                        <p className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50">
                                            📖 Bookmark Hafalan (
                                            {daftarBookmark.length})
                                        </p>
                                        {daftarBookmark.map((b) => (
                                            <button
                                                key={b.key}
                                                onClick={() => {
                                                    const [surat, ayat] =
                                                        b.key.split(":");
                                                    pilihAyatHandlerByKey(
                                                        surat,
                                                        ayat,
                                                    );
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-amber-50 transition"
                                            >
                                                <BookmarkCheck className="w-4 h-4 text-amber-500 shrink-0" />
                                                <span className="text-sm text-slate-700">
                                                    {b.key}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Daftar Surat */}
                                {filteredSurat.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => pilihSuratHandler(s.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#3D7ABA]/5 transition"
                                    >
                                        <span className="w-7 h-7 shrink-0 rounded-full border border-sky-200 text-[#3D7ABA] text-[11px] font-bold flex items-center justify-center">
                                            {angkaArab(s.id)}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-medium text-slate-800 truncate">
                                                {s.name_simple}
                                            </span>
                                            <span className="block text-[11px] text-slate-400">
                                                {s.verses_count} ayat
                                            </span>
                                        </span>
                                        <span className="font-mushaf text-lg text-[#3D7ABA]">
                                            {s.name_arabic}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stage */}
                <div
                    ref={stageRef}
                    className="flex-1 min-h-0 relative flex items-stretch justify-center px-4 sm:px-6 py-3 overflow-hidden"
                >
                    {loading || !detail ? (
                        <div className="text-slate-400 text-sm flex items-center justify-center">
                            Memuat halaman...
                        </div>
                    ) : (
                        <div
                            ref={contentRef}
                            style={{
                                width: "max-content",
                                maxWidth: "none",
                                transform: `scale(${scale})`,
                                transformOrigin: "top center",
                                opacity: ready ? 1 : 0,
                                transition: "opacity 0.15s ease",
                            }}
                        >
                            {baris.map((b) => (
                                <div
                                    key={b.nomorBaris}
                                    dir="rtl"
                                    className="font-mushaf whitespace-nowrap text-slate-800"
                                    style={{
                                        direction: "rtl",
                                        textAlign: "justify",
                                        textAlignLast: "justify",
                                        fontSize: `${fontSize}px`,
                                    }}
                                >
                                    {b.kata.map((w) => {
                                        const tandaInfo =
                                            tandaiData[w.verseKey];
                                        return (
                                            <span
                                                key={w.key}
                                                style={{
                                                    backgroundColor:
                                                        tandaInfo?.stabilo
                                                            ? WARNA_STABILO[
                                                                  tandaInfo
                                                                      .stabilo
                                                              ]?.bg
                                                            : "transparent",
                                                    borderRadius:
                                                        tandaInfo?.stabilo
                                                            ? "4px"
                                                            : "0",
                                                    cursor: modeTandai
                                                        ? "pointer"
                                                        : "default",
                                                }}
                                            >
                                                {w.text}{" "}
                                                {w.akhirAyat && (
                                                    <span
                                                        onClick={() =>
                                                            handleAyatClick(
                                                                w.verseKey,
                                                            )
                                                        }
                                                        className={`inline-flex items-center justify-center mx-1 align-middle rounded-full select-none transition ${
                                                            modeTandai
                                                                ? "cursor-pointer"
                                                                : ""
                                                        }`}
                                                        style={{
                                                            width: "2em",
                                                            height: "2em",
                                                            fontSize: "0.55em",
                                                            fontWeight: 700,
                                                            lineHeight: 1,
                                                            fontFamily:
                                                                "Amiri, serif",
                                                            background:
                                                                "linear-gradient(135deg, #D4A94E 0%, #B8860B 50%, #D4A94E 100%)",
                                                            color: "#1a1a1a",
                                                            border: "1px solid #8B6914",
                                                            boxShadow:
                                                                modeTandai
                                                                    ? "0 0 0 2px #3B82F6"
                                                                    : tandaInfo?.stabilo
                                                                      ? `0 0 0 2px ${WARNA_STABILO[tandaInfo.stabilo]?.border}`
                                                                      : tandaInfo?.bookmark
                                                                        ? "0 0 0 2px #F59E0B"
                                                                        : "0 1px 2px rgba(0,0,0,0.2)",
                                                            cursor: modeTandai
                                                                ? "pointer"
                                                                : "default",
                                                        }}
                                                        title={
                                                            modeTandai
                                                                ? "Klik untuk tandai"
                                                                : tandaInfo?.bookmark
                                                                  ? "Bookmark hafalan"
                                                                  : ""
                                                        }
                                                    >
                                                        {tandaInfo?.bookmark &&
                                                        !modeTandai ? (
                                                            <BookmarkCheck className="w-3 h-3" />
                                                        ) : (
                                                            angkaArab(
                                                                w.nomorAyat,
                                                            )
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
