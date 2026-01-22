import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Users, Save, X } from 'lucide-react';

interface OrganizationMember {
    id: string;
    name: string;
    position: string; // CHAIRPERSON, SECRETARY, TREASURER, HEAD_COACH, CUSTOM
    customTitle?: string;
    whatsapp?: string;
    email?: string;
    sortOrder: number;
    isActive: boolean;
}

export default function ClubOrganizationPage() {
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or ID
    const [editForm, setEditForm] = useState<Partial<OrganizationMember>>({});

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        try {
            const res = await api.get('/clubs/organization');
            setMembers(res.data.data);
        } catch (error) {
            console.error('Failed to fetch organization:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member?: OrganizationMember) => {
        if (member) {
            setIsEditing(member.id);
            setEditForm(member);
        } else {
            setIsEditing('new');
            setEditForm({ position: 'CUSTOM', sortOrder: members.length + 1, isActive: true });
        }
    };

    const handleSave = async () => {
        try {
            if (isEditing === 'new') {
                const res = await api.post('/clubs/organization', editForm);
                setMembers(prev => [...prev, res.data.data].sort((a, b) => a.sortOrder - b.sortOrder));
            } else {
                const res = await api.put(`/clubs/organization/${isEditing}`, editForm);
                setMembers(prev => prev.map(m => m.id === isEditing ? res.data.data : m).sort((a, b) => a.sortOrder - b.sortOrder));
            }
            setIsEditing(null);
            setEditForm({});
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save member.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await api.delete(`/clubs/organization/${id}`);
            setMembers(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const POSITION_LABELS: Record<string, string> = {
        CHAIRPERSON: 'Chairperson',
        SECRETARY: 'Secretary',
        TREASURER: 'Treasurer',
        HEAD_COACH: 'Head Coach',
        CUSTOM: 'Other'
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Organization Structure</h1>
                    <p className="text-dark-400">Manage your club's leadership and committee</p>
                </div>
                <button onClick={() => handleEdit()} className="btn btn-primary">
                    <Plus size={18} /> Add Member
                </button>
            </div>

            {/* Tree / List Visualization - Keeping it simple list for now as requested */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-dark-400">Loading...</div>
                ) : (
                    <div className="divide-y divide-dark-700/50">
                        {/* New/Edit Form */}
                        {isEditing && (
                            <div className="p-6 bg-dark-800/50 animate-in fade-in slide-in-from-top-4">
                                <h3 className="font-bold mb-4">{isEditing === 'new' ? 'Add Member' : 'Edit Member'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Name</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editForm.name || ''}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Position</label>
                                        <select
                                            className="input w-full"
                                            value={editForm.position || 'CUSTOM'}
                                            onChange={e => setEditForm({ ...editForm, position: e.target.value })}
                                        >
                                            {Object.entries(POSITION_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {(editForm.position === 'CUSTOM') && (
                                        <div className="md:col-span-2">
                                            <label className="label">Custom Title</label>
                                            <input
                                                type="text"
                                                className="input w-full"
                                                value={editForm.customTitle || ''}
                                                onChange={e => setEditForm({ ...editForm, customTitle: e.target.value })}
                                                placeholder="e.g. Equipment Manager"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="label">WhatsApp</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editForm.whatsapp || ''}
                                            onChange={e => setEditForm({ ...editForm, whatsapp: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Email</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editForm.email || ''}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Sort Order</label>
                                        <input
                                            type="number"
                                            className="input w-full"
                                            value={editForm.sortOrder || 0}
                                            onChange={e => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button onClick={() => setIsEditing(null)} className="btn btn-secondary">Cancel</button>
                                    <button onClick={handleSave} className="btn btn-primary"><Save size={18} /> Save</button>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        {members.length === 0 && !loading && !isEditing ? (
                            <div className="p-8 text-center text-dark-400">
                                <Users size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No organization members found. Add one to get started.</p>
                            </div>
                        ) : (
                            members.map(member => (
                                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-dark-700/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center font-bold text-dark-400">
                                            {member.sortOrder}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{member.name}</h4>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="badge badge-primary">
                                                    {member.position === 'CUSTOM' ? member.customTitle : POSITION_LABELS[member.position]}
                                                </span>
                                                {member.email && <span className="text-dark-400 hidden md:inline">| {member.email}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(member)} className="btn btn-ghost btn-sm text-blue-400">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(member.id)} className="btn btn-ghost btn-sm text-red-400">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
