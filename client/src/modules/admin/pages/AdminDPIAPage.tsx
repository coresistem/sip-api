import React from 'react';
import { motion } from 'framer-motion';
import {
    ShieldAlert,
    Database,
    Share2,
    Lock,
    Trash2,
    FileCheck,
    History,
    Users,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

const AdminDPIAPage = () => {
    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-[0.2em]">
                        <ShieldAlert size={14} />
                        Internal Confidential Document
                    </div>
                    <h1 className="text-3xl font-black text-white italic tracking-tight">
                        DATA PROTECTION IMPACT ASSESSMENT <span className="text-rose-500">(DPIA)</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl">
                        Penilaian komprehensif terhadap dampak pelindungan data pribadi untuk Sistem Integrasi Panahan (SIP) sesuai standar UU PDP No. 27 Tahun 2022.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 rounded-xl bg-slate-800 border border-white/5 text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Versi</div>
                        <div className="text-white font-black italic">1.1</div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Status</div>
                        <div className="text-emerald-400 font-black italic">Approved</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Info */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Peran Para Pihak */}
                    <section className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-6">
                        <h2 className="flex items-center gap-2 text-white font-bold text-lg">
                            <Users size={20} className="text-cyan-400" />
                            2. Peran Para Pihak
                        </h2>
                        <div className="space-y-3">
                            {[
                                { party: "Penyedia Sistem", role: "Data Processor", icon: <Database /> },
                                { party: "Klub / EO / Federasi", role: "Data Controller", icon: <Share2 /> },
                                { party: "Atlet / Wali", role: "Data Owner", icon: <Users /> }
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="text-slate-400">{p.icon}</div>
                                        <div className="text-sm font-bold text-white tracking-tight">{p.party}</div>
                                    </div>
                                    <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{p.role}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Jenis Data */}
                    <section className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-6">
                        <h2 className="flex items-center gap-2 text-white font-bold text-lg">
                            <FileCheck size={20} className="text-emerald-400" />
                            3. Jenis Data
                        </h2>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                                <div>
                                    <div className="text-sm font-bold text-white">Data Umum Atlet</div>
                                    <p className="text-xs text-slate-500">Nama, Tanggal Lahir, Klub, ID Anggota</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2" />
                                <div>
                                    <div className="text-sm font-bold text-white">Dokumen Identitas (Bersyarat)</div>
                                    <p className="text-xs text-slate-500 italic text-rose-400/70">KTP, KK, Akta (Sensitif - Risiko Tinggi)</p>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>

                {/* Right Column: Dynamic Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Alur Data & Mitigasi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Alur Data */}
                        <section className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-6">
                            <h2 className="flex items-center gap-2 text-white font-bold text-lg text-amber-400">
                                <History size={20} />
                                4. Alur Data (Lifecycle)
                            </h2>
                            <div className="relative space-y-8 pl-4 border-l border-white/10 ml-2">
                                {[
                                    { t: "Upload", d: "Pengguna mengunggah dokumen via SSL" },
                                    { t: "Enkripsi", d: "Sistem menyimpan dengan AES-256 encryption" },
                                    { t: "Akses", d: "Akses diberikan kepada verifier resmi (RBAC)" },
                                    { t: "Verifikasi", d: "Verifikasi dilakukan oleh pihak berwenang" },
                                    { t: "Purging", d: "Dokumen dihapus otomatis pasca-verifikasi" }
                                ].map((step, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                        <div className="text-sm font-bold text-white">{step.t}</div>
                                        <p className="text-xs text-slate-500">{step.d}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Mitigasi */}
                        <section className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-6">
                            <h2 className="flex items-center gap-2 text-white font-bold text-lg text-emerald-400">
                                <Lock size={20} />
                                6. Strategi Mitigasi
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { label: "RBAC", d: "Role-Based Access Control ketat" },
                                    { label: "Audit Log", d: "Pencatatan setiap akses dokumen" },
                                    { label: "Auto-Delete", d: "Purging data otomatis (30 hari)" },
                                    { label: "Explicit Consent", d: "Persetujuan tertulis via digital signature" },
                                    { label: "Time Limit", d: "Pembatasan waktu akses data sensitif" }
                                ].map((m, i) => (
                                    <div key={i} className="flex gap-4 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                        <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-emerald-400">{m.label}</div>
                                            <p className="text-[10px] text-slate-500">{m.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Identifikasi Risiko & Residual */}
                    <section className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-6">
                        <h2 className="flex items-center gap-2 text-white font-bold text-lg text-rose-400">
                            <AlertTriangle size={20} />
                            5 & 7. Penilaian Risiko (Impact Analysis)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Identifikasi Risiko Utama</h3>
                                <div className="space-y-2">
                                    {[
                                        { r: "Akses Tidak Sah", i: "Kebocoran Data Pribadi", l: "Tinggi" },
                                        { r: "Penyalahgunaan Verifier", i: "Pelanggaran Hukum / Etika", l: "Sedang" },
                                        { r: "Data Anak (Junior)", i: "Risiko Hak Asasi / Eksploitasi", l: "Sangat Tinggi" }
                                    ].map((risk, i) => (
                                        <div key={i} className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="text-xs font-bold text-white">{risk.r}</div>
                                                <div className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-black uppercase">{risk.l}</div>
                                            </div>
                                            <div className="text-[10px] text-rose-400/70 italic">{risk.i}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center p-8 bg-slate-800/50 rounded-3xl border border-white/5 text-center">
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Kesimpulan Risiko Residual</div>
                                <div className="w-32 h-32 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <div className="text-2xl font-black text-emerald-500 italic">TER-</div>
                                    <div className="text-xs font-black text-white uppercase tracking-widest">KENDALI</div>
                                </div>
                                <p className="mt-6 text-[11px] text-slate-400 italic">
                                    "Berdasarkan mitigasi lapisan ke-3, risiko sisa berada pada level yang dapat diterima (Acceptable Risk)."
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Final Conclusion Footer */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900 to-emerald-500/10 p-8 rounded-[2rem] border border-emerald-500/20 text-center">
                <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">KESIMPULAN AKHIR</h2>
                <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed italic">
                    "Sebagai perantara teknis, Sistem Integrasi Panahan (SIP) dinyatakan <strong className="text-emerald-400 underline underline-offset-4 decoration-emerald-500/50">LAYAK DIOPERASIKAN</strong> dengan standar pengamanan dan tata kelola data pribadi yang telah diterapkan sesuai UU PDP No. 27 Tahun 2022."
                </p>
            </div>
        </div>
    );
};

export default AdminDPIAPage;
