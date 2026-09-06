import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { getJadwalSholat } from "@/Services/JadwalSholat";
import { router, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import {
    CloudSun,
    Sun,
    CloudMoon,
    Moon,
    LocateFixed,
    Bell,
    MapPin,
} from "lucide-react";

export default function Index() {
    const { auth } = usePage().props;
    const user = auth.user;

    const [jadwal, setJadwal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingLokasi, setLoadingLokasi] = useState(false);
    const [tanggal, setTanggal] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });

    const [lokasi, setLokasi] = useState(() => {
        if (user?.latitude && user?.longitude) {
            return { latitude: user.latitude, longitude: user.longitude };
        }
        return null;
    });

    const [notifSetting, setNotifSetting] = useState({
        subuh: user?.notif_subuh ?? true,
        dzuhur: user?.notif_dzuhur ?? true,
        ashar: user?.notif_ashar ?? true,
        maghrib: user?.notif_maghrib ?? true,
        isya: user?.notif_isya ?? true,
    });

    const mintaLokasi = () => {
        setLoadingLokasi(true);

        if (!navigator.geolocation) {
            toast.error("Browser tidak mendukung geolocation");
            setLoadingLokasi(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLokasi({ latitude, longitude });

                router.post(
                    "/simpan-lokasi",
                    { latitude, longitude },
                    {
                        onSuccess: () => {
                            toast.success("Lokasi tersimpan!");
                            setLoadingLokasi(false);
                            fetchJadwal(latitude, longitude);
                        },
                        onError: () => {
                            toast.error("Gagal simpan lokasi");
                            setLoadingLokasi(false);
                        },
                    },
                );
            },
            () => {
                toast.error("Gagal akses lokasi, pakai default");
                setLoadingLokasi(false);
            },
        );
    };

    const toggleNotif = (key) => {
        const newValue = !notifSetting[key];
        setNotifSetting({ ...notifSetting, [key]: newValue });

        router.post(
            "/simpan-notif-adzan",
            { key, value: newValue },
            {
                onSuccess: () => toast.success("Preferensi tersimpan"),
                onError: () => toast.error("Gagal simpan"),
            },
        );
    };

    const fetchJadwal = (lat, lng) => {
        setLoading(true);
        getJadwalSholat(tanggal, lat, lng)
            .then((res) => {
                if (res?.data?.timings) {
                    setJadwal(res.data.timings);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        setLoading(true);
        const lat = lokasi?.latitude;
        const lng = lokasi?.longitude;
        getJadwalSholat(tanggal, lat, lng)
            .then((res) => {
                if (res?.data?.timings) {
                    setJadwal(res.data.timings);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [tanggal]);

    const formatTgl = (tgl) => {
        return new Date(tgl + "T12:00:00").toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const waktuWajib = jadwal
        ? [
              {
                  label: "Subuh",
                  waktu: jadwal.Fajr,
                  key: "subuh",
                  icon: CloudSun,
              },
              {
                  label: "Dzuhur",
                  waktu: jadwal.Dhuhr,
                  key: "dzuhur",
                  icon: Sun,
              },
              {
                  label: "Ashar",
                  waktu: jadwal.Asr,
                  key: "ashar",
                  icon: CloudSun,
              },
              {
                  label: "Maghrib",
                  waktu: jadwal.Maghrib,
                  key: "maghrib",
                  icon: CloudMoon,
              },
              { label: "Isya", waktu: jadwal.Isha, key: "isya", icon: Moon },
          ]
        : [];

    const waktuTambahan = jadwal
        ? [
              { label: "Imsak", waktu: jadwal.Imsak },
              { label: "Terbit", waktu: jadwal.Sunrise },
          ]
        : [];

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-800">
                        Jadwal Sholat
                    </h2>
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="border border-slate-200 rounded-2xl px-3 py-2 text-sm outline-none bg-white"
                    />
                </div>

                <p className="text-sm text-slate-500 mb-3">
                    {formatTgl(tanggal)}
                </p>

                {/* Tombol Lokasi */}
                <button
                    onClick={mintaLokasi}
                    disabled={loadingLokasi}
                    className="w-full mb-4 bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-3 rounded-2xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <LocateFixed className="w-4 h-4" />
                    {loadingLokasi
                        ? "Mendeteksi..."
                        : lokasi
                          ? "Lokasi Tersimpan"
                          : "Deteksi Lokasi Saya"}
                </button>

                {loading ? (
                    <p className="text-center text-slate-400 py-10">
                        Memuat...
                    </p>
                ) : (
                    <>
                        {/* Waktu Sholat Wajib */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
                            {waktuWajib.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <div
                                        key={s.label}
                                        className="rounded-2xl border border-sky-100 bg-white p-3.5 shadow-sm"
                                    >
                                        {/* Mobile: horizontal layout */}
                                        <div className="flex items-center justify-between sm:flex-col sm:text-center gap-3 sm:gap-0">
                                            <div className="flex items-center gap-3 sm:flex-col">
                                                <div className="w-10 h-10 rounded-xl bg-[#3D7ABA]/10 flex items-center justify-center shrink-0">
                                                    <Icon className="w-5 h-5 text-[#3D7ABA]" />
                                                </div>
                                                <div className="sm:text-center">
                                                    <span className="block text-sm font-medium text-slate-700 sm:text-xs sm:text-slate-500">
                                                        {s.label}
                                                    </span>
                                                    <span className="block text-lg font-bold text-[#3D7ABA] font-mono sm:mt-0.5">
                                                        {s.waktu?.slice(0, 5)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Toggle - mobile di kanan, desktop di bawah */}
                                            <div className="flex items-center gap-2 sm:justify-center sm:w-full sm:mt-2 sm:pt-2 sm:border-t sm:border-slate-100">
                                                <span className="text-[10px] text-slate-400 sm:block hidden">
                                                    Notif
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        toggleNotif(s.key)
                                                    }
                                                    className={`w-10 h-5.5 rounded-full transition relative shrink-0 ${
                                                        notifSetting[s.key]
                                                            ? "bg-green-500"
                                                            : "bg-slate-300"
                                                    }`}
                                                    title="Notifikasi"
                                                >
                                                    <span
                                                        className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${
                                                            notifSetting[s.key]
                                                                ? "left-5"
                                                                : "left-0.5"
                                                        }`}
                                                    ></span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Waktu Tambahan */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {waktuTambahan.map((s) => (
                                <div
                                    key={s.label}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center"
                                >
                                    <span className="block text-xs text-slate-400">
                                        {s.label}
                                    </span>
                                    <span className="block text-sm font-semibold text-slate-600 font-mono">
                                        {s.waktu?.slice(0, 5)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Keterangan Notifikasi */}
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 mb-4">
                            <p className="text-xs text-amber-700 flex items-center gap-2">
                                <Bell className="w-3.5 h-3.5" />
                                Toggle hijau = notifikasi adzan aktif
                            </p>
                        </div>

                        <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {lokasi
                                ? `Lokasi: ${lokasi.latitude}, ${lokasi.longitude}`
                                : "Lokasi default: Kedungpane, Mijen, Semarang"}
                        </p>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
