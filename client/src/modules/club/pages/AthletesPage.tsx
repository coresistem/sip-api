import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../core/contexts/AuthContext';
import {
    Plus, Search, Filter, Users, Edit, Trash2, Eye, X,
    ChevronDown, ChevronUp, MoreHorizontal
} from 'lucide-react';

interface Athlete {
    id: string;
    user: { id: string; name: string; email: string; avatarUrl?: string };
    archeryCategory: string;
    skillLevel: string;
    gender: string;
    dateOfBirth?: string;
    club?: { name: string };
}

type SortField = 'name' | 'email' | 'category' | 'level' | 'gender';
type SortOrder = 'asc' | 'desc';

export default function AthletesPage() {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewAthlete, setViewAthlete] = useState<Athlete | null>(null);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    useEffect(() => {
        fetchAthletes();
    }, []);

    const fetchAthletes = async () => {
        try {
            const response = await api.get('/athletes');
            setAthletes(response.data.data);
        } catch (error) {
            console.error('Failed to fetch athletes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    // Filtering & Sorting
    const sortedAthletes = [...athletes]
        .filter(a =>
            a.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let aVal = '', bVal = '';
            switch (sortField) {
                case 'name': aVal = a.user.name; bVal = b.user.name; break;
                case 'email': aVal = a.user.email; bVal = b.user.email; break;
                case 'category': aVal = a.archeryCategory; bVal = b.archeryCategory; break;
                case 'level': aVal = a.skillLevel; bVal = b.skillLevel; break;
                case 'gender': aVal = a.gender; bVal = b.gender; break;
            }
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });

    // Selection
    const toggleSelectAll = () => {
        if (selectedAthletes.length === sortedAthletes.length) {
            setSelectedAthletes([]);
        } else {
            setSelectedAthletes(sortedAthletes.map(a => a.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedAthletes(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // CRUD Actions
    const handleView = (athlete: Athlete) => {
        setViewAthlete(athlete);
        setShowViewModal(true);
        setActionMenuOpen(null);
    };

    const handleEdit = (athlete: Athlete) => {
        // In real app, open edit modal or navigate to edit page
        console.log('Edit athlete:', athlete);
        setActionMenuOpen(null);
    };

    const handleDeleteClick = (athlete: Athlete) => {
        setAthleteToDelete(athlete);
        setShowDeleteModal(true);
        setActionMenuOpen(null);
    };

    const confirmDelete = async () => {
        if (!athleteToDelete) return;
        try {
            await api.delete(`/athletes/${athleteToDelete.id}`);
            setAthletes(prev => prev.filter(a => a.id !== athleteToDelete.id));
            setShowDeleteModal(false);
            setAthleteToDelete(null);
        } catch (error) {
            console.error('Failed to delete athlete:', error);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedAthletes.map(id => api.delete(`/athletes/${id}`)));
            setAthletes(prev => prev.filter(a => !selectedAthletes.includes(a.id)));
            setSelectedAthletes([]);
        } catch (error) {
            console.error('Failed to delete athletes:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold">Athletes</h1>
                    <p className="text-dark-400">Manage your club's athletes ({athletes.length} total)</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <Plus size={18} />
                    Add Athlete
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search athletes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>

                {selectedAthletes.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-dark-400">{selectedAthletes.length} selected</span>
                        <button onClick={handleBulkDelete} className="btn btn-danger text-sm py-1.5">
                            <Trash2 size={16} />
                            Delete Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-700/50">
                                <th className="text-left p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedAthletes.length === sortedAthletes.length && sortedAthletes.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-dark-500 bg-dark-800 text-primary-500 focus:ring-primary-500"
                                    />
                                </th>
                                <th className="text-left p-4">
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Name {getSortIcon('name')}
                                    </button>
                                </th>
                                <th className="text-left p-4 hidden md:table-cell">
                                    <button onClick={() => handleSort('email')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Email {getSortIcon('email')}
                                    </button>
                                </th>
                                <th className="text-left p-4">
                                    <button onClick={() => handleSort('category')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Category {getSortIcon('category')}
                                    </button>
                                </th>
                                <th className="text-left p-4 hidden lg:table-cell">
                                    <button onClick={() => handleSort('level')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Level {getSortIcon('level')}
                                    </button>
                                </th>
                                <th className="text-left p-4 hidden lg:table-cell">
                                    <button onClick={() => handleSort('gender')} className="flex items-center gap-1 text-sm font-semibold text-dark-300 hover:text-white">
                                        Gender {getSortIcon('gender')}
                                    </button>
                                </th>
                                <th className="text-right p-4 w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="border-b border-dark-800/50">
                                        <td colSpan={7} className="p-4">
                                            <div className="h-10 bg-dark-800/50 rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : sortedAthletes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-4 text-dark-500" />
                                        <p className="text-dark-400">No athletes found</p>
                                        <p className="text-sm text-dark-500">Add your first athlete to get started</p>
                                    </td>
                                </tr>
                            ) : (
                                sortedAthletes.map((athlete, index) => (
                                    <motion.tr
                                        key={athlete.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors ${selectedAthletes.includes(athlete.id) ? 'bg-primary-500/10' : ''}`}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedAthletes.includes(athlete.id)}
                                                onChange={() => toggleSelect(athlete.id)}
                                                className="w-4 h-4 rounded border-dark-500 bg-dark-800 text-primary-500 focus:ring-primary-500"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {athlete.user.name.charAt(0)}
                                                </div>
                                                <span className="font-medium">{athlete.user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-dark-400 text-sm">{athlete.user.email}</td>
                                        <td className="p-4">
                                            <span className="badge badge-primary">{athlete.archeryCategory}</span>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <span className="badge badge-success">{athlete.skillLevel}</span>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell text-dark-400 text-sm capitalize">{athlete.gender?.toLowerCase()}</td>
                                        <td className="p-4 text-right relative">
                                            <button
                                                onClick={() => setActionMenuOpen(actionMenuOpen === athlete.id ? null : athlete.id)}
                                                className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {actionMenuOpen === athlete.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="absolute right-4 top-12 z-10 w-36 py-1 rounded-lg glass-strong shadow-lg"
                                                    >
                                                        <button onClick={() => handleView(athlete)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50">
                                                            <Eye size={16} /> View
                                                        </button>
                                                        <button onClick={() => handleEdit(athlete)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50">
                                                            <Edit size={16} /> Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(athlete)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-dark-700/50">
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                {sortedAthletes.length > 0 && (
                    <div className="p-4 border-t border-dark-700/50 flex items-center justify-between text-sm text-dark-400">
                        <span>Showing {sortedAthletes.length} of {athletes.length} athletes</span>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && athleteToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80"
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-2">Delete Athlete</h3>
                            <p className="text-dark-400 mb-6">
                                Are you sure you want to delete <strong className="text-white">{athleteToDelete.user.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button onClick={confirmDelete} className="btn btn-danger">
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {showViewModal && viewAthlete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80"
                        onClick={() => setShowViewModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card w-full max-w-lg p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Athlete Details</h3>
                                <button onClick={() => setShowViewModal(false)} className="text-dark-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl">
                                    {viewAthlete.user.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold">{viewAthlete.user.name}</h4>
                                    <p className="text-dark-400">{viewAthlete.user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-dark-500 uppercase">Category</label>
                                    <p className="font-medium">{viewAthlete.archeryCategory}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-dark-500 uppercase">Skill Level</label>
                                    <p className="font-medium">{viewAthlete.skillLevel}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-dark-500 uppercase">Gender</label>
                                    <p className="font-medium capitalize">{viewAthlete.gender?.toLowerCase()}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-dark-500 uppercase">Club</label>
                                    <p className="font-medium">{viewAthlete.club?.name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => { setShowViewModal(false); handleEdit(viewAthlete); }} className="btn btn-primary flex-1">
                                    <Edit size={16} /> Edit Athlete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Modal Placeholder */}
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
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="card w-full max-w-lg p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Add New Athlete</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-dark-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input type="text" className="input w-full" placeholder="Enter athlete name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" className="input w-full" placeholder="Enter email address" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Category</label>
                                        <select className="input w-full">
                                            <option>RECURVE</option>
                                            <option>COMPOUND</option>
                                            <option>BAREBOW</option>
                                            <option>TRADITIONAL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Skill Level</label>
                                        <select className="input w-full">
                                            <option>BEGINNER</option>
                                            <option>INTERMEDIATE</option>
                                            <option>ADVANCED</option>
                                            <option>ELITE</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Gender</label>
                                    <select className="input w-full">
                                        <option>MALE</option>
                                        <option>FEMALE</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button className="btn btn-primary flex-1">
                                    <Plus size={16} /> Add Athlete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
