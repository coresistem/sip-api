import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus } from 'lucide-react';
import { api, useAuth, Role } from '../../core/contexts/AuthContext';
import { toast } from 'react-toastify';

interface Manpower {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    positionId?: string;
    position?: ManpowerPosition;
    shortcuts?: string | string[]; // Stored as JSON string on backend
    isActive: boolean;
    dailyCapacity: number;
    tasks?: ManpowerTask[];
}

interface ManpowerPosition {
    id: string;
    name: string;
    description?: string;
}

import { usePermissions } from '../../core/contexts/PermissionsContext';
import { MODULE_LIST, ModuleName, SIDEBAR_ROLE_GROUPS, DEFAULT_UI_SETTINGS } from '../../core/types/permissions';
import { NAV_ITEMS } from '../../core/constants/navigation';

interface ManpowerTask {
    id: string;
    stage: string;
    status: string;
    quantity: number;
    orderId: string;
    order: {
        id: string;
        status: string;
    };
}

export default function ManpowerPage() {
    const { user, activeRole } = useAuth();
    const { getEffectiveSidebar, sidebarConfigs } = usePermissions();

    // Determine the effective role config to use (same as Sidebar)
    const currentRole = activeRole || user?.role || 'CLUB' as Role;

    // Get authorized modules for this user (same logic as DashboardLayout)
    const effectiveModules = getEffectiveSidebar(currentRole, user?.clubId);

    // Get sidebar grouping config (same logic as DashboardLayout)
    const roleGroups = sidebarConfigs[currentRole] || SIDEBAR_ROLE_GROUPS;

    const [members, setMembers] = useState<Manpower[]>([]);
    const [positions, setPositions] = useState<ManpowerPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPosModal, setShowPosModal] = useState(false);
    const [newPosName, setNewPosName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        positionId: '',
        shortcuts: [] as string[],
        dailyCapacity: 10
    });

    useEffect(() => {
        fetchManpower();
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            const res = await api.get('/manpower/positions');
            if (res.data.success) {
                setPositions(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        }
    };

    const fetchManpower = async () => {
        try {
            const res = await api.get('/manpower');
            if (res.data.success) {
                setMembers(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch manpower:', error);
            toast.error('Failed to load manpower data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        try {
            const res = await api.post('/manpower', formData);
            if (res.data.success) {
                toast.success('Member added successfully');
                setShowAddModal(false);
                fetchManpower();
                setFormData({ name: '', email: '', phone: '', positionId: '', shortcuts: [], dailyCapacity: 10 });
            }
        } catch (error) {
            console.error('Add member error:', error);
            toast.error('Failed to add member');
        }
    };

    const handleAddPosition = async () => {
        if (!newPosName) return;
        try {
            const res = await api.post('/manpower/positions', { name: newPosName });
            if (res.data.success) {
                toast.success('Position added');
                setNewPosName('');
                fetchPositions();
            }
        } catch (error) {
            toast.error('Failed to add position');
        }
    };

    const toggleShortcut = (modName: string) => {
        setFormData(prev => ({
            ...prev,
            shortcuts: prev.shortcuts.includes(modName)
                ? prev.shortcuts.filter(s => s !== modName)
                : [...prev.shortcuts, modName]
        }));
    };

    const getActiveTaskCount = (member: Manpower) => {
        return member.tasks?.filter(t => ['PENDING', 'IN_PROGRESS'].includes(t.status)).length || 0;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Manpower Management</h1>
                    <p className="text-dark-400">Manage production manpower and assignments</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <UserPlus size={18} />
                    Add Manpower
                </button>
            </div>

            {/* Manpower Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                    <div key={member.id} className="card p-5 hover:border-primary-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{member.name}</h3>
                                    <p className="text-xs text-dark-400">{member.position?.name || 'No Position'}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${member.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-dark-300">

                            <div className="flex justify-between">
                                <span>Active Tasks:</span>
                                <span className="text-primary-400 font-bold">{getActiveTaskCount(member)}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-dark-700 flex justify-end">
                            <button className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                                View Details &rarr;
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && members.length === 0 && (
                <div className="text-center py-12 card border-dashed border-dark-600">
                    <Users className="w-12 h-12 mx-auto mb-4 text-dark-500" />
                    <p className="text-dark-400">No manpower members found.</p>
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="card w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-4">Add New Manpower</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Name</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Whatsapp (direct message)</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Email (Optional)</label>
                                        <input
                                            type="email"
                                            className="input w-full"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="label mb-0">Position</label>
                                        <button
                                            onClick={() => setShowPosModal(!showPosModal)}
                                            className="text-[10px] text-primary-400 hover:underline px-2"
                                        >
                                            {showPosModal ? 'Hide CRUD' : 'Manage Positions'}
                                        </button>
                                    </div>

                                    {showPosModal && (
                                        <div className="p-3 bg-dark-800 rounded-lg mb-3 border border-dark-700 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    className="input flex-1 py-1 text-sm"
                                                    placeholder="New position name..."
                                                    value={newPosName}
                                                    onChange={e => setNewPosName(e.target.value)}
                                                />
                                                <button onClick={handleAddPosition} className="btn btn-primary py-1 text-xs">Add</button>
                                            </div>
                                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                                                {positions.map(p => (
                                                    <span key={p.id} className="text-[10px] bg-dark-700 px-2 py-0.5 rounded flex items-center gap-1 group">
                                                        {p.name}
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm('Delete position?')) {
                                                                    await api.delete(`/manpower/positions/${p.id}`);
                                                                    fetchPositions();
                                                                }
                                                            }}
                                                            className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <select
                                        className="input w-full"
                                        value={formData.positionId}
                                        onChange={e => setFormData({ ...formData, positionId: e.target.value })}
                                    >
                                        <option value="">Select Position</option>
                                        {positions.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.positionId && (
                                    <div>
                                        <label className="label mb-2">Feature Shortcuts</label>
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 bg-dark-900 rounded-xl border border-dark-700 scrollbar-thin scrollbar-thumb-dark-700">
                                            {roleGroups.map(group => {
                                                // Get all modules including nested children
                                                const nestedConfig = group.nestedModules || {};
                                                const nestedChildModules = Object.values(nestedConfig).flat();
                                                const allGroupModules = [...group.modules, ...nestedChildModules];

                                                // Filter nav items based on effective modules (Exact sync with sidebar)
                                                const visibleItems = allGroupModules
                                                    .map(moduleName => NAV_ITEMS.find(item => item.module === moduleName))
                                                    .filter(item => !!item && effectiveModules.includes(item.module))
                                                    .filter(item => item?.module !== 'manpower'); // Exclude itself

                                                // If strict filtering hides everything, hide the group
                                                if (visibleItems.length === 0) return null;

                                                // Optional: Hide groups that don't belong to general or current role?
                                                // The Sidebar logic assumes if it has items, it shows. Let's trust effectiveModules.

                                                return (
                                                    <div key={group.id} className="space-y-2">
                                                        <div className="flex items-center gap-2 mb-1 px-1">
                                                            <div className={`w-1 h-3 rounded-full bg-${group.color === 'primary' ? 'primary-500' : group.color + '-500'}`} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-dark-400">{group.label}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {visibleItems.map(item => {
                                                                if (!item) return null;
                                                                return (
                                                                    <button
                                                                        key={item.module}
                                                                        onClick={() => toggleShortcut(item.module)}
                                                                        className={`text-left px-3 py-2 rounded-lg text-xs transition-all border flex items-center gap-3 ${formData.shortcuts.includes(item.module)
                                                                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                                                            : 'bg-dark-800 border-transparent text-dark-400 hover:border-dark-600'
                                                                            }`}
                                                                    >
                                                                        {/* Render Icon if available */}
                                                                        <item.icon size={16} className="shrink-0" />
                                                                        <div>
                                                                            <div className="font-semibold">{item.label}</div>
                                                                            <div className="text-[9px] opacity-60">Module: {item.module}</div>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-dark-500 mt-2 italic">Shortcuts will appear on the Manpower's main sidebar.</p>
                                    </div>
                                )}


                                <button className="btn btn-primary w-full mt-4" onClick={handleAddMember}>
                                    Save Member
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
