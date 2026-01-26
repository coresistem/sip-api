import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, useAuth } from '../../core/contexts/AuthContext';
import {
    Plus, MapPin, QrCode, School as SchoolIcon,
    MoreVertical, Edit2, Trash2, ExternalLink,
    Search, Info, Check, X
} from 'lucide-react';
import QRCode from 'qrcode';

interface ClubUnit {
    id: string;
    name: string;
    type: 'FIELD' | 'SCHOOL' | 'OTHER';
    address?: string;
    schoolId?: string;
    qrCode?: string;
    createdAt: string;
    _count?: {
        athletes: number;
        schedules: number;
    };
}

export default function ClubUnitsPage() {
    const { user } = useAuth();
    const [units, setUnits] = useState<ClubUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<ClubUnit | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Units
    const fetchUnits = async () => {
        if (!user?.clubId) return;
        setLoading(true);
        try {
            const res = await api.get(`/clubs/${user.clubId}/units`);
            setUnits(res.data.data);
        } catch (error) {
            console.error('Failed to fetch units:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, [user?.clubId]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this unit? All history linked to this location will remain, but no new activities can be assigned here.')) return;
        try {
            await api.delete(`/clubs/units/${id}`);
            setUnits(prev => prev.filter(u => u.id !== id));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete unit');
        }
    };

    const filteredUnits = units.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Unit Management</h1>
                    <p className="text-dark-400">Manage your training venues and school branches</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Add New Unit
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/20">
                    <div className="text-dark-400 text-sm mb-1 uppercase tracking-wider font-bold">Total Units</div>
                    <div className="text-3xl font-display font-bold text-white">{units.length}</div>
                </div>
                <div className="card p-6 bg-gradient-to-br from-primary-600/10 to-transparent border-primary-500/20">
                    <div className="text-dark-400 text-sm mb-1 uppercase tracking-wider font-bold">Primary Field</div>
                    <div className="text-lg font-bold text-white truncate">
                        {units.find(u => u.type === 'FIELD')?.name || 'Not Defined'}
                    </div>
                </div>
                <div className="card p-6 bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/20">
                    <div className="text-dark-400 text-sm mb-1 uppercase tracking-wider font-bold">School Academies</div>
                    <div className="text-3xl font-display font-bold text-white">
                        {units.filter(u => u.type === 'SCHOOL').length}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search units..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
            </div>

            {/* Units Grid */}
            {loading ? (
                <div className="p-20 text-center text-dark-400">
                    <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                    Loading your venues...
                </div>
            ) : filteredUnits.length === 0 ? (
                <div className="card p-20 text-center border-dashed border-dark-700 bg-dark-800/10">
                    <MapPin size={48} className="mx-auto mb-4 text-dark-600" />
                    <h3 className="text-xl font-bold mb-2">No Units Found</h3>
                    <p className="text-dark-400 mb-6">Start by adding a training field or a partner school.</p>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-secondary">
                        Add Your First Unit
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredUnits.map((unit) => (
                        <UnitCard
                            key={unit.id}
                            unit={unit}
                            onEdit={() => {
                                setEditingUnit(unit);
                                setShowAddModal(true);
                            }}
                            onDelete={() => handleDelete(unit.id)}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <UnitModal
                        unit={editingUnit}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingUnit(null);
                        }}
                        onSuccess={() => {
                            setShowAddModal(false);
                            setEditingUnit(null);
                            fetchUnits();
                        }}
                        clubId={user?.clubId || ''}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function UnitCard({ unit, onEdit, onDelete }: { unit: ClubUnit, onEdit: () => void, onDelete: () => void }) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    useEffect(() => {
        if (unit.qrCode) {
            QRCode.toDataURL(unit.qrCode, {
                margin: 1,
                width: 200,
                color: {
                    dark: '#FFFFFF',
                    light: '#00000000'
                }
            }).then(setQrDataUrl);
        }
    }, [unit.qrCode]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card group hover:border-primary-500/50 transition-all flex flex-col h-full bg-dark-800/40"
        >
            {/* Header */}
            <div className="p-5 border-b border-dark-700/50 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${unit.type === 'SCHOOL' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary-500/20 text-primary-500'
                        }`}>
                        {unit.type === 'SCHOOL' ? <SchoolIcon size={20} /> : <MapPin size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{unit.name}</h3>
                        <span className="text-[10px] uppercase tracking-widest font-black text-dark-500">{unit.type}</span>
                    </div>
                </div>

                <div className="flex gap-1">
                    <button onClick={onEdit} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={onDelete} className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <div className="text-xs text-dark-500 mb-1 uppercase font-bold tracking-wider flex items-center gap-1">
                            <Info size={12} /> Address
                        </div>
                        <p className="text-sm text-dark-300 line-clamp-2">{unit.address || 'No address provided'}</p>
                    </div>
                    {qrDataUrl && (
                        <div className="bg-white p-1 rounded-lg shrink-0 group-hover:scale-110 transition-transform cursor-pointer" onClick={() => {
                            const link = document.createElement('a');
                            link.href = qrDataUrl;
                            link.download = `QR-${unit.name}.png`;
                            link.click();
                        }}>
                            <img src={qrDataUrl} alt="Unit QR" className="w-16 h-16 invert rounded-sm" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-dark-700/30 rounded-xl p-3 border border-dark-700/50">
                        <div className="text-[10px] text-dark-500 uppercase font-black mb-1">Athletes</div>
                        <div className="text-xl font-bold font-mono">{unit._count?.athletes || 0}</div>
                    </div>
                    <div className="bg-dark-700/30 rounded-xl p-3 border border-dark-700/50">
                        <div className="text-[10px] text-dark-500 uppercase font-black mb-1">Schedules</div>
                        <div className="text-xl font-bold font-mono">{unit._count?.schedules || 0}</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-dark-700/20 border-t border-dark-700/50 group-hover:bg-primary-500/10 transition-colors">
                <button className="w-full text-xs font-bold text-dark-400 group-hover:text-primary-400 flex items-center justify-center gap-2 uppercase tracking-widest">
                    View Details <ChevronRight size={14} />
                </button>
            </div>
        </motion.div>
    );
}

function UnitModal({ unit, onClose, onSuccess, clubId }: { unit: ClubUnit | null, onClose: () => void, onSuccess: () => void, clubId: string }) {
    const [formData, setFormData] = useState({
        name: unit?.name || '',
        type: unit?.type || 'FIELD',
        address: unit?.address || '',
        schoolId: unit?.schoolId || ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (unit) {
                await api.put(`/clubs/units/${unit.id}`, formData);
            } else {
                await api.post(`/clubs/${clubId}/units`, formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Save unit error:', error);
            alert('Failed to save unit details');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="card w-full max-w-lg overflow-hidden border-dark-600 bg-dark-900"
            >
                <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {unit ? <Edit2 size={20} className="text-primary-500" /> : <Plus size={20} className="text-primary-500" />}
                        {unit ? 'Edit Unit' : 'Add New Unit'}
                    </h2>
                    <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-dark-300">Unit Name</label>
                        <input
                            required
                            type="text"
                            className="input w-full"
                            placeholder="e.g. SMAN 1 Academy or West Field"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-dark-300">Unit Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'FIELD' })}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${formData.type === 'FIELD' ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-dark-700 text-dark-400 hover:border-dark-600'
                                    }`}
                            >
                                <MapPin size={20} />
                                <span className="font-bold text-xs uppercase tracking-wider">Field / Range</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'SCHOOL' })}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${formData.type === 'SCHOOL' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-dark-700 text-dark-400 hover:border-dark-600'
                                    }`}
                            >
                                <SchoolIcon size={20} />
                                <span className="font-bold text-xs uppercase tracking-wider">School</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-dark-300">Full Address</label>
                        <textarea
                            rows={3}
                            className="input w-full resize-none p-3"
                            placeholder="Street name, City, Province..."
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={submitting}
                        className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl shadow-primary-900/40 relative"
                    >
                        {submitting ? (
                            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Check size={20} /> {unit ? 'Update Unit' : 'Create Unit'}
                            </span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

function ChevronRight({ size, className }: { size?: number, className?: string }) {
    return <ExternalLink size={size} className={className} />;
}
