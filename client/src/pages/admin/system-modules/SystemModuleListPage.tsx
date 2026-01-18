import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    Settings,
    Shield,
    ShoppingBag,
    Wrench,
    Target,
    Activity,
    ExternalLink,
    Search
} from 'lucide-react';
import { getSystemModules, SystemModule } from '../../../services/systemModule.service';

interface SystemModuleListPageProps {
    onEditModule?: (moduleCode: string) => void;
}

const SystemModuleListPage: React.FC<SystemModuleListPageProps> = ({ onEditModule }) => {
    const [modules, setModules] = useState<SystemModule[]>([]);
    const [filteredModules, setFilteredModules] = useState<SystemModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadModules();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredModules(modules);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredModules(modules.filter(m =>
                m.name.toLowerCase().includes(lowerQuery) ||
                m.code?.toLowerCase().includes(lowerQuery) ||
                m.category.toLowerCase().includes(lowerQuery)
            ));
        }
    }, [searchQuery, modules]);

    const loadModules = async () => {
        try {
            const data = await getSystemModules();
            setModules(data);
            setFilteredModules(data);
        } catch (error) {
            console.error('Failed to load system modules', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'FOUNDATION': return Shield;
            case 'COMMERCE': return ShoppingBag;
            case 'OPS': return Wrench;
            case 'SPORT': return Target;
            case 'ADMIN': return Settings;
            case 'ATHLETE': return Activity;
            default: return Package;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'FOUNDATION': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
            case 'COMMERCE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'OPS': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'SPORT': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'ADMIN': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'ATHLETE': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            default: return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400">Loading System Modules...</div>;
    }

    if (modules.length === 0) {
        return <div className="p-8 text-center text-slate-400">No system modules found. Check database or API connection.</div>;
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary-500 w-64"
                    />
                </div>
                <div className="text-xs text-slate-500">
                    Showing {filteredModules.length} modules
                </div>
            </div>

            {/* Compact Table */}
            <div className="overflow-hidden rounded-lg border border-dark-700 bg-dark-800/50">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs font-semibold text-slate-400 bg-dark-800 uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 w-12">Icon</th>
                            <th className="px-4 py-3">Module Name</th>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700/50">
                        {filteredModules.map((mod) => {
                            const CategoryIcon = getCategoryIcon(mod.category);
                            const categoryStyle = getCategoryColor(mod.category);

                            return (
                                <motion.tr
                                    key={mod.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-dark-700/30 transition-colors group"
                                >
                                    <td className="px-4 py-2">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center ${categoryStyle.split(' ')[1]}`}>
                                            <CategoryIcon size={16} className={categoryStyle.split(' ')[0]} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 font-medium text-slate-200">
                                        {mod.name}
                                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{mod.description}</div>
                                    </td>
                                    <td className="px-4 py-2 font-mono text-xs text-slate-400">
                                        {mod.code}
                                    </td>
                                    <td className="px-4 py-2">
                                        {mod.moduleType === 'ROLE_SPECIFIC' ? (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500">
                                                Role Specific
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500">
                                                Universal
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${categoryStyle}`}>
                                            {mod.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {onEditModule && (
                                            <button
                                                onClick={() => onEditModule(mod.id)}
                                                className="btn-ghost text-xs py-1 px-2 h-auto ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                                title="Edit in Factory"
                                            >
                                                <ExternalLink size={12} />
                                                Edit in Factory
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SystemModuleListPage;
