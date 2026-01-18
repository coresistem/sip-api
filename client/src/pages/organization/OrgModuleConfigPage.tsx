
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle2,
    Shield,
    ShoppingBag,
    Wrench,
    Target,
    Settings,
    Package,
    Loader2
} from 'lucide-react';
import {
    getSystemModules,
    getOrgModuleConfig,
    updateOrgModuleConfig,
    SystemModule,
    OrgModuleConfig
} from '../../services/systemModule.service';
import { useAuth } from '../../context/AuthContext';

const OrgModuleConfigPage: React.FC = () => {
    const { user } = useAuth();
    const [modules, setModules] = useState<SystemModule[]>([]);
    const [orgConfigs, setOrgConfigs] = useState<Record<string, OrgModuleConfig>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null); // moduleId being saved
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [modulesData, configData] = await Promise.all([
                getSystemModules(),
                getOrgModuleConfig()
            ]);

            setModules(modulesData);

            // Map configs for easy lookup
            const configMap: Record<string, OrgModuleConfig> = {};
            configData.forEach(c => {
                configMap[c.moduleId] = c;
            });
            setOrgConfigs(configMap);

        } catch (error) {
            console.error('Failed to load data', error);
            setMessage({ type: 'error', text: 'Failed to load configuration data.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleModule = async (moduleId: string, currentStatus: boolean, category: string) => {
        // Prevent disabling Foundation modules
        if (category === 'FOUNDATION' && currentStatus) {
            setMessage({ type: 'error', text: 'Foundation modules cannot be disabled.' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            setIsSaving(moduleId);
            const newStatus = !currentStatus;

            // Get existing config or empty object
            const currentConfig = orgConfigs[moduleId]?.config || {};

            await updateOrgModuleConfig(moduleId, newStatus, currentConfig);

            // Update local state
            setOrgConfigs(prev => ({
                ...prev,
                [moduleId]: {
                    ...prev[moduleId],
                    moduleId,
                    organizationId: user?.id || '',
                    isEnabled: newStatus,
                    config: currentConfig
                }
            }));

            setMessage({ type: 'success', text: `Module ${newStatus ? 'enabled' : 'disabled'} successfully.` });
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error('Failed to update module', error);
            setMessage({ type: 'error', text: 'Failed to update module status.' });
        } finally {
            setIsSaving(null);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'FOUNDATION': return Shield;
            case 'COMMERCE': return ShoppingBag;
            case 'OPS': return Wrench;
            case 'SPORT': return Target;
            case 'ADMIN': return Settings;
            case 'ATHLETE': return Target;
            default: return Package;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'FOUNDATION': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
            case 'COMMERCE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'OPS': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'SPORT': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'ADMIN': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'ATHLETE': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            default: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        }
    };

    // Group modules by category
    const groupedModules = modules.reduce((acc, mod) => {
        if (!acc[mod.category]) acc[mod.category] = [];
        acc[mod.category].push(mod);
        return acc;
    }, {} as Record<string, SystemModule[]>);

    const categories = ['FOUNDATION', 'COMMERCE', 'OPS', 'SPORT', 'ADMIN', 'ATHLETE'];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Settings className="w-8 h-8 text-primary-500" />
                        Organization Configuration
                    </h1>
                    <p className="text-dark-400 mt-2">
                        Manage your organization's active features and settings.
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-8">
                {categories.map(category => {
                    const categoryModules = groupedModules[category] || [];
                    if (categoryModules.length === 0) return null;

                    const CategoryIcon = getCategoryIcon(category);
                    const colorClass = getCategoryColor(category);

                    return (
                        <div key={category} className="space-y-4">
                            <h2 className={`flex items-center gap-2 text-lg font-semibold px-4 py-2 rounded-lg border w-fit ${colorClass}`}>
                                <CategoryIcon className="w-5 h-5" />
                                {category === 'OPS' ? 'OPERATIONS' : category}
                            </h2>

                            <div className="grid grid-cols-1 gap-4">
                                {categoryModules.map(mod => {
                                    const orgConfig = orgConfigs[mod.id];
                                    const isEnabled = orgConfig?.isEnabled ?? (mod.category === 'FOUNDATION'); // Foundation defaults to true if missing
                                    const isLocked = mod.category === 'FOUNDATION';

                                    return (
                                        <motion.div
                                            key={mod.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`rounded-xl border transition-all ${isEnabled
                                                ? 'bg-dark-800 border-dark-700'
                                                : 'bg-dark-800/50 border-dark-800 opacity-75'
                                                }`}
                                        >
                                            <div className="p-6 flex items-start justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-white">
                                                            {mod.name}
                                                        </h3>
                                                        <span className="text-xs font-mono bg-dark-900 text-dark-400 px-2 py-1 rounded border border-dark-800">
                                                            {mod.code}
                                                        </span>
                                                        {isLocked && (
                                                            <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Shield size={10} /> Core
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-dark-300 text-sm leading-relaxed">
                                                        {mod.description}
                                                    </p>

                                                    {/* Submodules Badges */}
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {mod.subModules.map(sub => (
                                                            <span key={sub.id} className="text-xs bg-dark-700 text-dark-300 px-2.5 py-1 rounded-full border border-dark-600">
                                                                {sub.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-3">
                                                    <button
                                                        onClick={() => handleToggleModule(mod.id, isEnabled, mod.category)}
                                                        disabled={isLocked || isSaving === mod.id}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 ${isEnabled ? 'bg-primary-500' : 'bg-dark-600'
                                                            } ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                    >
                                                        <span
                                                            className={`${isEnabled ? 'translate-x-6' : 'translate-x-1'
                                                                } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                                        />
                                                    </button>
                                                    <span className={`text-xs font-medium ${isEnabled ? 'text-primary-400' : 'text-dark-400'}`}>
                                                        {isSaving === mod.id ? 'Saving...' : (isEnabled ? 'Active' : 'Inactive')}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrgModuleConfigPage;
