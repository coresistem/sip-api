import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Shield,
    ShoppingBag,
    Wrench,
    Target,
    Settings,
    Package,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import {
    getRoleModules,
    updateRoleModuleConfig,
    CONFIGURABLE_ROLES,
    RoleModuleWithStatus
} from '../../services/roleModule.service';

const RoleFeaturesTab: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState('ATHLETE');
    const [modules, setModules] = useState<RoleModuleWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadModules();
    }, [selectedRole]);

    const loadModules = async () => {
        try {
            setIsLoading(true);
            const data = await getRoleModules(selectedRole);
            setModules(data);
        } catch (error) {
            console.error('Failed to load role modules:', error);
            setMessage({ type: 'error', text: 'Failed to load role modules' });
        } finally {
            setIsLoading(false);
        }
    };

    // State for expanded modules
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    // Toggle Module Expand
    const toggleExpand = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        );
    };

    const handleToggleModule = async (moduleId: string, currentStatus: boolean, category: string) => {
        // Foundation modules cannot be disabled
        if (category === 'FOUNDATION' && currentStatus) {
            setMessage({ type: 'error', text: 'Foundation modules cannot be disabled.' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            setIsSaving(moduleId);
            const newStatus = !currentStatus;

            await updateRoleModuleConfig(selectedRole, moduleId, newStatus);

            // Update local state
            setModules(prev =>
                prev.map(mod =>
                    mod.id === moduleId ? { ...mod, isEnabled: newStatus } : mod
                )
            );

            setMessage({ type: 'success', text: `Module ${newStatus ? 'enabled' : 'disabled'} for ${selectedRole}` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Failed to update module:', error);
            setMessage({ type: 'error', text: 'Failed to update module' });
        } finally {
            setIsSaving(null);
        }
    };

    // Handle SubModule Toggle (Granular Config)
    const handleToggleSubModule = async (moduleId: string, subModuleCode: string, currentEnabled: boolean) => {
        try {
            // Find current module
            const module = modules.find(m => m.id === moduleId);
            if (!module) return;

            setIsSaving(`${moduleId}-${subModuleCode}`);

            // Parse existing config or init empty
            // Config structure: { enabled_features: ['code1', 'code2'] }
            let currentConfig: any = module.config || {};
            // Handle if config is a JSON string (sometimes happens if API didn't parse)
            if (typeof currentConfig === 'string') {
                try { currentConfig = JSON.parse(currentConfig); } catch (e) { currentConfig = {}; }
            }

            let enabledFeatures: string[] = Array.isArray(currentConfig.enabled_features)
                ? currentConfig.enabled_features
                : [];

            // If we are currently "enabled", we want to disable -> remove from list
            // However, wait. If the list is EMPTY, does it mean ALL enabled or None?
            // Convention: explicit list means only those. Empty means none? 
            // Or should we pre-populate if it's undefined?
            // Let's assume: If `enabled_features` exists, it controls specific features.
            // If it doesn't exist, we might default to ALL ON.

            // Logic:
            // 1. If `enabled_features` is undefined, define it as ALL existing submodules EXCEPT the one we are disabling (if disabling).
            if (!currentConfig.enabled_features) {
                // Pre-populate with ALL submodules since we assume defaulting to ON
                enabledFeatures = module.subModules.map(s => s.code);
            }

            let newFeaturesList: string[];
            if (currentEnabled) {
                // Toggling OFF: Remove from list
                newFeaturesList = enabledFeatures.filter(code => code !== subModuleCode);
            } else {
                // Toggling ON: Add to list
                newFeaturesList = [...enabledFeatures, subModuleCode];
            }

            // Prepare new config object
            const newConfig = {
                ...currentConfig,
                enabled_features: newFeaturesList
            };

            // Call API
            await updateRoleModuleConfig(selectedRole, moduleId, module.isEnabled, newConfig);

            // Update local state
            setModules(prev => prev.map(m => {
                if (m.id === moduleId) {
                    return { ...m, config: newConfig };
                }
                return m;
            }));

        } catch (error) {
            console.error("Failed to toggle sub-module", error);
            setMessage({ type: 'error', text: 'Failed to update feature config' });
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

    // Helper to check if submodule is enabled in config
    const isSubModuleEnabled = (mod: RoleModuleWithStatus, subCode: string) => {
        // If module disabled, submodule is effectively disabled
        if (!mod.isEnabled) return false;

        let config: any = mod.config || {};
        if (typeof config === 'string') {
            try { config = JSON.parse(config); } catch (e) { config = {}; }
        }

        // If `enabled_features` array exists, check inclusion
        if (Array.isArray(config.enabled_features)) {
            return config.enabled_features.includes(subCode);
        }

        // Default: If no explicit config, assume enabled (legacy behavior)
        return true;
    };

    // Filter modules based on Role Specificity
    const filteredModules = modules.filter(mod => {
        // 1. Universal modules are always shown (or legacy modules without type)
        if (mod.moduleType === 'UNIVERSAL' || !mod.moduleType) return true;

        // 2. Role specific modules check targetRoles
        if (mod.moduleType === 'ROLE_SPECIFIC') {
            if (!mod.targetRoles) return false;

            try {
                // Parse if string (it comes as JSON string from DB/API)
                const roles = typeof mod.targetRoles === 'string'
                    ? JSON.parse(mod.targetRoles)
                    : mod.targetRoles;

                if (Array.isArray(roles)) {
                    return roles.includes(selectedRole);
                }
            } catch (e) {
                console.warn('Failed to parse targetRoles for module', mod.code);
                return false;
            }
        }

        return false;
    });

    // Group modules by category - only show relevant categories for the role
    const groupedModules = filteredModules.reduce((acc, mod) => {
        if (!acc[mod.category]) acc[mod.category] = [];
        acc[mod.category].push(mod);
        return acc;
    }, {} as Record<string, RoleModuleWithStatus[]>);

    // For ATHLETE role, prioritize ATHLETE category first then others
    const categoryOrder = selectedRole === 'ATHLETE'
        ? ['ATHLETE', 'FOUNDATION', 'COMMERCE', 'OPS', 'SPORT', 'ADMIN']
        : ['FOUNDATION', 'COMMERCE', 'OPS', 'SPORT', 'ADMIN', 'ATHLETE'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-400" />
                        Role Features Configuration (Lego Mode)
                    </h2>
                    <p className="text-sm text-dark-400 mt-1">
                        Control specifically which modules and sub-features are visible.
                    </p>
                </div>
            </div>

            {/* Role Selector */}
            <div className="flex flex-wrap gap-2">
                {CONFIGURABLE_ROLES.map(r => (
                    <button
                        key={r.role}
                        onClick={() => setSelectedRole(r.role)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedRole === r.role
                            ? 'bg-primary-500/20 border border-primary-500 text-white'
                            : 'bg-dark-700 hover:bg-dark-600 text-dark-300 border border-transparent'
                            }`}
                    >
                        <span className={selectedRole === r.role ? r.color : ''}>{r.label}</span>
                    </button>
                ))}
            </div>

            {/* Message */}
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

            {/* Loading */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            ) : (
                <div className="space-y-8">
                    {categoryOrder.map(category => {
                        const categoryModules = groupedModules[category] || [];
                        if (categoryModules.length === 0) return null;

                        const CategoryIcon = getCategoryIcon(category);
                        const colorClass = getCategoryColor(category);

                        return (
                            <div key={category} className="space-y-4">
                                <h3 className={`flex items-center gap-2 text-lg font-semibold px-4 py-2 rounded-lg border w-fit ${colorClass}`}>
                                    <CategoryIcon className="w-5 h-5" />
                                    {category === 'OPS' ? 'OPERATIONS' : category}
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {categoryModules.map(mod => {
                                        const isLocked = mod.category === 'FOUNDATION';
                                        const isExpanded = expandedModules.includes(mod.id);
                                        const hasSubModules = mod.subModules && mod.subModules.length > 0;

                                        return (
                                            <motion.div
                                                key={mod.id}
                                                layout
                                                className={`rounded-xl border transition-all overflow-hidden ${mod.isEnabled
                                                    ? 'bg-dark-800 border-dark-700'
                                                    : 'bg-dark-800/50 border-dark-800 opacity-75'
                                                    }`}
                                            >
                                                <div className="p-5 flex items-start justify-between gap-4">
                                                    {/* Expansion Trigger (if module has submodules) */}
                                                    <div className="flex items-start gap-4 flex-1">
                                                        {hasSubModules && (
                                                            <button
                                                                onClick={() => toggleExpand(mod.id)}
                                                                className="mt-1 p-1 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-white"
                                                            >
                                                                {isExpanded ? <CheckCircle2 className="rotate-0 transition-transform" size={16} /> : <Settings className="rotate-0 transition-transform" size={16} />}
                                                            </button>
                                                        )}

                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-bold text-white">{mod.name}</h4>
                                                                <span className="text-xs font-mono bg-dark-900 text-dark-400 px-2 py-1 rounded border border-dark-800">
                                                                    {mod.code}
                                                                </span>
                                                                {isLocked && (
                                                                    <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                                        <Shield size={10} /> Core
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-dark-300 text-sm">
                                                                {mod.description}
                                                            </p>

                                                            {/* Helper text if collapsed but has submodules */}
                                                            {hasSubModules && !isExpanded && (
                                                                <p className="text-xs text-dark-500 mt-2 italic cursor-pointer hover:text-primary-400" onClick={() => toggleExpand(mod.id)}>
                                                                    {mod.subModules.length} customizable features inside...
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleModule(mod.id, mod.isEnabled, mod.category)}
                                                            disabled={isLocked || isSaving === mod.id}
                                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 ${mod.isEnabled ? 'bg-primary-500' : 'bg-dark-600'
                                                                } ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                        >
                                                            <span
                                                                className={`${mod.isEnabled ? 'translate-x-6' : 'translate-x-1'
                                                                    } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                                            />
                                                        </button>
                                                        <span className={`text-xs font-medium ${mod.isEnabled ? 'text-primary-400' : 'text-dark-400'}`}>
                                                            {isSaving === mod.id ? 'Saving...' : (mod.isEnabled ? 'Active' : 'Inactive')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expanded Section: SubModules */}
                                                <AnimatePresence>
                                                    {isExpanded && hasSubModules && mod.isEnabled && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="bg-dark-900/50 border-t border-dark-700"
                                                        >
                                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {mod.subModules.map(sub => {
                                                                    const subEnabled = isSubModuleEnabled(mod, sub.code);
                                                                    const isSubSaving = isSaving === `${mod.id}-${sub.code}`;

                                                                    return (
                                                                        <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800 border border-dark-700">
                                                                            <div>
                                                                                <p className="font-medium text-sm text-white">{sub.name}</p>
                                                                                <p className="text-xs text-dark-400">{sub.code}</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleToggleSubModule(mod.id, sub.code, subEnabled)}
                                                                                disabled={isSubSaving}
                                                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${subEnabled ? 'bg-emerald-500' : 'bg-dark-600'
                                                                                    }`}
                                                                            >
                                                                                <span
                                                                                    className={`${subEnabled ? 'translate-x-4' : 'translate-x-1'
                                                                                        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RoleFeaturesTab;
