import React, { useState } from 'react';
import CsystemDropdownSearch from '@/modules/core/components/ui/CsystemDropdownSearch';
import { Target, Users, Shield, Trophy, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_OPTIONS = [
    { value: '01', label: 'Andi Pranata', description: 'Senior Athlete • Recurve 70m', icon: <Target className="w-4 h-4" /> },
    { value: '02', label: 'Jakarta Archery Club', description: 'Institutional Member • Jakarta', icon: <Shield className="w-4 h-4" /> },
    { value: '03', label: 'Ahmad Trainer', description: 'Master Coach • Elite Level', icon: <Users className="w-4 h-4" /> },
    { value: '04', label: 'Siti Rahayu', description: 'Archery Judge • National Grade', icon: <Shield className="w-4 h-4" /> },
    { value: '05', label: 'Bleep Test Module', description: 'Performance Lab • Integrated', icon: <Activity className="w-4 h-4" /> },
    { value: '06', label: 'National Championship', description: 'Event Organizer • Active', icon: <Trophy className="w-4 h-4" /> },
];

export default function DropdownSearchLab() {
    const navigate = useNavigate();
    const [isMultiMode, setIsMultiMode] = useState(true);
    const [selectedValue, setSelectedValue] = useState<any>([]);

    // Reset value when switching mode to avoid type mismatch
    const handleModeChange = (multi: boolean) => {
        setIsMultiMode(multi);
        setSelectedValue(multi ? [] : "");
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white relative">
            <button
                onClick={() => navigate('/labs')}
                className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Sandbox
            </button>

            <header className="mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                    Unified Search Control
                </h1>
                <p className="text-slate-400 max-w-2xl">
                    Satu komponen cerdas untuk semua kebutuhan pencarian—mulai dari memilih profil tunggal hingga melakukan <strong>Notification Blast</strong> ke banyak anggota sekaligus.
                </p>
            </header>

            <div className="max-w-3xl mx-auto">
                <div className="space-y-8 card p-10 bg-slate-900/40 border-slate-800 backdrop-blur-xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">Target Selection</h2>
                                <p className="text-sm text-slate-500">Tentukan cakupan target informasi atau aksi Anda.</p>
                            </div>

                            {/* Mode Toggle Selection */}
                            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                                <button
                                    onClick={() => handleModeChange(false)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${!isMultiMode ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    SINGLE
                                </button>
                                <button
                                    onClick={() => handleModeChange(true)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${isMultiMode ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    MULTI (PLURAL)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-cyan-400/70 ml-1">Search Member / Module</label>
                                <CsystemDropdownSearch
                                    isMulti={isMultiMode}
                                    options={MOCK_OPTIONS}
                                    value={selectedValue}
                                    onChange={setSelectedValue}
                                    placeholder={isMultiMode ? "Tag multiple members for blast..." : "Select a specific target..."}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-950/80 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-slate-600 mb-2 tracking-widest">Target Mode</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${isMultiMode ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                        <span className="text-sm font-black text-white uppercase italic">
                                            {isMultiMode ? 'Plural Action' : 'Singular Action'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-950/80 border border-white/5 rounded-2xl">
                                    <p className="text-[10px] uppercase font-bold text-slate-600 mb-2 tracking-widest">Selection Count</p>
                                    <span className="text-xl font-black text-cyan-400">
                                        {Array.isArray(selectedValue) ? selectedValue.length : (selectedValue ? 1 : 0)}
                                    </span>
                                    <span className="text-xs text-slate-500 ml-2 font-bold uppercase">Targets</span>
                                </div>
                            </div>

                            {/* Use Case Example */}
                            {isMultiMode && Array.isArray(selectedValue) && selectedValue.length > 0 && (
                                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-fade-in">
                                    <p className="text-xs text-emerald-400 font-bold mb-2 flex items-center gap-2">
                                        <Activity size={14} />
                                        Blast Ready: Notification
                                    </p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                        "Halo {selectedValue.length} anggota, mohon segera melakukan penyelesaian administrasi pembayaran iuran bulanan Club..."
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 max-w-3xl mx-auto bg-cyan-400/5 border border-cyan-400/20 rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-cyan-400 font-bold mb-3">
                    <Shield size={18} />
                    Architectural Utility
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Komponen ini dirancang untuk menangani beban data besar. Dengan mode <strong>Single/Multi</strong> yang bisa berganti secara dinamis, alat ini sangat cocok untuk fitur administrasi masal seperti <em>Notification Blast</em>, <em>Bulk Invoicing</em>, atau <em>Tournament Assignments</em>.
                </p>
            </div>
        </div>
    );
}
