import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, LayoutDashboard, RotateCcw, Save, ChevronDown, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import {
    UserRole,
    ModuleName,
    MODULE_LIST,
} from '../../types/permissions';

// Roles that a Club can manage
const CLUB_MANAGED_ROLES: { role: UserRole; label: string; color: string }[] = [
    { role: 'ATHLETE', label: 'Athletes', color: 'text-blue-400' },
    { role: 'COACH', label: 'Coaches', color: 'text-green-400' },
    { role: 'PARENT', label: 'Parents', color: 'text-purple-400' },
];

// Storage key generator
const getClubStorageKey = (clubId: string) => `sip_club_sidebar_${clubId}_v1`;

// Types for club settings
interface ClubSidebarSettings {
    [role: string]: ModuleName[];
}

interface ClubPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ClubPermissionsModal({ isOpen, onClose }: ClubPermissionsModalProps) {
    const { user } = useAuth();
    const { getUISettings } = usePermissions();
    const [selectedRole, setSelectedRole] = useState<UserRole>('ATHLETE');
    const [clubSettings, setClubSettings] = useState<ClubSidebarSettings>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        general: true,
        role_specific: true,
    });

    const clubId = user?.clubId || user?.id || 'default';

    // Get Super Admin's allowed modules for the selected role (the maximum)
    const superAdminAllowedModules = useMemo(() => {
        return getUISettings(selectedRole).sidebarModules;
    }, [selectedRole, getUISettings]);

    // Load club settings from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(getClubStorageKey(clubId));
        if (stored) {
            try {
                setClubSettings(JSON.parse(stored));
            } catch {
                setClubSettings({});
            }
        }
    }, [clubId]);

    // Get current visible modules for the selected role
    const currentVisibleModules = useMemo(() => {
        if (clubSettings[selectedRole]) {
            return clubSettings[selectedRole].filter(m =>
                superAdminAllowedModules.includes(m)
            );
        }
        return superAdminAllowedModules;
    }, [selectedRole, clubSettings, superAdminAllowedModules]);

    // Toggle a module for the selected role
    const toggleModule = (moduleName: ModuleName) => {
        const currentModules = clubSettings[selectedRole] || [...superAdminAllowedModules];
        let updated: ModuleName[];

        if (currentModules.includes(moduleName)) {
            updated = currentModules.filter(m => m !== moduleName);
        } else {
            updated = [...currentModules, moduleName];
        }

        setClubSettings(prev => ({
            ...prev,
            [selectedRole]: updated
        }));
        setHasChanges(true);
    };

    // Toggle section expand/collapse
    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Save settings to localStorage
    const handleSave = () => {
        localStorage.setItem(getClubStorageKey(clubId), JSON.stringify(clubSettings));
        setHasChanges(false);
        // Optional: Notify user or just show state
    };

    // Reset to Super Admin defaults
    const handleReset = () => {
        const newSettings = { ...clubSettings };
        delete newSettings[selectedRole];
        setClubSettings(newSettings);
        setHasChanges(true);
    };

    // Group modules by category (only show ones Super Admin allows)
    const groupedModules = useMemo(() => {
        const groups: Record<string, typeof MODULE_LIST> = {
            general: [],
            role_specific: [],
        };

        MODULE_LIST.forEach(module => {
            if (superAdminAllowedModules.includes(module.name)) {
                if (module.category === 'general') {
                    groups.general.push(module);
                } else if (module.category === 'role_specific') {
                    groups.role_specific.push(module);
                }
            }
        });

        return groups;
    }, [superAdminAllowedModules]);

    const categoryLabels: Record<string, string> = {
        general: 'General',
        role_specific: 'Role Specific',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-dark-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                        <Shield className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-white">Club Panel</h2>
                                        <p className="text-[10px] text-dark-400">Sidebar Permissions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {/* Role Selector + Actions */}
                                <div className="card p-3">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary-400" />
                                            <div className="flex gap-1">
                                                {CLUB_MANAGED_ROLES.map(r => (
                                                    <button
                                                        key={r.role}
                                                        onClick={() => setSelectedRole(r.role)}
                                                        className={`
                                                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                            ${selectedRole === r.role
                                                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                                                : 'bg-dark-800 text-dark-400 hover:bg-dark-700 border border-dark-700'
                                                            }
                                                        `}
                                                    >
                                                        {r.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleReset}
                                                className="btn-secondary text-xs flex items-center gap-1.5 px-2 py-1.5"
                                            >
                                                <RotateCcw size={12} />
                                                Reset
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={!hasChanges}
                                                className={`
                                                    btn-primary text-xs flex items-center gap-1.5 px-2 py-1.5
                                                    ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                <Save size={12} />
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Module Toggle - Collapsible Sections */}
                                <div className="card p-3">
                                    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4 text-primary-400" />
                                        Modules for {CLUB_MANAGED_ROLES.find(r => r.role === selectedRole)?.label}
                                    </h2>

                                    <div className="space-y-2">
                                        {Object.entries(groupedModules).map(([category, modules]) => {
                                            if (modules.length === 0) return null;
                                            const isExpanded = expandedSections[category];
                                            const enabledCount = modules.filter(m => currentVisibleModules.includes(m.name)).length;

                                            return (
                                                <div key={category} className="border border-dark-700 rounded-lg overflow-hidden">
                                                    {/* Collapsible Header */}
                                                    <button
                                                        onClick={() => toggleSection(category)}
                                                        className="w-full flex items-center justify-between p-3 bg-dark-800/50 hover:bg-dark-800 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isExpanded ? (
                                                                <ChevronDown size={16} className="text-dark-400" />
                                                            ) : (
                                                                <ChevronRight size={16} className="text-dark-400" />
                                                            )}
                                                            <span className="text-xs font-bold uppercase text-dark-300 tracking-wider">
                                                                {categoryLabels[category] || category}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-dark-500">
                                                            {enabledCount}/{modules.length} enabled
                                                        </span>
                                                    </button>

                                                    {/* Collapsible Content */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-2 space-y-1 bg-dark-900/30">
                                                                    {modules.map((module) => {
                                                                        const isVisible = currentVisibleModules.includes(module.name);
                                                                        return (
                                                                            <div
                                                                                key={module.name}
                                                                                onClick={() => toggleModule(module.name)}
                                                                                className={`
                                                                                    flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                                                                                    ${isVisible ? 'bg-dark-700/50 hover:bg-dark-700' : 'hover:bg-dark-800/50'}
                                                                                `}
                                                                            >
                                                                                <span className={`text-sm ${isVisible ? 'text-white' : 'text-dark-400'}`}>
                                                                                    {module.label}
                                                                                </span>

                                                                                {/* Toggle Switch */}
                                                                                <div className={`
                                                                                    w-8 h-4 rounded-full relative transition-colors
                                                                                    ${isVisible ? 'bg-primary-500' : 'bg-dark-600'}
                                                                                `}>
                                                                                    <div className={`
                                                                                        absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all
                                                                                        ${isVisible ? 'left-4' : 'left-0.5'}
                                                                                    `} />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}

                                        {groupedModules.general.length === 0 && groupedModules.role_specific.length === 0 && (
                                            <div className="text-center py-6 text-dark-400">
                                                <p className="text-sm">No modules available for this role.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer - Status */}
                            {hasChanges && (
                                <div className="p-3 border-t border-dark-700/50 bg-amber-500/10 flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-xs text-amber-400 font-medium">Unsaved changes - Click Save to apply</span>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
