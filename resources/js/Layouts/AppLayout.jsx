import { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { Toaster } from "react-hot-toast";
import {
    Home,
    QrCode,
    CalendarDays,
    GraduationCap,
    Users,
    Wallet,
    ChartBar,
    ClipboardList,
    ClipboardCheck,
    User,
    LogOut,
    Menu,
    X,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const profil = user.guru || user.siswa;
    const initial = profil?.nama_lengkap?.charAt(0) || "A";

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem("sidebarCollapsed") === "true";
    });

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem("sidebarCollapsed", newState);
    };

    const menuUtama = [
        {
            label: "Dashboard",
            path: "/",
            icon: Home,
            roles: ["admin", "guru", "siswa"],
        },
        {
            label: "QR Code",
            path: "/qr",
            icon: QrCode,
            roles: ["admin", "guru", "siswa"],
        },
        {
            label: "Timeline",
            path: "/timeline",
            icon: CalendarDays,
            roles: ["admin", "guru", "siswa"],
        },
    ];

    const menuData = [
        {
            label: "Siswa",
            path: "/siswa",
            icon: GraduationCap,
            roles: ["admin"],
        },
        { label: "Guru", path: "/guru", icon: Users, roles: ["admin"] },
    ];

    const menuKeuangan = [
        {
            label: "Pembayaran",
            path: "/pembayaran",
            icon: Wallet,
            roles: ["admin"],
        },
        { label: "Rekap", path: "/rekap", icon: ChartBar, roles: ["admin"] },
    ];

    const menuKegiatan = [
        {
            label: "Presensi Guru",
            path: "/presensi-guru",
            icon: ClipboardList,
            roles: ["admin", "guru"],
        },
        {
            label: "Presensi Siswa",
            path: "/presensi-siswa",
            icon: ClipboardCheck,
            roles: ["admin", "guru"],
        },
    ];

    const menuLainnya = [
        {
            label: "Profil",
            path: "/profil",
            icon: User,
            roles: ["admin", "guru", "siswa"],
        },
    ];

    const filterMenu = (menu) =>
        menu.filter((m) => m.roles.includes(user.role));

    const bottomNavByRole = {
        admin: [
            { label: "Beranda", path: "/", icon: Home },
            { label: "Bayar", path: "/pembayaran", icon: Wallet },
            { label: "QR", path: "/qr", icon: QrCode, isCenter: true },
            { label: "Rekap", path: "/rekap", icon: ChartBar },
            { label: "Presensi", path: "/presensi-guru", icon: ClipboardList },
        ],
        guru: [
            { label: "Beranda", path: "/", icon: Home },
            { label: "Timeline", path: "/timeline", icon: CalendarDays },
            { label: "QR", path: "/qr", icon: QrCode, isCenter: true },
            { label: "Presensi", path: "/presensi-guru", icon: ClipboardList },
            { label: "Profil", path: "/profil", icon: User },
        ],
        siswa: [
            { label: "Beranda", path: "/", icon: Home },
            { label: "Timeline", path: "/timeline", icon: CalendarDays },
            { label: "QR", path: "/qr", icon: QrCode, isCenter: true },
            {
                label: "Presensi",
                path: "/presensi-siswa",
                icon: ClipboardCheck,
            },
            { label: "Profil", path: "/profil", icon: User },
        ],
    };

    const bottomNav = bottomNavByRole[user.role] || [];
    const currentPath = usePage().url;
    const handleLogout = () => {
        router.post("/logout");
    };
    const isActive = (path) => currentPath === path;
    const activeClass = "bg-[#009788]/10 text-[#009788] font-semibold";
    const inactiveClass = "text-slate-600 hover:bg-[#009788]/5";

    return (
        <div className="min-h-screen bg-[#EEF8FD]">
            <Toaster position="top-right" />

            {/* Header Mobile */}
            <header className="bg-gradient-to-r from-[#009788] to-[#00b5a5] sticky top-0 z-30 shadow-lg md:hidden">
                <div className="flex flex-col items-center py-2 relative">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
                        aria-label="Buka menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <img
                        src="/images/icon.svg"
                        alt="Logo"
                        className="h-10 w-auto"
                    />
                    <span className="text-[11px] font-semibold text-white/90 mt-0.5 tracking-wide">
                        MAK NU 01 Kota Semarang
                    </span>
                </div>
            </header>

            {/* Sidebar Mobile */}
            <div
                className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${sidebarOpen ? "visible" : "invisible"}`}
            >
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setSidebarOpen(false)}
                ></div>
                <div
                    className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl rounded-r-2xl transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="p-4 flex items-center gap-3 shrink-0">
                        <img
                            src="/images/icon.svg"
                            alt="Logo"
                            className="h-8 w-auto"
                        />
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto text-slate-400"
                            aria-label="Tutup menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <nav className="p-1.5 flex-1 overflow-y-auto">
                        <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 mb-0.5">
                            Utama
                        </p>
                        {filterMenu(menuUtama).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-1 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <m.icon className="w-4 h-4 shrink-0" />
                                {m.label}
                            </Link>
                        ))}
                        {filterMenu(menuData).length > 0 && (
                            <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 mb-0.5">
                                Data
                            </p>
                        )}
                        {filterMenu(menuData).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-1 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <m.icon className="w-4 h-4 shrink-0" />
                                {m.label}
                            </Link>
                        ))}
                        {filterMenu(menuKeuangan).length > 0 && (
                            <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 mb-0.5">
                                Keuangan
                            </p>
                        )}
                        {filterMenu(menuKeuangan).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-1 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <m.icon className="w-4 h-4 shrink-0" />
                                {m.label}
                            </Link>
                        ))}
                        {filterMenu(menuKegiatan).length > 0 && (
                            <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 mb-0.5">
                                Kegiatan
                            </p>
                        )}
                        {filterMenu(menuKegiatan).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-1 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <m.icon className="w-4 h-4 shrink-0" />
                                {m.label}
                            </Link>
                        ))}
                        <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 mb-0.5">
                            Lainnya
                        </p>
                        {filterMenu(menuLainnya).map((m) => (
                            <Link
                                key={m.path}
                                href={m.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-1 rounded-xl text-sm ${isActive(m.path) ? activeClass : inactiveClass}`}
                            >
                                <m.icon className="w-4 h-4 shrink-0" />
                                {m.label}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-1 rounded-xl text-sm text-red-500 font-medium hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            Logout
                        </button>
                    </nav>
                </div>
            </div>

            {/* Sidebar Desktop */}
            <aside
                className={`hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-full md:bg-white md:shadow-xl z-20 transition-all duration-300 rounded-r-3xl ${sidebarCollapsed ? "w-20" : "w-60"}`}
            >
                <div className="p-4 flex items-center justify-center shrink-0">
                    <img
                        src="/images/icon.svg"
                        alt="Logo"
                        className="h-7 w-auto"
                    />
                </div>
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-16 w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center text-xs text-slate-400 hover:text-[#009788]"
                    aria-label="Toggle sidebar"
                >
                    {sidebarCollapsed ? (
                        <PanelLeftOpen className="w-3.5 h-3.5" />
                    ) : (
                        <PanelLeftClose className="w-3.5 h-3.5" />
                    )}
                </button>
                <nav className="px-2 flex-1 space-y-0 overflow-y-auto">
                    {!sidebarCollapsed && (
                        <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 mb-0.5">
                            Utama
                        </p>
                    )}
                    {filterMenu(menuUtama).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <m.icon className="w-4 h-4 shrink-0" />
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                    {filterMenu(menuData).length > 0 && !sidebarCollapsed && (
                        <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 mb-0.5">
                            Data
                        </p>
                    )}
                    {filterMenu(menuData).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <m.icon className="w-4 h-4 shrink-0" />
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                    {filterMenu(menuKeuangan).length > 0 &&
                        !sidebarCollapsed && (
                            <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 mb-0.5">
                                Keuangan
                            </p>
                        )}
                    {filterMenu(menuKeuangan).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <m.icon className="w-4 h-4 shrink-0" />
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                    {filterMenu(menuKegiatan).length > 0 &&
                        !sidebarCollapsed && (
                            <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 mb-0.5">
                                Kegiatan
                            </p>
                        )}
                    {filterMenu(menuKegiatan).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <m.icon className="w-4 h-4 shrink-0" />
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                    {!sidebarCollapsed && (
                        <p className="px-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 mb-0.5">
                            Lainnya
                        </p>
                    )}
                    {filterMenu(menuLainnya).map((m) => (
                        <Link
                            key={m.path}
                            href={m.path}
                            className={`flex items-center gap-3 px-3 py-1 rounded-xl text-xs cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${isActive(m.path) ? activeClass : inactiveClass}`}
                            title={sidebarCollapsed ? m.label : ""}
                        >
                            <m.icon className="w-4 h-4 shrink-0" />
                            {!sidebarCollapsed && m.label}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className={`w-full text-red-500 text-xs font-medium hover:bg-red-50 rounded-xl px-3 py-1 ${sidebarCollapsed ? "justify-center flex" : "text-left flex items-center gap-3"}`}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main
                className={`pb-24 md:pb-6 transition-all duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-60"}`}
            >
                <div className="p-4 md:p-6">{children}</div>
            </main>

            {/* Bottom Nav Mobile */}
            <nav className="fixed bottom-3 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 z-30 md:hidden">
                <div className="flex items-end justify-around px-2 py-1.5 relative">
                    {bottomNav.map((b) =>
                        b.isCenter ? (
                            <Link
                                key={b.path}
                                href={b.path}
                                className="flex flex-col items-center -mt-7 relative z-10"
                            >
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-all ${isActive(b.path) ? "bg-gradient-to-r from-[#009788] to-[#00b5a5] scale-110" : "bg-gradient-to-r from-[#009788] to-[#00b5a5]"}`}
                                >
                                    <b.icon className="w-6 h-6 text-white" />
                                </div>
                                <span
                                    className={`text-[10px] font-bold mt-0.5 ${isActive(b.path) ? "text-[#009788]" : "text-slate-400"}`}
                                >
                                    {b.label}
                                </span>
                            </Link>
                        ) : (
                            <Link
                                key={b.path}
                                href={b.path}
                                className={`flex flex-col items-center py-1.5 px-1 min-w-[52px] transition-all ${isActive(b.path) ? "text-[#009788] scale-110" : "text-slate-400 hover:text-[#00b5a5]"}`}
                            >
                                <div
                                    className={`p-1.5 rounded-full transition-all ${isActive(b.path) ? "bg-[#009788]/10" : ""}`}
                                >
                                    <b.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold mt-0.5">
                                    {b.label}
                                </span>
                            </Link>
                        ),
                    )}
                </div>
            </nav>
        </div>
    );
}
