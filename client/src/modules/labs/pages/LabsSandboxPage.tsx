import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Beaker, Globe, ChevronRight, Database, Activity } from 'lucide-react';

interface LabFeature {
    id: string;
    slug: string;
    name: string;
    description: string;
    routePath: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const LabsPage: React.FC = () => {
    const [features, setFeatures] = useState<LabFeature[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/labs/public`)
            .then(res => res.json())
            .then(data => {
                setFeatures(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                        <Beaker className="text-cyan-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Sandbox Laboratory
                        </h1>
                        <p className="text-slate-400">
                            Zona eksperimental untuk fitur standalone dan prototipe dari Si Cantik (AI Studio).
                        </p>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Dynamic Features from API */}
                    {features.map((feature) => (
                        <Link
                            key={feature.id}
                            to={feature.routePath}
                            className="group relative p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10"
                        >
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Globe className="h-6 w-6 text-cyan-400" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2 text-white">{feature.name}</h2>
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                {feature.description}
                            </p>
                            <div className="flex items-center text-cyan-400 text-sm font-medium">
                                Open Experiment
                                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}

                    {/* Integrated System Labs */}
                    <Link
                        to="/labs/data-integrity"
                        className="group relative p-6 bg-slate-900/80 border-2 border-emerald-500/20 rounded-3xl hover:border-emerald-500/50 transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-tighter rounded-bl-xl">Essential</div>
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                            <Database className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-black mb-1 text-white uppercase italic tracking-tighter">Integrità Hub</h2>
                        <p className="text-xs text-slate-400 mb-6">
                            Cluster conflict audit tool. Detect and verify duplicate system entities.
                        </p>
                        <div className="flex items-center text-emerald-400 text-xs font-black uppercase tracking-widest">
                            Access Hub
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link
                        to="/labs/bleep-test"
                        className="group relative p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-all"
                    >
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Activity className="h-6 w-6 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-white">Pro Bleep Test</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            Aerobic capacity evaluation system with audio-sync protocol.
                        </p>
                        <div className="flex items-center text-cyan-400 text-sm font-medium">
                            Launch Lab
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <div className="p-6 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-10 h-10 border-2 border-slate-700 rounded-full flex items-center justify-center mb-3">
                            <span className="text-slate-700 font-bold">+</span>
                        </div>
                        <p className="text-slate-600 text-sm italic">Next Experiment by Si Cantik...</p>
                    </div>
                </div>
            )}

            <footer className="mt-20 pt-8 border-t border-slate-900 text-slate-500 text-sm">
                <p>© 2026 Corelink Laboratory Protocol. All features here are experimental.</p>
            </footer>
        </div>
    );
};
