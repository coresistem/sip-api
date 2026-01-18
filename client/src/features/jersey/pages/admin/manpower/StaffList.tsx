import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Edit2, Trash2, Phone, Mail, Briefcase,
    Loader2, X, Check, UserPlus
} from 'lucide-react';
import { api } from '../../../../../context/AuthContext';

interface Manpower {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    role: 'MANAGER' | 'STAFF' | 'QC';
    specialization?: 'CUTTING' | 'SEWING' | 'PRINTING' | 'FINISHING';
    isActive: boolean;
    dailyCapacity: number;
    createdAt: string;
}

const ROLES = [
    { id: 'MANAGER', label: 'Manager', color: 'purple' },
    { id: 'STAFF', label: 'Staff', color: 'blue' },
    { id: 'QC', label: 'QC Inspector', color: 'emerald' },
];

const SPECIALIZATIONS = [
    { id: 'GRADING', label: 'Grading' },
    { id: 'PRINTING', label: 'Printing' },
    { id: 'CUTTING', label: 'Cutting' },
    { id: 'PRESS', label: 'Press' },
    { id: 'SEWING', label: 'Sewing' },
    { id: 'QC', label: 'QC (Quality Control)' },
    { id: 'PACKING', label: 'Packing' },
];

export default function StaffList() {
    const [manpowerList, setManpowerList] = useState<Manpower[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Manpower | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        role: 'STAFF',
        specialization: '',
        dailyCapacity: 10,
    });

    useEffect(() => {
        fetchManpower();
    }, []);

    const fetchManpower = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/manpower');
            setManpowerList(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch manpower:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingStaff(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            role: 'STAFF',
            specialization: '',
            dailyCapacity: 10,
        });
        setShowModal(true);
    };

    const openEditModal = (staff: Manpower) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name,
            phone: staff.phone || '',
            email: staff.email || '',
            role: staff.role,
            specialization: staff.specialization || '',
            dailyCapacity: staff.dailyCapacity,
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert('Name is required');
            return;
        }

        try {
            setIsSaving(true);
            if (editingStaff) {
                await api.put(`/manpower/${editingStaff.id}`, formData);
            } else {
                await api.post('/manpower', formData);
            }
            setShowModal(false);
            fetchManpower();
        } catch (error) {
            console.error('Failed to save staff:', error);
            alert('Failed to save staff');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;

        try {
            await api.delete(`/manpower/${id}`);
            fetchManpower();
        } catch (error) {
            console.error('Failed to delete staff:', error);
            alert('Failed to delete staff');
        }
    };

    const toggleActive = async (staff: Manpower) => {
        try {
            await api.put(`/manpower/${staff.id}`, {
                isActive: !staff.isActive
            });
            fetchManpower();
        } catch (error) {
            console.error('Failed to toggle staff status:', error);
        }
    };

    const getRoleInfo = (role: string) => {
        return ROLES.find(r => r.id === role) || ROLES[1];
    };

    return (
        <div className="max-w-6xl mx-auto p-6 pb-20 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-display gradient-text">Staff Management</h1>
                    <p className="text-dark-400 text-sm">Manage your production team</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                    <UserPlus size={18} />
                    <span>Add Staff</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                    <p className="text-dark-400 text-sm">Total Staff</p>
                    <p className="text-2xl font-bold text-white">{manpowerList.length}</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-purple-400 text-sm">Managers</p>
                    <p className="text-2xl font-bold text-purple-400">
                        {manpowerList.filter(w => w.role === 'MANAGER').length}
                    </p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-400 text-sm">Staff</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {manpowerList.filter(w => w.role === 'STAFF').length}
                    </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <p className="text-emerald-400 text-sm">Active</p>
                    <p className="text-2xl font-bold text-emerald-400">
                        {manpowerList.filter(w => w.isActive).length}
                    </p>
                </div>
            </div>

            {/* Manpower Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                </div>
            ) : manpowerList.length === 0 ? (
                <div className="text-center py-20 bg-dark-800/50 rounded-xl border border-dark-700">
                    <Users className="mx-auto text-dark-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-dark-300 mb-2">No staff added yet</h3>
                    <p className="text-dark-500 mb-4">Add your production team members to get started.</p>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Add First Staff
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {manpowerList.map(staff => {
                        const roleInfo = getRoleInfo(staff.role);
                        return (
                            <motion.div
                                key={staff.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-dark-800/50 border rounded-xl p-5 ${staff.isActive ? 'border-dark-700' : 'border-dark-700/50 opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full bg-${roleInfo.color}-500/20 flex items-center justify-center`}>
                                            <Users size={18} className={`text-${roleInfo.color}-400`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{staff.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded bg-${roleInfo.color}-500/20 text-${roleInfo.color}-400`}>
                                                {roleInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(staff)}
                                            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={14} className="text-dark-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(staff.id)}
                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} className="text-dark-400 hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {staff.specialization && (
                                    <div className="flex items-center gap-2 text-sm text-dark-400 mb-2">
                                        <Briefcase size={14} />
                                        <span>{staff.specialization}</span>
                                    </div>
                                )}

                                {staff.phone && (
                                    <div className="flex items-center gap-2 text-sm text-dark-400 mb-2">
                                        <Phone size={14} />
                                        <span>{staff.phone}</span>
                                    </div>
                                )}

                                {staff.email && (
                                    <div className="flex items-center gap-2 text-sm text-dark-400 mb-2">
                                        <Mail size={14} />
                                        <span className="truncate">{staff.email}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
                                    <span className="text-xs text-dark-500">
                                        Capacity: {staff.dailyCapacity}/day
                                    </span>
                                    <button
                                        onClick={() => toggleActive(staff)}
                                        className={`text-xs px-2 py-1 rounded ${staff.isActive
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-dark-700 text-dark-400'
                                            }`}
                                    >
                                        {staff.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-dark-800 rounded-xl w-full max-w-md border border-dark-700"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-dark-700">
                                <h2 className="text-lg font-semibold text-white">
                                    {editingStaff ? 'Edit Staff' : 'Add Staff'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-dark-700 rounded-lg"
                                >
                                    <X size={18} className="text-dark-400" />
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                                        placeholder="Staff name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                                        >
                                            {ROLES.map(role => (
                                                <option key={role.id} value={role.id}>{role.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-dark-400 mb-1">Specialization</label>
                                        <select
                                            value={formData.specialization}
                                            onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                                        >
                                            <option value="">None</option>
                                            {SPECIALIZATIONS.map(spec => (
                                                <option key={spec.id} value={spec.id}>{spec.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                                        placeholder="email@example.com"
                                    />
                                    {/* Info about login */}
                                    {formData.email && !editingStaff && (
                                        <div className="mt-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                                            <p className="text-blue-200">
                                                A user account will be created automatically. <br />
                                                Default Password: <code className="bg-blue-500/20 px-1 rounded text-blue-100">Manpower123!</code>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Daily Capacity (items/day)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.dailyCapacity}
                                        onChange={e => setFormData({ ...formData, dailyCapacity: parseInt(e.target.value) || 10 })}
                                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 p-4 border-t border-dark-700">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-dark-700 text-dark-300 rounded-lg hover:bg-dark-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            <span>{editingStaff ? 'Update' : 'Add Staff'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
