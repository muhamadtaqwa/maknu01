import AppLayout from "@/Layouts/AppLayout";

export default function Emis() {
    return (
        <AppLayout>
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Export EMIS
                </h2>

                <div className="space-y-3">
                    <div className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#3D7ABA]/10 rounded-2xl flex items-center justify-center">
                                    <i className="fa-solid fa-user-graduate text-2xl text-[#3D7ABA]"></i>
                                </div>
                                <h3 className="font-semibold text-sm text-slate-800">
                                    Data Santri
                                </h3>
                            </div>
                            <a
                                href="/export/santri"
                                className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
                            >
                                Export
                            </a>
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-sky-100 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#20B5E8]/10 rounded-2xl flex items-center justify-center">
                                    <i className="fa-solid fa-chalkboard-user text-2xl text-[#20B5E8]"></i>
                                </div>
                                <h3 className="font-semibold text-sm text-slate-800">
                                    Data Ustadz
                                </h3>
                            </div>
                            <a
                                href="/export/ustadz"
                                className="bg-gradient-to-r from-[#3D7ABA] to-[#20B5E8] text-white px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-lg"
                            >
                                Export
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
