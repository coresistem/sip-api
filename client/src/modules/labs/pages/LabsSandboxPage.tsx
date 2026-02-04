import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Beaker, Globe, ChevronRight, Database, Activity, Search, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface LabFeature {
    id: string;
    slug: string;
    name: string;
    description: string;
    routePath: string;
    tags?: string[];
    isExternal?: boolean;
    icon?: React.ReactNode;
    style?: 'default' | 'emerald' | 'yellow';
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Hardcoded features for better management
const STATIC_FEATURES: LabFeature[] = [
    {
        id: 'integrity-hub',
        slug: 'integrity-hub',
        name: 'Integrità Hub',
        description: 'Cluster conflict audit tool. Detect and verify duplicate system entities.',
        routePath: '/labs/data-integrity',
        tags: ['audit', 'data', 'essential'],
        style: 'emerald',
        icon: <Database className="h-6 w-6 text-emerald-400" />
    },
    {
        id: 'bleep-test',
        slug: 'bleep-test',
        name: 'Pro Bleep Test',
        description: 'Aerobic capacity evaluation system with audio-sync protocol.',
        routePath: '/labs/bleep-test',
        tags: ['training', 'physical', 'audio'],
        style: 'default',
        icon: <Activity className="h-6 w-6 text-cyan-400" />
    },
    {
        id: 'flowchart',
        slug: 'flowchart',
        name: 'FlowChart',
        description: 'Panduan alur verifikasi data (Trust Chain) untuk Atlet, Klub, dan Perpani.',
        routePath: '/ecosystem-flow',
        tags: ['guide', 'verification', 'flow', 'ecosystem'],
        style: 'yellow',
        icon: <Activity className="h-6 w-6 text-yellow-400" />
    }
];

export const LabsPage: React.FC = () => {
    const [features, setFeatures] = useState<LabFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch(`${API_BASE}/labs/public`)
            .then(res => res.json())
            .then(data => {
                const apiFeatures = Array.isArray(data) ? data.map((f: any) => ({
                    ...f,
                    style: 'default',
                    tags: ['api', 'dynamic'],
                    icon: <Globe className="h-6 w-6 text-cyan-400" />
                })) : [];
                setFeatures(apiFeatures);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Combine and Filter
    const allFeatures = [...features, ...STATIC_FEATURES];
    const filteredFeatures = allFeatures.filter(feature => {
        const query = searchQuery.toLowerCase();
        return (
            feature.name.toLowerCase().includes(query) ||
            feature.description.toLowerCase().includes(query) ||
            feature.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    });

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <header className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                            <Beaker className="text-cyan-400" size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Sandbox Laboratory
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Zona eksperimental untuk fitur standalone dan prototipe.
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Filter laboratories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {filteredFeatures.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                    ))}

                    {/* Placeholder for "Next" */}
                    <div className="p-6 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center opacity-50 min-h-[200px]">
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

// Component for rendering cards based on style
const FeatureCard: React.FC<{ feature: LabFeature }> = ({ feature }) => {
    // Styles mapping
    const styles = {
        default: {
            container: "bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-500/10",
            iconBg: "bg-cyan-500/20",
            iconColor: "text-cyan-400",
            title: "text-white",
            text: "text-cyan-400",
            badge: null
        },
        emerald: {
            container: "bg-slate-900/80 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]",
            iconBg: "bg-emerald-500/20",
            iconColor: "text-emerald-400",
            title: "text-white uppercase italic tracking-tighter",
            text: "text-emerald-400 font-black uppercase tracking-widest",
            badge: (
                <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-tighter rounded-bl-xl">
                    Essential
                </div>
            )
        },
        yellow: {
            container: "bg-slate-900/50 border-slate-800 hover:border-yellow-500/50 hover:shadow-yellow-500/10",
            iconBg: "bg-yellow-500/20",
            iconColor: "text-yellow-400",
            title: "text-white",
            text: "text-yellow-400 font-medium",
            badge: null
        }
    };

    const style = styles[feature.style || 'default'];

    return (
        <Link
            to={feature.routePath}
            className={`group relative p-6 border rounded-2xl transition-all hover:shadow-2xl overflow-hidden ${style.container}`}
        >
            {style.badge}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${style.iconBg}`}>
                {feature.icon || <Globe className={`h-6 w-6 ${style.iconColor}`} />}
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${style.title}`}>{feature.name}</h2>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {feature.description}
            </p>
            <div className={`flex items-center text-sm ${style.text}`}>
                Launch Lab
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
};
