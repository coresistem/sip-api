import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    UserCheck,
    Users,
    UserPlus,
    Fingerprint,
    ClipboardCheck,
    LayoutDashboard,
    Link2,
    ShieldAlert,
    Globe,
    Zap,
    Briefcase,
    TrendingUp,
    Shield
} from 'lucide-react';

const EcosystemFlowPage = () => {
    const [activeTab, setActiveTab] = useState<'benefits' | 'onboarding' | 'integration'>('benefits');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 max-w-7xl mx-auto space-y-12 pb-24 text-white relative">

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/')}
                className="absolute top-8 left-6 md:left-12 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-slate-400 hover:text-white group z-50"
            >
                <ArrowRight size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Beranda
            </motion.button>

            {/* Header */}
            <header className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2"
                >
                    Knowledge Base: Roadmap Ekosistem
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent italic tracking-tighter"
                >
                    PANDUAN EKOSISTEM CSYSTEM
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed"
                >
                    Menghubungkan setiap elemen dunia panahan dalam satu dahan yang terintegrasi, transparan, dan berkelanjutan.
                </motion.p>
            </header>

            {/* Tab Switcher */}
            <div className="flex justify-center mt-8">
                <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setActiveTab('benefits')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'benefits'
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <TrendingUp size={18} />
                        1. Manfaat (Big Picture)
                    </button>
                    <button
                        onClick={() => setActiveTab('onboarding')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'onboarding'
                            ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <UserPlus size={18} />
                        2. Alur Masuk
                    </button>
                    <button
                        onClick={() => setActiveTab('integration')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'integration'
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Link2 size={18} />
                        3. Integrasi Peran
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="mt-12 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab === 'onboarding' && (
                        <motion.div
                            key="onboarding"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-16"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                                <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-slate-800 -z-0" />
                                <StepNode number="01" icon={<Globe size={32} className="text-blue-400" />} title="Guest Entry" desc="Akses Landing Page sebagai tamu untuk mengenal sistem." tag="Public" />
                                <StepNode number="02" icon={<Fingerprint size={32} className="text-purple-400" />} title="Validasi" desc="Verifikasi NIK & data fisik untuk memastikan keunikan user." tag="Identity" />
                                <StepNode number="03" icon={<ClipboardCheck size={32} className="text-cyan-400" />} title="CoreID Gen" desc="Satu ID unik untuk selamanya di seluruh ekosistem." tag="Master Data" />
                                <StepNode number="04" icon={<LayoutDashboard size={32} className="text-emerald-400" />} title="Profile Details" desc="Lengkapi data klub & kategori untuk Digital ID resmi." tag="Ready" />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'integration' && (
                        <motion.div
                            key="integration"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-16"
                        >
                            <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -z-10 transform -translate-y-1/2 mx-24" />
                                <FlowCard delay={0.1} icon={<UserCheck size={40} className="text-slate-400" />} title="Atlet" subtitle="Initiator" color="border-slate-700" badge={{ text: "Join Request", color: "bg-slate-800 text-slate-300" }}>
                                    <p className="text-sm text-slate-400">Atlet mengajukan diri ke Klub pilihan untuk mulai terintegrasi secara teknis.</p>
                                </FlowCard>
                                <ArrowIcon delay={0.2} />
                                <FlowCard delay={0.3} icon={<Users size={40} className="text-emerald-400" />} title="Klub" subtitle="Validator 1" color="border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]" badge={{ text: "Physical Check", color: "bg-emerald-500/20 text-emerald-400" }}>
                                    <p className="text-sm text-slate-400">Klub melakukan verifikasi fisik (orang ini benar berlatih di sini) dan menyetujui request.</p>
                                </FlowCard>
                                <ArrowIcon delay={0.4} />
                                <FlowCard delay={0.5} icon={<ShieldCheck size={40} className="text-yellow-400" />} title="Perpani" subtitle="Validator 2" color="border-yellow-500/50 shadow-[0_0_30px_-5px_rgba(234,179,8,0.2)]" badge={{ text: "Legal Seal", color: "bg-yellow-500/20 text-yellow-400" }}>
                                    <p className="text-sm text-slate-400">Perpani memvalidasi legalitas Klub. Saat Klub valid, semua anggotanya resmi secara nasional.</p>
                                </FlowCard>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'benefits' && (
                        <motion.div
                            key="benefits"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            className="space-y-12"
                        >
                            {/* Garis Besar Section */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <BenefitCard
                                    icon={<Zap className="text-yellow-400" />}
                                    title="Efisiensi 100x"
                                    desc="Verifikasi klub otomatis memverifikasi ribuan atlet. Tidak ada lagi tumpukan berkas manual."
                                />
                                <BenefitCard
                                    icon={<Shield className="text-cyan-400" />}
                                    title="Data Akurat"
                                    desc="NIK terintegrasi mencegah manipulasi umur dan data ganda antar klub atau daerah."
                                />
                                <BenefitCard
                                    icon={<Briefcase className="text-purple-400" />}
                                    title="Ekosistem Bisnis"
                                    desc="Akses mudah ke Supplier, EO Turnamen, dan Wasit dalam satu marketplace terpercaya."
                                />
                                <BenefitCard
                                    icon={<TrendingUp className="text-emerald-400" />}
                                    title="Analytics Atlet"
                                    desc="Progres skor dan kurikulum dari pelatih tercatat rapi secara digital seumur hidup."
                                />
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[40px] p-8 md:p-12">
                                <div className="max-w-3xl mx-auto space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Garis Besar Filosofi Csystem</h2>
                                        <p className="text-slate-400 text-sm italic">"A Systematic Growth for Indonesia Archery"</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
                                                <span className="font-black text-cyan-400">1</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-100">Bukan Sekadar Database</h4>
                                                <p className="text-sm text-slate-400 mt-1">Sistem ini dirancang bukan hanya untuk menyimpan data, tapi untuk menghidupkan interaksi antar Peran (Atlet, Orang Tua, Klub, Pelatih, EO, Wasit, Supplier, Sekolah, dan Perpani).</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                                                <span className="font-black text-emerald-400">2</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-100">Rantai Kepercayaan (Chain of Trust)</h4>
                                                <p className="text-sm text-slate-400 mt-1">Kami menggunakan model kepercayaan terdistribusi. Perpani mempercayai Klub, Klub memverifikasi Anggotanya. Beban kerja terbagi adil dan hasil data tetap valid.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                                                <span className="font-black text-purple-400">3</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-100">Portal Masa Depan Panahan</h4>
                                                <p className="text-sm text-slate-400 mt-1">Semua turnamen, skor nasional, lisensi pelatih, hingga pemesanan seragam klub dilakukan di sini. Csystem adalah rumah digital bagi seluruh industri panahan.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-24 text-center border-t border-slate-900 pt-12">
                <div className="flex flex-wrap justify-center gap-12 text-slate-500 text-xs font-black uppercase tracking-widest">
                    <span>Precision</span>
                    <span>Transparency</span>
                    <span>Growth</span>
                </div>
            </motion.div>
        </div>
    );
};

// Components
const StepNode = ({ number, icon, title, desc, tag }: any) => (
    <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center font-black text-slate-600">{number}</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-white/5">{tag}</span>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 hover:border-slate-500/20 transition-all group h-full">
            <div className="mb-4 group-hover:scale-110 transition-transform transform origin-left">{icon}</div>
            <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed text-xs">{desc}</p>
        </div>
    </div>
);

const FlowCard = ({ delay, icon, title, subtitle, children, color, badge }: any) => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }} className={`relative z-10 bg-slate-950 p-6 rounded-3xl border-2 ${color} w-full md:w-80 transition-all duration-300 group`}>
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-xl group-hover:rotate-12 transition-transform duration-300">{icon}</div>
            {badge && <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${badge.color}`}>{badge.text}</span>}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-500 text-sm font-medium mb-4">{subtitle}</p>
        {children}
    </motion.div>
);

const BenefitCard = ({ title, desc, icon }: any) => (
    <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-[32px] hover:bg-slate-900/50 transition-all border-b-4 border-b-transparent hover:border-b-cyan-500/50">
        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/5">{icon}</div>
        <h4 className="font-bold text-slate-100 mb-2">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

const ArrowIcon = ({ delay }: { delay: number }) => (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.5 }} className="hidden md:flex text-slate-800"><ArrowRight size={32} /></motion.div>
);

export default EcosystemFlowPage;
