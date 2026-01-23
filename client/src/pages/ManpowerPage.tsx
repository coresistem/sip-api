import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus } from 'lucide-react';
import { api } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface Manpower {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: string;
    specialization?: string;
    isActive: boolean;
    dailyCapacity: number;
    tasks?: ManpowerTask[];
}

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
    const [members, setMembers] = useState<Manpower[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: 'MANPOWER',
        specialization: 'SEWING',
        dailyCapacity: 10
    });

    useEffect(() => {
        fetchManpower();
    }, []);

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
                setFormData({ name: '', role: 'MANPOWER', specialization: 'SEWING', dailyCapacity: 10 });
            }
        } catch (error) {
            console.error('Add member error:', error);
            toast.error('Failed to add member');
        }
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
                    <p className="text-dark-400">Manage production staff and assignments</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <UserPlus size={18} />
                    Add Staff
                </button>
            </div>

            {/* Staff Grid */}
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
                                    <p className="text-xs text-dark-400">{member.role} - {member.specialization}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${member.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-dark-300">
                            <div className="flex justify-between">
                                <span>Daily Capacity:</span>
                                <span className="text-white">{member.dailyCapacity} items</span>
                            </div>
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
                    <p className="text-dark-400">No staff members found.</p>
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
                            <h3 className="text-lg font-bold mb-4">Add New Staff</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Name</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Role</label>
                                    <select
                                        className="input w-full"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="MANPOWER">Staff</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="QC">Quality Control</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Specialization</label>
                                    <select
                                        className="input w-full"
                                        value={formData.specialization}
                                        onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                    >
                                        <option value="SEWING">Sewing</option>
                                        <option value="CUTTING">Cutting</option>
                                        <option value="PRINTING">Printing</option>
                                        <option value="QC">QC</option>
                                        <option value="PACKING">Packing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Daily Capacity</label>
                                    <input
                                        type="number"
                                        className="input w-full"
                                        value={formData.dailyCapacity}
                                        onChange={e => setFormData({ ...formData, dailyCapacity: parseInt(e.target.value) })}
                                    />
                                </div>
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
