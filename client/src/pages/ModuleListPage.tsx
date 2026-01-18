import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Target,
    ClipboardList,
    Edit,
    Eye,
    MoreVertical,
    Loader2,
    Archive,
    CheckCircle,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomModule, listModules } from '../services/moduleApi';

const ModuleListPage: React.FC = () => {
    const navigate = useNavigate();
    const [modules, setModules] = useState<CustomModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        loadModules();
    }, [statusFilter]);

    const loadModules = async () => {
        setIsLoading(true);
        try {
            const data = await listModules(statusFilter || undefined);
            setModules(data);
        } catch (err) {
            console.error('Failed to load modules:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredModules = modules.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'DRAFT': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'ARCHIVED': return <Archive className="w-4 h-4 text-slate-400" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/50',
            DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            ARCHIVED: 'bg-slate-500/20 text-slate-400 border-slate-500/50'
        };
        return styles[status as keyof typeof styles] || styles.DRAFT;
    };

    const getModuleIcon = (icon?: string) => {
        switch (icon) {
            case 'target': return Target;
            case 'clipboard': return ClipboardList;
            default: return ClipboardList;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Custom Modules</h1>
                        <p className="text-slate-400 mt-1">Create and manage assessment forms</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/modules/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Module
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search modules..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                ) : filteredModules.length === 0 ? (
                    <div className="bg-slate-800/30 rounded-xl p-12 text-center border border-dashed border-slate-600">
                        <ClipboardList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No modules found</h3>
                        <p className="text-slate-400 mb-6">Create your first custom assessment module</p>
                        <button
                            onClick={() => navigate('/admin/modules/new')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Module
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredModules.map((module, index) => {
                            const IconComponent = getModuleIcon(module.icon);
                            return (
                                <motion.div
                                    key={module.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                                <IconComponent className="w-5 h-5 text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{module.name}</h3>
                                                <p className="text-xs text-slate-500">{module.sipId}</p>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-slate-700 rounded">
                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                        {module.description || 'No description'}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(module.status)}`}>
                                            {getStatusIcon(module.status)}
                                            {module.status}
                                        </span>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span>{module.fieldsCount || 0} fields</span>
                                            <span>{module.assessmentsCount || 0} uses</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/modules/${module.id}/edit`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => navigate(`/assessment/${module.id}`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Preview
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuleListPage;
