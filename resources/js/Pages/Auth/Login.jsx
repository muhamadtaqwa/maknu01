import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [showLupa, setShowLupa] = useState(false);

    const { data, setData, post, errors, processing } = useForm({
        username: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/login");
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#EEF8FD] flex items-center justify-center p-6 md:p-0">
            <div
                className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#3D7ABA]/20 blur-3xl"
                aria-hidden="true"
            ></div>
            <div
                className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-[#20B5E8]/20 blur-3xl"
                aria-hidden="true"
            ></div>

            <div className="relative w-full max-w-4xl">
                <div className="grid md:grid-cols-2 md:gap-0 items-center">
                    <div className="hidden md:flex flex-col items-center justify-center p-10 text-center">
                        <img
                            src="/images/logo-alamanah.png"
                            alt="Logo Al Amanah"
                            className="w-64 mb-6"
                        />
                        <h1 className="text-3xl font-bold text-slate-800">
                            Al-Amanah Mobile
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Sistem Informasi Pondok Pesantren
                        </p>
                        <p className="mt-6 text-xs text-slate-400">
                            © {new Date().getFullYear()} Pondok Pesantren
                            Al-Amanah
                        </p>
                    </div>

                    <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
                        <div className="mb-8 text-center md:hidden">
                            <img
                                src="/images/logo-alamanah.png"
                                alt="Logo Al Amanah"
                                className="mx-auto w-56"
                            />
                            <h1 className="mt-4 text-2xl font-bold text-slate-800">
                                Al-Amanah Mobile
                            </h1>
                            <p className="mt-2 text-slate-500 text-sm">
                                Sistem Informasi Pondok Pesantren
                            </p>
                        </div>

                        <div className="rounded-[30px] border border-sky-100 bg-white p-8 shadow-2xl">
                            <h2 className="mb-6 text-center text-2xl font-bold text-slate-700">
                                Selamat Datang
                            </h2>

                            {errors.auth && (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                                >
                                    {errors.auth}
                                </div>
                            )}

                            <form
                                onSubmit={submit}
                                className="space-y-5"
                                noValidate
                            >
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="mb-2 block text-sm font-semibold text-slate-600"
                                    >
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        value={data.username}
                                        onChange={(e) =>
                                            setData("username", e.target.value)
                                        }
                                        disabled={processing}
                                        placeholder="Masukkan Username"
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 outline-none transition focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                                    />
                                    {errors.username && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-slate-600"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            placeholder="Masukkan Password"
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 pr-14 outline-none transition focus:border-[#20B5E8] focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            disabled={processing}
                                            aria-label={
                                                showPassword
                                                    ? "Sembunyikan password"
                                                    : "Tampilkan password"
                                            }
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#3D7ABA] hover:text-[#20B5E8]"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} />
                                            ) : (
                                                <Eye size={20} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowLupa(true)}
                                        className="rounded text-sm text-[#3D7ABA] hover:underline focus:outline-none focus:ring-2 focus:ring-sky-200"
                                    >
                                        Lupa Password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-2xl bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {processing ? "Sedang Login..." : "Login"}
                                </button>
                            </form>
                        </div>

                        <p className="mt-6 text-center text-sm text-slate-500 md:hidden">
                            © {new Date().getFullYear()} Pondok Pesantren
                            Al-Amanah
                        </p>
                    </div>
                </div>
            </div>

            {/* Lupa Password Modal */}
            {showLupa && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowLupa(false)}
                        aria-hidden="true"
                    ></div>
                    <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-sm p-8 border border-sky-100 text-center">
                        <h3 className="font-semibold text-lg">
                            Lupa Password?
                        </h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Hubungi Admin Pondok
                        </p>
                        <p className="text-xl font-bold text-[#3D7ABA] mt-2">
                            08985949733
                        </p>
                        <button
                            onClick={() => setShowLupa(false)}
                            className="mt-6 w-full bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white py-2.5 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] transition"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
