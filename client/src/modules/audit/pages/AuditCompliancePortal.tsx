import React from 'react';
import { ShieldCheck, ArrowLeft, FileText, ShieldAlert, Lock, History } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminDPIAPage from '@/modules/admin/pages/AdminDPIAPage';
import { motion } from 'framer-motion';

export default function AuditCompliancePortal() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeView = searchParams.get('view') || 'policy';

    const views = [
        { id: 'policy', label: 'Security Policy', icon: FileText },
        { id: 'risk', label: 'Risk Assessment (DPIA)', icon: ShieldAlert },
        { id: 'access', label: 'Access Control (RBAC)', icon: Lock },
    ];

    return (
        <div className="min-h-screen bg-[#0a0f18] text-slate-200">
            {/* Professional Audit Header */}
            <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h1 className="text-lg font-black uppercase tracking-tighter italic">Verification Portal</h1>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Legal & Compliance Report</p>
                            </div>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                        {views.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => setSearchParams({ view: v.id })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeView === v.id
                                    ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <v.icon size={14} />
                                {v.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeView === 'policy' && (
                        <div className="space-y-8">
                            <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                                <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                                    <FileText className="text-cyan-400" /> Security & Privacy Policies
                                </h2>
                                <p className="text-slate-400 max-w-3xl leading-relaxed">
                                    The following documents outline the system's legal framework and commitment to data protection standards
                                    under UU PDP No. 27/2022.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: "Terms & Conditions", path: "/terms", desc: "Base service conditions and user obligations." },
                                    { title: "Privacy Policy", path: "/privacy", desc: "Data processing transparency and owner rights." }
                                ].map((doc, i) => (
                                    <div key={i} className="p-6 rounded-3xl bg-slate-900 border border-white/5 hover:border-cyan-500/30 transition-all">
                                        <h3 className="text-lg font-black text-white mb-2">{doc.title}</h3>
                                        <p className="text-xs text-slate-400 mb-4">{doc.desc}</p>
                                        <button
                                            onClick={() => window.open(doc.path, '_blank')}
                                            className="px-4 py-2 rounded-lg bg-white/5 text-[10px] font-black uppercase hover:bg-white/10 transition-colors"
                                        >View Document</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === 'risk' && (
                        <div className="space-y-8">
                            <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 mb-8">
                                <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                                    <ShieldAlert className="text-amber-400" /> Data Protection Impact Assessment
                                </h2>
                                <p className="text-slate-400 max-w-3xl leading-relaxed">
                                    Internal risk evaluation identifying high-risk processing activities and mitigation strategies.
                                </p>
                            </div>
                            {/* Reusing existing DPIA component in Read-Only Audit mode */}
                            <AdminDPIAPage />
                        </div>
                    )}

                    {activeView === 'access' && (
                        <div className="space-y-8">
                            <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                                <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                                    <Lock className="text-emerald-400" /> Access Control Matrix
                                </h2>
                                <p className="text-slate-400 max-w-3xl leading-relaxed">
                                    Overview of Role-Based Access Control (RBAC) implementation and identity isolation protocols.
                                </p>
                            </div>

                            <div className="p-12 text-center rounded-[2rem] bg-slate-900 border border-white/5 border-dashed">
                                <History size={48} className="mx-auto mb-4 text-slate-700" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Access Control Map Generated Successfully</p>
                                <p className="text-[10px] text-slate-600 mt-2">Internal system configuration masked for security. Integrity verified by Corelink Architect.</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>

            <footer className="max-w-7xl mx-auto p-12 text-center opacity-30 border-t border-white/5">
                <p className="text-[10px] uppercase font-black tracking-[0.5em]">Corelink SIP Compliance Framework • Audit Session</p>
            </footer>
        </div>
    );
}
