import React from 'react';
import AuditLogsPage from '@/modules/admin/pages/AuditLogsPage';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuditActivityLogsPage() {
    const navigate = useNavigate();

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
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Activity Transparency Report</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase italic">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Security Feed
                    </div>
                </div>
            </div>

            {/* Audit Content Wrapper */}
            <main className="max-w-7xl mx-auto p-8">
                <div className="mb-8 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                    <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2">Activity Audit Trail</h2>
                    <p className="text-sm text-slate-400 max-w-2xl">
                        This portal provides a point-in-time snapshot of system activities for compliance verification purposes.
                        Data is pulled directly from immutable system logs.
                    </p>
                </div>

                {/* Reuse the existing AuditLogsPage component */}
                <AuditLogsPage />
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto p-12 text-center opacity-30 border-t border-white/5">
                <p className="text-[10px] uppercase font-black tracking-[0.5em]">Corelink SIP Compliance Framework</p>
            </footer>
        </div>
    );
}
