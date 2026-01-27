import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, LayoutDashboard, RotateCcw, Save, ChevronDown, ChevronRight, Eye, X
} from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import { usePermissions } from '../../core/contexts/PermissionsContext';
import {
    UserRole,
    ModuleName,
    MODULE_LIST,
} from '../../core/types/permissions';

// --- Lazy Load Page Components for Previews ---
// Mapping ModuleName to lazy loaded components
const PREVIEW_COMPONENTS: Partial<Record<ModuleName, React.LazyExoticComponent<React.ComponentType<any>>>> = {
    dashboard: lazy(() => import('../../core/pages/Dashboard')),
    athletes: lazy(() => import('./AthletesPage')),
    scoring: lazy(() => import('../../athlete/pages/ScoringPage')),
    schedules: lazy(() => import('./SchedulesPage')),
    attendance: lazy(() => import('./AttendancePage')),
    finance: lazy(() => import('../features/finance/pages/FinancePage')),
    inventory: lazy(() => import('../features/inventory/pages/InventoryPage')),
    analytics: lazy(() => import('./AnalyticsPage')),
    reports: lazy(() => import('./ReportsPage')),
    profile: lazy(() => import('../../core/pages/ProfilePage')),
    digitalcard: lazy(() => import('../../core/pages/DigitalCardPage')),
    archerconfig: lazy(() => import('../../athlete/pages/ArcherConfigPage')),
    organization: lazy(() => import('./ClubOrganizationPage')),
    manpower: lazy(() => import('./ManpowerPage')),
    filemanager: lazy(() => import('./FileManagerPage')),
    // admin: lazy(() => import('../../admin/pages/SuperAdminPage')), 
    bleep_test: lazy(() => import('../../athlete/pages/BleepTestPage')),
    // jersey: lazy(() => import('../../admin/pages/production/JerseyCatalogPage')), 
    athlete_training_schedule: lazy(() => import('./SchedulesPage')),
    athlete_archery_guidance: lazy(() => import('./ArcheryGuidancePage')),
    // perpani_management
    schools: lazy(() => import('./SchoolsPage')),
    // quality_control
    notifications: lazy(() => import('./NotificationsPage')),
    audit_logs: lazy(() => import('../../admin/pages/AuditLogsPage')),
    history: lazy(() => import('../../athlete/pages/HistoryPage')),
    shipping: lazy(() => import('../features/inventory/pages/ShippingPage')),
    achievements: lazy(() => import('../../athlete/pages/AchievementsPage')),
    progress: lazy(() => import('../../athlete/pages/ProgressChartsPage')),
    coach_analytics: lazy(() => import('./CoachAnalyticsPage')),
    member_approval: lazy(() => import('./ClubMembersPage')),
    // invoicing: lazy(() => import('../features/finance/pages/InvoicingPage')),
    payments: lazy(() => import('../features/finance/pages/PaymentUploadPage')),
    o2sn_registration: lazy(() => import('../../events/pages/O2SNRegistrationPage')),
    club_approval: lazy(() => import('./ClubApprovalPage')),
    licensing: lazy(() => import('../features/finance/pages/LicensingPage')),
    // event_creation
    enhanced_reports: lazy(() => import('./EnhancedReportsPage')),
    attendance_history: lazy(() => import('./AttendanceHistoryPage')),
    // event_registration
    event_results: lazy(() => import('../../events/pages/EventResultsPage')),
    score_validation: lazy(() => import('../../events/pages/ScoreValidationPage')),
    events: lazy(() => import('../../events/pages/EventDashboardPage')),

};


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

// Loading Spinner for Previews
function PreviewLoader() {
    return (
        <div className="flex items-center justify-center h-full w-full min-h-[200px]">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

export default function ClubPermissionsPage() {
    const { user } = useAuth();
    const { getUISettings } = usePermissions();
    const [selectedRole, setSelectedRole] = useState<UserRole>('ATHLETE');
    const [clubSettings, setClubSettings] = useState<ClubSidebarSettings>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        general: true,
        role_specific: true,
    });

    // Preview Modal State
    const [previewModule, setPreviewModule] = useState<any | null>(null);

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

    // Render logic for Preview Component
    const PreviewContent = useMemo(() => {
        if (!previewModule) return null;
        const Component = PREVIEW_COMPONENTS[previewModule.name as ModuleName];

        if (!Component) {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                    <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-4">
                        <Eye size={32} className="text-dark-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Preview Available</h3>
                    <p className="text-dark-400 max-w-sm">
                        The <strong>{previewModule.label}</strong> module does not have a preview component configured or is empty.
                    </p>
                </div>
            );
        }

        return (
            <Suspense fallback={<PreviewLoader />}>
                <div className="bg-dark-950 min-h-full overflow-y-auto">
                    <Component />
                </div>
            </Suspense>
        );
    }, [previewModule]);

    return (
        <div className="min-h-screen p-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                        <Shield className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Club Panel</h1>
                        <p className="text-xs text-dark-400">Configure sidebar for club members</p>
                    </div>
                </div>
            </motion.div>

            {/* Role Selector + Actions */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-3 mb-4"
            >
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
            </motion.div>

            {/* Module Toggle - Collapsible Sections */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-3"
            >
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-primary-400" />
                    Modules for {CLUB_MANAGED_ROLES.find(r => r.role === selectedRole)?.label}
                </h2>

                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
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
                                                            className={`
                                                                flex items-center justify-between p-2 rounded-lg transition-colors
                                                                ${isVisible ? 'bg-dark-700/50' : 'hover:bg-dark-800/50'}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-sm ${isVisible ? 'text-white' : 'text-dark-400'}`}>
                                                                    {module.label}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                {/* View/Preview Button */}
                                                                <button
                                                                    onClick={() => setPreviewModule(module)}
                                                                    className="p-1.5 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                                                                    title="Preview Feature"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>

                                                                {/* Toggle Switch */}
                                                                <div
                                                                    onClick={() => toggleModule(module.name)}
                                                                    className={`
                                                                        w-8 h-4 rounded-full relative transition-colors cursor-pointer
                                                                        ${isVisible ? 'bg-primary-500' : 'bg-dark-600'}
                                                                    `}
                                                                >
                                                                    <div className={`
                                                                        absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all
                                                                        ${isVisible ? 'left-4' : 'left-0.5'}
                                                                    `} />
                                                                </div>
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
            </motion.div>

            {/* Unsaved Changes Indicator */}
            {hasChanges && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-4 right-4 bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-2 flex items-center gap-2 z-50"
                >
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs text-amber-400">Unsaved changes</span>
                </motion.div>
            )}

            {/* Feature Preview Modal */}
            <AnimatePresence>
                {previewModule && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewModule(null)}
                        className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-[95vw] h-[90vh] bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-dark-700/50 flex items-center justify-between bg-dark-800 shrink-0">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Eye size={18} className="text-primary-400" />
                                        Preview: {previewModule.label}
                                    </h3>
                                    <p className="text-xs text-dark-400">Visual preview of the module interface</p>
                                </div>
                                <button
                                    onClick={() => setPreviewModule(null)}
                                    className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 w-full bg-dark-950 overflow-hidden relative">
                                {PreviewContent}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
