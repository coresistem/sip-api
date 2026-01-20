import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bug, Search, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp,
    AlertTriangle, AlertCircle, Info, CheckCircle, Clock, Zap, Timer
} from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';

interface TroubleshootEntry {
    id: string;
    tsId: string;
    title: string;
    category: string;
    severity: string;
    effort: string;
    symptoms: string;
    rootCause: string;
    debugSteps: string;
    solution: string;
    prevention?: string;
    relatedFiles?: string;
    createdAt: string;
    updatedAt: string;
}

const CATEGORIES = ['Authentication', 'Database', 'UI', 'API', 'Build', 'Deployment'];
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
const EFFORTS = ['Quick', 'Medium', 'Long'];

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
        default: return 'bg-dark-600 text-dark-300';
    }
};

const getSeverityIcon = (severity: string) => {
    switch (severity) {
        case 'Critical': return <AlertTriangle size={14} />;
        case 'High': return <AlertCircle size={14} />;
        case 'Medium': return <Info size={14} />;
        case 'Low': return <CheckCircle size={14} />;
        default: return <Info size={14} />;
    }
};

const getEffortIcon = (effort: string) => {
    switch (effort) {
        case 'Quick': return <Zap size={14} className="text-green-400" />;
        case 'Medium': return <Clock size={14} className="text-yellow-400" />;
        case 'Long': return <Timer size={14} className="text-red-400" />;
        default: return <Clock size={14} />;
    }
};

export default function TroubleshootTab() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TroubleshootEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TroubleshootEntry | null>(null);

    const fetchEntries = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (categoryFilter) params.append('category', categoryFilter);
            if (severityFilter) params.append('severity', severityFilter);

            const response = await api.get(`/troubleshoot?${params.toString()}`);
            if (response.data.success) {
                setEntries(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching troubleshoot entries:', error);
        } finally {
            setLoading(false);
        }
    }, [search, categoryFilter, severityFilter]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        try {
            await api.delete(`/troubleshoot/${id}`);
            fetchEntries();
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bug className="w-5 h-5 text-rose-400" />
                    <h2 className="text-lg font-semibold">Troubleshooting Knowledge Base</h2>
                    <span className="text-xs text-dark-400 bg-dark-700 px-2 py-0.5 rounded-full">
                        {entries.length} entries
                    </span>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary text-sm flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Entry
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                        type="text"
                        placeholder="Search by title, symptoms, solution..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm focus:border-primary-500 focus:outline-none"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm focus:border-primary-500 focus:outline-none"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm focus:border-primary-500 focus:outline-none"
                >
                    <option value="">All Severities</option>
                    {SEVERITIES.map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                    ))}
                </select>
            </div>

            {/* Entries List */}
            {loading ? (
                <div className="text-center py-8 text-dark-400">Loading...</div>
            ) : entries.length === 0 ? (
                <div className="text-center py-12 text-dark-400">
                    <Bug className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No troubleshooting entries found.</p>
                    <p className="text-sm mt-1">Click "Add Entry" to create one.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <motion.div
                            key={entry.id}
                            layout
                            className="card overflow-hidden p-0"
                        >
                            {/* Entry Header */}
                            <div
                                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-dark-700/30 transition-colors"
                            >
                                <span className="font-mono text-xs text-dark-400 w-16">{entry.tsId}</span>
                                <div className="flex-1">
                                    <p className="font-medium">{entry.title}</p>
                                    <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">{entry.symptoms}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded bg-dark-600 text-dark-300">
                                    {entry.category}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${getSeverityColor(entry.severity)}`}>
                                    {getSeverityIcon(entry.severity)}
                                    {entry.severity}
                                </span>
                                <span className="text-xs flex items-center gap-1 text-dark-400">
                                    {getEffortIcon(entry.effort)}
                                    {entry.effort}
                                </span>
                                {expandedId === entry.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {expandedId === entry.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-dark-700 bg-dark-800/50"
                                    >
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-xs font-semibold text-dark-400 uppercase mb-1">Symptoms</h4>
                                                    <p className="text-sm whitespace-pre-wrap">{entry.symptoms}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-semibold text-dark-400 uppercase mb-1">Root Cause</h4>
                                                    <p className="text-sm whitespace-pre-wrap">{entry.rootCause}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-dark-400 uppercase mb-1">Debug Steps</h4>
                                                <p className="text-sm whitespace-pre-wrap font-mono bg-dark-900 p-3 rounded">{entry.debugSteps}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-dark-400 uppercase mb-1">Solution</h4>
                                                <p className="text-sm whitespace-pre-wrap font-mono bg-dark-900 p-3 rounded">{entry.solution}</p>
                                            </div>
                                            {entry.prevention && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-dark-400 uppercase mb-1">Prevention</h4>
                                                    <p className="text-sm whitespace-pre-wrap">{entry.prevention}</p>
                                                </div>
                                            )}
                                            {entry.relatedFiles && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-dark-400 uppercase mb-1">Related Files</h4>
                                                    <p className="text-sm font-mono text-primary-400">{entry.relatedFiles}</p>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between pt-2 border-t border-dark-700">
                                                <span className="text-xs text-dark-500">
                                                    Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingEntry(entry);
                                                            setShowAddModal(true);
                                                        }}
                                                        className="p-2 rounded hover:bg-dark-600 text-dark-400 hover:text-blue-400"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(entry.id);
                                                        }}
                                                        className="p-2 rounded hover:bg-dark-600 text-dark-400 hover:text-red-400"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <TroubleshootModal
                        entry={editingEntry}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingEntry(null);
                        }}
                        onSave={() => {
                            setShowAddModal(false);
                            setEditingEntry(null);
                            fetchEntries();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

interface TroubleshootModalProps {
    entry: TroubleshootEntry | null;
    onClose: () => void;
    onSave: () => void;
}

function TroubleshootModal({ entry, onClose, onSave }: TroubleshootModalProps) {
    const [formData, setFormData] = useState({
        tsId: entry?.tsId || '',
        title: entry?.title || '',
        category: entry?.category || 'UI',
        severity: entry?.severity || 'Medium',
        effort: entry?.effort || 'Medium',
        symptoms: entry?.symptoms || '',
        rootCause: entry?.rootCause || '',
        debugSteps: entry?.debugSteps || '',
        solution: entry?.solution || '',
        prevention: entry?.prevention || '',
        relatedFiles: entry?.relatedFiles || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!entry) {
            // Fetch next ID
            api.get('/troubleshoot/next-id').then(res => {
                if (res.data.success) {
                    setFormData(prev => ({ ...prev, tsId: res.data.data.nextId }));
                }
            }).catch(() => { });
        }
    }, [entry]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (entry) {
                await api.patch(`/troubleshoot/${entry.id}`, formData);
            } else {
                await api.post('/troubleshoot', formData);
            }
            onSave();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                    <h3 className="text-lg font-semibold">
                        {entry ? 'Edit Entry' : 'Add New Entry'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="p-3 rounded bg-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-dark-400">TS ID</label>
                            <input
                                type="text"
                                value={formData.tsId}
                                onChange={(e) => setFormData({ ...formData, tsId: e.target.value })}
                                className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm"
                                placeholder="TS-001"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-dark-400">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm"
                                placeholder="Login 401 Unauthorized"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-dark-400">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-dark-400">Severity</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm"
                            >
                                {SEVERITIES.map(sev => (
                                    <option key={sev} value={sev}>{sev}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-dark-400">Effort</label>
                            <select
                                value={formData.effort}
                                onChange={(e) => setFormData({ ...formData, effort: e.target.value })}
                                className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm"
                            >
                                {EFFORTS.map(eff => (
                                    <option key={eff} value={eff}>{eff}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-dark-400">Symptoms</label>
                        <textarea
                            value={formData.symptoms}
                            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm h-20"
                            placeholder="What the user/developer observed"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-dark-400">Root Cause</label>
                        <textarea
                            value={formData.rootCause}
                            onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm h-20"
                            placeholder="The underlying technical problem"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-dark-400">Debug Steps</label>
                        <textarea
                            value={formData.debugSteps}
                            onChange={(e) => setFormData({ ...formData, debugSteps: e.target.value })}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm h-24 font-mono"
                            placeholder="1. Check server logs...&#10;2. Run diagnostic script..."
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-dark-400">Solution</label>
                        <textarea
                            value={formData.solution}
                            onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm h-24 font-mono"
                            placeholder="Code changes or commands to fix"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-dark-400">Prevention (Optional)</label>
                        <textarea
                            value={formData.prevention}
                            onChange={(e) => setFormData({ ...formData, prevention: e.target.value })}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm h-16"
                            placeholder="How to avoid this in the future"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-dark-400">Related Files (Optional)</label>
                        <input
                            type="text"
                            value={formData.relatedFiles}
                            onChange={(e) => setFormData({ ...formData, relatedFiles: e.target.value })}
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm"
                            placeholder="auth.controller.ts, App.tsx"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : (entry ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
