import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Scale, CheckCircle2 } from 'lucide-react';

const TermsPage = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Definisi & Interpretasi",
            content: (
                <ul className="space-y-2">
                    <li><strong className="text-cyan-400">Sistem:</strong> Sistem Integrasi Panahan (SIP) - Platform PWA yang dikelola Corelink.</li>
                    <li><strong className="text-cyan-400">Penyedia Sistem:</strong> Corelink System (Csystem) bertindak sebagai penyedia sarana teknis.</li>
                    <li><strong className="text-cyan-400">Pihak Berwenang:</strong> Institusi resmi seperti Klub, EO, PERPANI, KONI, dan DISPORA.</li>
                    <li><strong className="text-cyan-400">Manpower:</strong> Staf operasional atau verifikator yang ditunjuk oleh Pihak Berwenang.</li>
                </ul>
            )
        },
        {
            title: "Ruang Lingkup Layanan",
            content: "Sistem memfasilitasi manajemen database profil atlet (One User, Multiple Profiles), digitalisasi dokumen persyaratan lomba, dan pemberian akses verifikasi kepada penyelenggara event."
        },
        {
            title: "Peran & Validasi Dokumen",
            content: "Penyedia Sistem hanya menyediakan wadah digital. Validasi substansial terhadap dokumen (KTP/KK/Akta) sepenuhnya menjadi tanggung jawab verifikator institusi (Klub/EO/Federasi). Penyedia tidak memberikan jaminan atas keaslian dokumen yang diunggah pengguna."
        },
        {
            title: "Keamanan Akun & Core ID",
            content: "Setiap pengguna bertanggung jawab penuh atas keamanan kredensial login dan penggunaan Core ID masing-masing. Segala tindakan yang diambil melalui akun tersebut dianggap sebagai tindakan sah pemilik akun."
        },
        {
            title: "Pembatasan Tanggung Jawab (Indemnification)",
            content: "Penyedia Sistem dibebaskan dari segala tuntutan hukum yang timbul akibat: (a) Ketidakcocokan data atlet saat lomba, (b) Keputusan administratif/diskualifikasi oleh EO, (c) Penyalahgunaan data oleh pihak berwenang yang telah diberikan akses sah."
        },
        {
            title: "Ketersediaan Layanan (Uptime)",
            content: "Penyedia Sistem berupaya menjaga uptime 99% melalui infrastruktur cloud. Namun, pemeliharaan sistem terencana akan diberitahukan minimal 24 jam sebelumnya melalui dashboard."
        },
        {
            title: "Hukum & Yurisdiksi",
            content: "Ketentuan ini tunduk pada Hukum Republik Indonesia. Perselisihan yang tidak dapat diselesaikan melalui mediasi akan dibawa ke wilayah hukum Pengadilan Negeri Tangerang Selatan."
        },
        {
            title: "Persetujuan Elektronik",
            content: "Dengan melanjutkan penggunaan sistem ini, Anda memberikan persetujuan elektronik yang setara dengan tanda tangan basah sesuai UU ITE No. 11 Tahun 2008."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
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
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest"
                    >
                        <Scale size={14} />
                        Legal Documents
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-white italic tracking-tight"
                    >
                        SYARAT & <span className="text-cyan-400">KETENTUAN</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg leading-relaxed max-w-2xl"
                    >
                        Harap baca dengan teliti ketentuan penggunaan platform Csystem untuk memahami hak dan kewajiban Anda sebagai pengguna ekosistem panahan kami.
                    </motion.p>
                </header>

                {/* Content */}
                <div className="space-y-12">
                    {sections.map((section, index) => (
                        <motion.section
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-colors group"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
                                    {index + 1}
                                </span>
                                {section.title}
                            </h2>
                            <p className="text-slate-400 leading-relaxed pl-11">
                                {section.content}
                            </p>
                        </motion.section>
                    ))}
                </div>

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
                        Jika Anda memiliki pertanyaan mengenai Ketentuan ini, silakan hubungi <span className="text-cyan-400">legal@corelink.id</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsPage;
