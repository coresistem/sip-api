import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Beaker, Globe, Shield, CheckCircle, Clock, Trash2, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'react-toastify';

interface LabFeature {
    id: string;
    slug: string;
    name: string;
    description: string;
    status: 'STANDALONE' | 'IN_PROGRESS' | 'INTEGRATED';
    isPublic: boolean;
    routePath?: string;
    createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function InnovationPanel() {
    const [features, setFeatures] = useState<LabFeature[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeatures = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/labs/admin`);
            const data = await res.json();
            setFeatures(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to fetch lab features');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    const togglePublic = async (feature: LabFeature) => {
        try {
            const res = await fetch(`${API_BASE}/labs/${feature.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: !feature.isPublic })
            });
            if (res.ok) {
                toast.success(`${feature.name} visibility updated`);
                fetchFeatures();
            }
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`${API_BASE}/labs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success('Status updated');
                fetchFeatures();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'INTEGRATED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'IN_PROGRESS': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Beaker className="text-cyan-400" />
                        Innovation & Labs Control
                    </h2>
                    <p className="text-slate-400 text-sm">Kelola fitur eksperimental dari Si Cantik (AI Studio).</p>
                </div>
                <button
                    onClick={fetchFeatures}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    title="Refresh List"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {features.length === 0 ? (
                        <div className="card p-12 text-center border-dashed border-2 border-slate-800">
                            <Zap size={48} className="mx-auto text-slate-700 mb-4" />
                            <p className="text-slate-500 font-medium">No lab features found in database.</p>
                            <p className="text-slate-600 text-sm">Ensure the Lab model is seeded or created.</p>
                        </div>
                    ) : (
                        features.map((feature) => (
                            <div key={feature.id} className="card p-5 group hover:border-cyan-500/30 transition-all">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-white">{feature.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(feature.status)}`}>
                                                {feature.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{feature.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1 font-mono">
                                                <Globe size={12} /> {feature.routePath || 'No Route'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {new Date(feature.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 lg:border-l lg:border-slate-800 lg:pl-6">
                                        {/* Toggle Public */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-500">Public Access</span>
                                            <button
                                                onClick={() => togglePublic(feature)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${feature.isPublic
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                                    }`}
                                            >
                                                {feature.isPublic ? <Globe size={14} /> : <Shield size={14} />}
                                                {feature.isPublic ? 'ONLINE' : 'PRIVATE'}
                                            </button>
                                        </div>

                                        {/* Status Switcher */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-bold text-slate-500">Integration</span>
                                            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                                                <button
                                                    onClick={() => updateStatus(feature.id, 'STANDALONE')}
                                                    className={`px-2 py-1 rounded transition-all text-[10px] font-bold ${feature.status === 'STANDALONE' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    LAB
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(feature.id, 'IN_PROGRESS')}
                                                    className={`px-2 py-1 rounded transition-all text-[10px] font-bold ${feature.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    MIGRATE
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(feature.id, 'INTEGRATED')}
                                                    className={`px-2 py-1 rounded transition-all text-[10px] font-bold ${feature.status === 'INTEGRATED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    TICK
                                                </button>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={feature.routePath}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg transition-all text-slate-400 border border-slate-700 hover:border-cyan-500/30"
                                                title="View in Sandbox"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                            <button
                                                className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all text-slate-400 border border-slate-700 hover:border-red-500/30"
                                                title="Delete Metadata"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
