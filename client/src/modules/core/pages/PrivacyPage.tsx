import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database } from 'lucide-react';

const PrivacyPage = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: <ShieldCheck size={20} />,
            title: "1. Ruang Lingkup",
            content: "Kebijakan ini berlaku untuk seluruh pemangku kepentingan dalam ekosistem SIP, termasuk namun tidak terbatas pada Atlet, Orang Tua/Wali (untuk subjek data anak), Manpower Klub, dan Verifikator Institusi."
        },
        {
            icon: <Database size={20} />,
            title: "2. Kapasitas Hukum",
            content: (
                <div className="space-y-3">
                    <p>Corelink bertindak sebagai <strong className="text-emerald-400">Pemroses Data (Data Processor)</strong>. Tanggung jawab hukum sebagai <strong className="text-emerald-400">Pengendali Data (Data Controller)</strong> berada pada Institusi (Klub/EO) yang menginstruksikan pemrosesan data.</p>
                </div>
            )
        },
        {
            icon: <Eye size={20} />,
            title: "3. Inventarisasi Data",
            content: (
                <div className="space-y-2 text-sm text-slate-400">
                    <p><strong className="text-slate-200">Data Identitas:</strong> Biometrik (Foto), NIK, Nama sesuai identitas hukum.</p>
                    <p><strong className="text-slate-200">Data Persyaratan:</strong> Scan dokumen (KTP/KK/Akta) yang diunggah secara sukarela guna kepentingan kualifikasi event olahraga.</p>
                </div>
            )
        },
        {
            icon: <Lock size={20} />,
            title: "4. Metodologi Keamanan",
            content: (
                <ul className="list-disc pl-4 space-y-1">
                    <li>Enkripsi data diam (at-rest) menggunakan AES-256.</li>
                    <li>Audit Trail terperinci mencatat setiap akses ke dokumen sensitif.</li>
                    <li>Isolasi data antar-tenan (Klub tidak bisa melihat data klub lain tanpa izin).</li>
                </ul>
            )
        },
        {
            icon: <Database size={20} />,
            title: "5. Kebijakan Retensi",
            content: (
                <div className="space-y-3">
                    <p>Kami menerapkan prinsip meminimalisir data. Dokumen bukti (scan) akan dihapus secara otomatis 30 hari setelah proses verifikasi event dinyatakan selesai.</p>
                    <div className="overflow-hidden rounded-xl border border-white/5 bg-black/20">
                        <table className="w-full text-[10px] text-left">
                            <tbody className="text-slate-400">
                                <tr>
                                    <td className="p-2 border-b border-white/5">Profil Dasar</td>
                                    <td className="p-2 border-b border-white/5 font-bold">Selama Akun Aktif</td>
                                </tr>
                                <tr>
                                    <td className="p-2">Dokumen Bukti</td>
                                    <td className="p-2 font-bold">30 Hari Pasca-Event</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        },
        {
            icon: <ShieldCheck size={20} />,
            title: "6. Hak Pemilik Data",
            content: "Sesuai Bab V UU PDP No. 27/2022, Anda berhak untuk: Mengakses, Memperbaiki ketidakakuratan, Menghentikan pemrosesan, dan Menghapus data (Right to Erasure) melalui menu pengaturan profil."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-cyan-600/10 blur-[130px] rounded-full" />
            </div>

            <div className="relative max-w-4xl mx-auto px-6 py-20">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-slate-400 hover:text-white group mb-12"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Kembali
                </motion.button>

                {/* Header */}
                <header className="space-y-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest"
                    >
                        <ShieldCheck size={14} />
                        UU PDP NO. 27 TAHUN 2022 COMPLIANT
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-white italic tracking-tight"
                    >
                        KEBIJAKAN <span className="text-emerald-400">PRIVASI</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg leading-relaxed max-w-2xl"
                    >
                        Kebijakan ini menjelaskan bagaimana <strong className="text-white">Sistem Integrasi Panahan</strong> memproses data pribadi Anda sesuai regulasi perlindungan data terbaru.
                    </motion.p>
                </header>

                {/* Content Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section, index) => (
                        <motion.section
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-sm hover:border-emerald-500/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                {section.icon}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-4">
                                {section.title}
                            </h2>
                            <div className="text-slate-400 leading-relaxed text-sm">
                                {section.content}
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Rights Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-white/5 backdrop-blur-sm"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Hak Pemilik Data</h2>
                            <ul className="space-y-3">
                                {[
                                    "Mengakses data pribadi",
                                    "Memperbaiki data yang tidak akurat",
                                    "Menghapus data (Hak untuk dilupakan)",
                                    "Menarik persetujuan pemrosesan",
                                    "Menerima portabilitas data"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Perlindungan Anak</h2>
                            <ul className="space-y-3">
                                {[
                                    "Akses melalui orang tua/wali sah",
                                    "Persetujuan wali wajib (Double Opt-in)",
                                    "Pembatasan akses data primer ketat"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 pt-10 border-t border-white/5 text-center space-y-4"
                >
                    <p className="text-slate-500 text-sm">
                        Terakhir diperbarui: 31 Januari 2026
                    </p>
                    <p className="text-slate-400 text-sm font-medium">
                        Keamanan data Anda adalah prioritas kami. Hubungi <span className="text-emerald-400">privacy@corelink.id</span> untuk bantuan teknis.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPage;
