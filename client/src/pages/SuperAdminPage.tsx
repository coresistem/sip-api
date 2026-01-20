import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, Settings, RotateCcw, Check, X, Palette, LayoutGrid,
    LayoutDashboard, Target, Calendar, CheckSquare, DollarSign, Package, BarChart3, FileText, User,
    MapPin, Search, ChevronRight, Plus, Pencil, Trash2, CreditCard, Building2, FolderOpen, Layers, Factory, Trophy,
    TrendingUp, UserPlus, History, CheckCircle, FileSearch, Bug
} from 'lucide-react';
import { usePermissions } from '../context/PermissionsContext';
import {
    UserRole,
    ModuleName,
    ActionType,
    MODULE_LIST,
} from '../types/permissions';
import { PROVINCES, CITIES, getCitiesByProvince } from '../types/territoryData';
import { Province, City, ROLE_CODES, ROLE_CODE_TO_NAME } from '../types/territory';
import {
    UIModuleConfig,
    CustomModule,
    UIBuilderConfig,
    getUIBuilderConfig,
    saveUIBuilderConfig,
    generateDefaultModuleConfigs,
    generateModuleId
} from '../types/uiBuilder';
import ModuleTree from '../components/admin/ModuleTree';
import CustomModuleModal from '../components/admin/CustomModuleModal';
import PageCoverageWidget from '../components/admin/widgets/PageCoverageWidget';
import UserAnalyticsChart from '../components/admin/widgets/UserAnalyticsChart';
import SystemModuleListPage from './admin/system-modules/SystemModuleListPage';
import SystemModulesFactoryPage from './admin/SystemModulesFactoryPage';
import RoleFeaturesTab from '../components/admin/RoleFeaturesTab';
import EODashboard from '../components/dashboard/EODashboard';
import AuditLogsTab from '../components/admin/AuditLogsTab';
import TroubleshootTab from '../components/admin/TroubleshootTab';

const ROLE_LIST: { role: UserRole; label: string; color: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'text-red-400' },
    { role: 'PERPANI', label: 'Perpani', color: 'text-red-500' },
    { role: 'CLUB', label: 'Club', color: 'text-orange-400' },
    { role: 'SCHOOL', label: 'School', color: 'text-emerald-400' },
    { role: 'ATHLETE', label: 'Athlete', color: 'text-blue-400' },
    { role: 'PARENT', label: 'Parent', color: 'text-purple-400' },
    { role: 'COACH', label: 'Coach', color: 'text-green-400' },
    { role: 'JUDGE', label: 'Judge', color: 'text-indigo-400' },
    { role: 'EO', label: 'Event Organizer', color: 'text-teal-400' },
    { role: 'SUPPLIER', label: 'Supplier', color: 'text-rose-400' },
];

const ICON_MAP: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard size={16} />,
    Users: <Users size={16} />,
    Target: <Target size={16} />,
    Calendar: <Calendar size={16} />,
    CheckSquare: <CheckSquare size={16} />,
    DollarSign: <DollarSign size={16} />,
    Package: <Package size={16} />,
    BarChart3: <BarChart3 size={16} />,
    FileText: <FileText size={16} />,
    User: <User size={16} />,
    Settings: <Settings size={16} />,
    CreditCard: <CreditCard size={16} />,
    Building2: <Building2 size={16} />,
    FolderOpen: <FolderOpen size={16} />,
};

const COLOR_PRESETS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
];

export default function SuperAdminPage() {
    const {
        permissions,
        hasPermission,
        updatePermission,
        resetPermissions,
        uiSettings,
        getUISettings,
        updateUISettings,
        resetUISettings,
    } = usePermissions();

    const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'role-config' | 'territories' | 'roles' | 'system-modules' | 'factory' | 'events' | 'audit-logs' | 'troubleshoot'>('overview');
    const [selectedRole, setSelectedRole] = useState<UserRole>('CLUB');
    const [selectedFactoryModuleId, setSelectedFactoryModuleId] = useState<string | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Territories state
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [territorySearch, setTerritorySearch] = useState('');

    // UI Builder state
    const [moduleConfigs, setModuleConfigs] = useState<Record<UserRole, UIModuleConfig[]>>(() => {
        const config = getUIBuilderConfig();
        if (config) {
            const record: Record<UserRole, UIModuleConfig[]> = {} as Record<UserRole, UIModuleConfig[]>;
            config.settings.forEach(s => {
                record[s.role] = s.modules;
            });
            return record;
        }
        // Initialize with defaults
        const defaultModules = MODULE_LIST.filter(m => m.name !== 'admin').map(m => m.name as ModuleName);
        const record: Record<UserRole, UIModuleConfig[]> = {} as Record<UserRole, UIModuleConfig[]>;
        ROLE_LIST.forEach(r => {
            record[r.role] = generateDefaultModuleConfigs(defaultModules);
        });
        return record;
    });

    const [customModules, setCustomModules] = useState<Record<UserRole, CustomModule[]>>(() => {
        const config = getUIBuilderConfig();
        if (config) {
            const record: Record<UserRole, CustomModule[]> = {} as Record<UserRole, CustomModule[]>;
            config.settings.forEach(s => {
                record[s.role] = s.customModules || [];
            });
            return record;
        }
        const record: Record<UserRole, CustomModule[]> = {} as Record<UserRole, CustomModule[]>;
        ROLE_LIST.forEach(r => {
            record[r.role] = [];
        });
        return record;
    });

    const [showCustomModuleModal, setShowCustomModuleModal] = useState(false);

    // Save to localStorage when configs change
    useEffect(() => {
        const config: UIBuilderConfig = {
            version: '1.0',
            lastUpdated: new Date().toISOString(),
            settings: ROLE_LIST.map(r => ({
                role: r.role,
                primaryColor: getUISettings(r.role).primaryColor,
                accentColor: getUISettings(r.role).accentColor,
                modules: moduleConfigs[r.role] || [],
                customModules: customModules[r.role] || [],
            })),
        };
        saveUIBuilderConfig(config);
    }, [moduleConfigs, customModules]);

    // Filter provinces by search
    const filteredProvinces = PROVINCES.filter(p =>
        p.name.toLowerCase().includes(territorySearch.toLowerCase()) ||
        p.id.includes(territorySearch)
    );

    // Get cities for selected province
    const provinceCities = selectedProvince ? getCitiesByProvince(selectedProvince.id) : [];

    const currentUISettings = getUISettings(selectedRole);

    const togglePermission = (role: UserRole, module: ModuleName, action: ActionType) => {
        // Prevent modifying Super Admin permissions
        if (role === 'SUPER_ADMIN') return;
        const current = hasPermission(role, module, action);
        updatePermission(role, module, action, !current);
    };

    const toggleSidebarModule = (module: ModuleName) => {
        const current = currentUISettings.sidebarModules;
        const updated = current.includes(module)
            ? current.filter(m => m !== module)
            : [...current, module];
        updateUISettings(selectedRole, { sidebarModules: updated });
    };

    const handleReset = () => {
        resetPermissions();
        resetUISettings();
        // Reset UI Builder configs
        const defaultModules = MODULE_LIST.filter(m => m.name !== 'admin').map(m => m.name as ModuleName);
        const newModuleConfigs: Record<UserRole, UIModuleConfig[]> = {} as Record<UserRole, UIModuleConfig[]>;
        const newCustomModules: Record<UserRole, CustomModule[]> = {} as Record<UserRole, CustomModule[]>;
        ROLE_LIST.forEach(r => {
            newModuleConfigs[r.role] = generateDefaultModuleConfigs(defaultModules);
            newCustomModules[r.role] = [];
        });
        setModuleConfigs(newModuleConfigs);
        setCustomModules(newCustomModules);
        setShowResetConfirm(false);
    };

    const handleModulesChange = (modules: UIModuleConfig[]) => {
        setModuleConfigs(prev => ({
            ...prev,
            [selectedRole]: modules,
        }));
    };

    const handleCustomModulesChange = (modules: CustomModule[]) => {
        setCustomModules(prev => ({
            ...prev,
            [selectedRole]: modules,
        }));
    };

    const handleAddCustomModule = (module: CustomModule) => {
        setCustomModules(prev => ({
            ...prev,
            [selectedRole]: [...(prev[selectedRole] || []), module],
        }));
        setShowCustomModuleModal(false);
    };


    return (
        <div className="space-y-6 text-sm lg:text-base">
            {/* Header (Removed - handled by DashboardLayout) */}

            {/* Tab Navigation */}
            <motion.div className="sticky top-16 z-20 bg-dark-950/95 backdrop-blur-md flex gap-2 border-b border-dark-700/50 mb-4 -mx-4 lg:-mx-6 px-4 lg:px-6 pb-2 overflow-x-auto scrollbar-hide">
                {/* Overview Tab (New) */}
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'overview'
                        ? 'bg-primary-500/20 text-primary-400 border-x border-t border-primary-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <LayoutDashboard size={16} />
                    <span className="hidden md:inline">Overview</span>
                </button>
                {/* Events Tab */}
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'events'
                        ? 'bg-purple-500/20 text-purple-400 border-x border-t border-purple-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <Trophy size={16} />
                    <span className="hidden md:inline">Events</span>
                </button>
                {/* Factory Tab */}
                <button
                    onClick={() => setActiveTab('factory')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'factory'
                        ? 'bg-amber-500/20 text-amber-400 border-x border-t border-amber-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <Factory size={16} />
                    <span className="hidden md:inline">Factory</span>
                </button>
                {/* System Modules Tab */}
                <button
                    onClick={() => setActiveTab('system-modules')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'system-modules'
                        ? 'bg-blue-500/20 text-blue-400 border-x border-t border-blue-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <Layers size={16} />
                    <span className="hidden md:inline">System Modules</span>
                </button>
                {/* Permissions Tab */}
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'permissions'
                        ? 'bg-primary-500/20 text-primary-400 border-x border-t border-primary-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <Shield size={16} />
                    <span className="hidden md:inline">Permissions</span>
                </button>
                {/* Role Configuration Tab */}
                <button
                    onClick={() => setActiveTab('role-config')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'role-config'
                        ? 'bg-emerald-500/20 text-emerald-400 border-x border-t border-emerald-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <Settings size={16} />
                    <span className="hidden md:inline">Role Configuration</span>
                </button>
                {/* Territories Tab */}
                <button
                    onClick={() => setActiveTab('territories')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'territories'
                        ? 'bg-teal-500/20 text-teal-400 border-x border-t border-teal-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <MapPin size={16} />
                    <span className="hidden md:inline">Territories</span>
                </button>
                {/* Role Codes Tab */}
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'roles'
                        ? 'bg-indigo-500/20 text-indigo-400 border-x border-t border-indigo-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <LayoutGrid size={16} />
                    <span className="hidden md:inline">Role Codes</span>
                </button>
                {/* Audit Logs Tab */}
                <button
                    onClick={() => setActiveTab('audit-logs')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'audit-logs'
                        ? 'bg-rose-500/20 text-rose-400 border-x border-t border-rose-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <FileSearch size={16} />
                    <span className="hidden md:inline">Audit Logs</span>
                </button>
                {/* Troubleshoot Tab */}
                <button
                    onClick={() => setActiveTab('troubleshoot')}
                    className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap text-xs md:text-sm ${activeTab === 'troubleshoot'
                        ? 'bg-pink-500/20 text-pink-400 border-x border-t border-pink-500/30'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                        }`}
                >
                    <Bug size={16} />
                    <span className="hidden md:inline">Troubleshoot</span>
                </button>
            </motion.div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-4 lg:pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    {/* Left Column: Stats & Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Grid - Mobile 2 cols */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                            <div className="card p-3 md:p-4">
                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                        <Users size={20} />
                                    </div>
                                    <span className="text-dark-400 text-xs md:text-sm">Total Users</span>
                                </div>
                                <p className="text-xl md:text-2xl font-bold">1,248</p>
                                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                    <TrendingUp size={12} />
                                    +12% this month
                                </p>
                            </div>
                            <div className="card p-3 md:p-4">
                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                                        <Building2 size={20} />
                                    </div>
                                    <span className="text-dark-400 text-xs md:text-sm">Active Clubs</span>
                                </div>
                                <p className="text-xl md:text-2xl font-bold">42</p>
                                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                    <TrendingUp size={12} />
                                    +3 this week
                                </p>
                            </div>
                            <div className="card p-3 md:p-4">
                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                        <Trophy size={20} />
                                    </div>
                                    <span className="text-dark-400 text-xs md:text-sm">Events</span>
                                </div>
                                <p className="text-xl md:text-2xl font-bold">8</p>
                                <p className="text-xs text-dark-400 mt-1">
                                    2 ongoing
                                </p>
                            </div>
                            <div className="card p-3 md:p-4">
                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                        <DollarSign size={20} />
                                    </div>
                                    <span className="text-dark-400 text-xs md:text-sm">Revenue</span>
                                </div>
                                <p className="text-xl md:text-2xl font-bold">Rp 45M</p>
                                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                    <TrendingUp size={12} />
                                    +8% vs last month
                                </p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card">
                            <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-primary-400" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { user: 'Budi Santoso', action: 'registered as', role: 'Coach', time: '2 mins ago', icon: UserPlus },
                                    { user: 'Eagle Eye Archery', action: 'updated profile', role: 'Club', time: '15 mins ago', icon: Pencil },
                                    { user: 'Siti Aminah', action: 'submitted score', role: 'Athlete', time: '1 hour ago', icon: Target },
                                    { user: 'Jakarta Open 2024', action: 'published results', role: 'EO', time: '3 hours ago', icon: Trophy },
                                    { user: 'Ahmad Rizki', action: 'renewed license', role: 'Judge', time: '5 hours ago', icon: CheckCircle },
                                ].map((activity, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-dark-700/30 hover:bg-dark-700/50 transition-colors">
                                        <div className="p-2 rounded-full bg-dark-800 text-dark-400">
                                            <activity.icon size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs md:text-sm">
                                                <span className="font-semibold text-white">{activity.user}</span>{' '}
                                                <span className="text-dark-400">{activity.action}</span>
                                            </p>
                                            <p className="text-xs text-primary-400">{activity.role}</p>
                                        </div>
                                        <span className="text-xs text-dark-500">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* User Analytics Chart */}
                        <UserAnalyticsChart />
                    </div>

                    {/* Right Column: Health & Coverage */}
                    <div className="space-y-6">
                        {/* Page Coverage Widget */}
                        <div className="h-96">
                            <PageCoverageWidget />
                        </div>

                        {/* System Health */}
                        <div className="card">
                            <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-emerald-400" />
                                System Health
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs md:text-sm">API Server</span>
                                    </div>
                                    <span className="text-xs font-mono text-emerald-400">ONLINE (42ms)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs md:text-sm">Database (Neon)</span>
                                    </div>
                                    <span className="text-xs font-mono text-emerald-400">HEALTHY</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs md:text-sm">Storage (R2)</span>
                                    </div>
                                    <span className="text-xs font-mono text-emerald-400">OK</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs md:text-sm">Email Service</span>
                                    </div>
                                    <span className="text-xs font-mono text-emerald-400">OPERATIONAL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Permissions Matrix Tab */}
            {activeTab === 'permissions' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card overflow-hidden mt-6"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary-400" />
                        Role Permissions Matrix
                    </h2>
                    <p className="text-sm text-dark-400 mb-6">
                        Toggle module access for each role. Super Admin permissions cannot be modified.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-dark-700">
                                    <th className="text-left py-3 px-2 text-dark-400 font-medium sticky left-0 bg-dark-800 z-10">Module</th>
                                    {ROLE_LIST.map(r => (
                                        <th key={r.role} className="text-center py-3 px-2 min-w-[100px]">
                                            <span className={`font-medium ${r.color}`}>{r.label}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {MODULE_LIST.filter(m => m.name !== 'profile').map((module) => (
                                    <tr key={module.name} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                                        <td className="py-3 px-2 font-medium sticky left-0 bg-dark-800 z-10">
                                            <div className="flex items-center gap-2">
                                                {ICON_MAP[module.icon]}
                                                {module.label}
                                            </div>
                                        </td>
                                        {ROLE_LIST.map(r => {
                                            const canView = hasPermission(r.role, module.name, 'view');
                                            const isSuperAdmin = r.role === 'SUPER_ADMIN';
                                            return (
                                                <td key={r.role} className="py-3 px-2 text-center">
                                                    <button
                                                        onClick={() => togglePermission(r.role, module.name, 'view')}
                                                        disabled={isSuperAdmin}
                                                        className={`w-10 h-6 rounded-full transition-colors relative ${canView
                                                            ? 'bg-emerald-500'
                                                            : 'bg-dark-600'
                                                            } ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                                                    >
                                                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${canView ? 'left-5' : 'left-1'
                                                            }`} />
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex items-center gap-6 text-sm text-dark-400">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-500" />
                            <span>Access Enabled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-dark-600" />
                            <span>Access Disabled</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Role Configuration Tab (Merged UI Settings + Role Features) */}
            {activeTab === 'role-config' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-4"
                >
                    {/* Role Selector */}
                    <div className="card p-4 mb-4">
                        <label className="text-sm font-medium text-dark-400 mb-2 block">Configure Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                            className="w-full md:w-64 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                        >
                            {ROLE_LIST.map(r => (
                                <option key={r.role} value={r.role}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left: Sidebar Modules */}
                        {/* Left: Sidebar Modules Configuration */}
                        <div className="card p-4">
                            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-primary-400" />
                                Sidebar Visibility
                            </h2>
                            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {(['general', 'role_specific', 'admin_only'] as const).map(category => {
                                    const categoryModules = MODULE_LIST.filter(m => m.category === category);
                                    if (categoryModules.length === 0) return null;

                                    return (
                                        <div key={category}>
                                            <h3 className="text-xs font-bold uppercase text-dark-500 mb-2 tracking-wider">
                                                {category.replace('_', ' ')}
                                            </h3>
                                            <div className="space-y-1">
                                                {categoryModules.map((module) => {
                                                    const isVisible = currentUISettings.sidebarModules.includes(module.name);
                                                    return (
                                                        <div
                                                            key={module.name}
                                                            onClick={() => {
                                                                let updated = [...currentUISettings.sidebarModules];
                                                                if (isVisible) {
                                                                    updated = updated.filter(m => m !== module.name);
                                                                } else {
                                                                    updated.push(module.name);
                                                                }
                                                                updateUISettings(selectedRole, { sidebarModules: updated });
                                                            }}
                                                            className={`
                                                                flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                                                                ${isVisible ? 'bg-dark-700 hover:bg-dark-600' : 'hover:bg-dark-800'}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`
                                                                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                                    ${isVisible ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400'}
                                                                `}>
                                                                    {/* We can use a generic icon or map it if we import icons dynamically, 
                                                                        but for now let's just use the label or a generic one */}
                                                                    <LayoutDashboard size={16} />
                                                                </div>
                                                                <span className={`text-sm ${isVisible ? 'text-white' : 'text-dark-400'}`}>
                                                                    {module.label}
                                                                </span>
                                                            </div>

                                                            {/* Toggle Switch Visual */}
                                                            <div className={`
                                                                w-10 h-5 rounded-full relative transition-colors
                                                                ${isVisible ? 'bg-primary-500' : 'bg-dark-600'}
                                                            `}>
                                                                <div className={`
                                                                    absolute top-1 w-3 h-3 rounded-full bg-white transition-all
                                                                    ${isVisible ? 'left-6' : 'left-1'}
                                                                `} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Role Features */}
                        <div className="card p-4">
                            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-emerald-400" />
                                Feature Toggles
                            </h2>
                            <RoleFeaturesTab />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Custom Module Modal */}
            <AnimatePresence>
                {showCustomModuleModal && (
                    <CustomModuleModal
                        onClose={() => setShowCustomModuleModal(false)}
                        onAdd={handleAddCustomModule}
                        existingModulesCount={(moduleConfigs[selectedRole]?.length || 0) + (customModules[selectedRole]?.length || 0)}
                    />
                )}
            </AnimatePresence>

            {/* Territories Tab */}
            {activeTab === 'territories' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6"
                >
                    {/* Provinces List */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-400" />
                                Provinces ({PROVINCES.length})
                            </h2>
                            <button className="btn-secondary text-sm flex items-center gap-1">
                                <Plus size={14} />
                                Add
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                                type="text"
                                placeholder="Search province..."
                                value={territorySearch}
                                onChange={(e) => setTerritorySearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm focus:border-primary-500 focus:outline-none"
                            />
                        </div>

                        {/* Province List */}
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                            {filteredProvinces.map(province => (
                                <button
                                    key={province.id}
                                    onClick={() => setSelectedProvince(province)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedProvince?.id === province.id
                                        ? 'bg-primary-500/20 border border-primary-500/30'
                                        : 'bg-dark-700/50 hover:bg-dark-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-dark-400 w-6">{province.id}</span>
                                        <span className="font-medium">{province.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-dark-400">
                                            {getCitiesByProvince(province.id).length} cities
                                        </span>
                                        <ChevronRight size={16} className="text-dark-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cities List */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-accent-400" />
                                {selectedProvince ? `Cities in ${selectedProvince.name}` : 'Select a Province'}
                            </h2>
                            {selectedProvince && (
                                <button className="btn-secondary text-sm flex items-center gap-1">
                                    <Plus size={14} />
                                    Add City
                                </button>
                            )}
                        </div>

                        {selectedProvince ? (
                            <div className="space-y-1 max-h-96 overflow-y-auto">
                                {provinceCities.length > 0 ? (
                                    provinceCities.map(city => (
                                        <div
                                            key={city.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-dark-400">{city.id}</span>
                                                <span>{city.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button className="p-1.5 rounded hover:bg-dark-600 text-dark-400 hover:text-blue-400">
                                                    <Pencil size={14} />
                                                </button>
                                                <button className="p-1.5 rounded hover:bg-dark-600 text-dark-400 hover:text-red-400">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-dark-400 text-center py-8">No cities found</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-dark-400">
                                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Select a province to view its cities</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Role Codes Tab */}
            {activeTab === 'roles' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 pt-6"
                >
                    {/* ID Format Explanation */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-400" />
                            SIP ID Format
                        </h2>
                        <div className="bg-dark-700 rounded-lg p-4 font-mono text-center mb-4">
                            <span className="text-2xl">
                                <span className="text-red-400">XX</span>
                                <span className="text-dark-400">.</span>
                                <span className="text-blue-400">XX</span>
                                <span className="text-green-400">XX</span>
                                <span className="text-dark-400">.</span>
                                <span className="text-amber-400">XXXX</span>
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                                <span className="text-red-400 font-medium">XX</span>
                                <p className="text-dark-400 text-xs mt-1">Role Code</p>
                            </div>
                            <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                                <span className="text-blue-400 font-medium">XX</span>
                                <p className="text-dark-400 text-xs mt-1">Province</p>
                            </div>
                            <div className="p-2 rounded bg-green-500/10 border border-green-500/30">
                                <span className="text-green-400 font-medium">XX</span>
                                <p className="text-dark-400 text-xs mt-1">City</p>
                            </div>
                            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                                <span className="text-amber-400 font-medium">XXXX</span>
                                <p className="text-dark-400 text-xs mt-1">Serial</p>
                            </div>
                        </div>
                        <p className="text-dark-400 text-sm mt-4">
                            Example: <code className="bg-dark-700 px-2 py-0.5 rounded">03.3174.0001</code> = Athlete from Jakarta Selatan, #1
                        </p>
                    </div>

                    {/* Role Codes Table */}
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-400" />
                            Role Codes
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-dark-700">
                                        <th className="text-left py-3 px-4 text-dark-400 font-medium">Code</th>
                                        <th className="text-left py-3 px-4 text-dark-400 font-medium">Role Name</th>
                                        <th className="text-left py-3 px-4 text-dark-400 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(ROLE_CODE_TO_NAME).map(([code, name]) => (
                                        <tr key={code} className="border-b border-dark-700/50 hover:bg-dark-700/30">
                                            <td className="py-3 px-4">
                                                <span className="font-mono bg-dark-700 px-2 py-1 rounded text-primary-400">{code}</span>
                                            </td>
                                            <td className="py-3 px-4 font-medium">{name}</td>
                                            <td className="py-3 px-4 text-dark-400">
                                                {code === '00' && 'System administrator with full access'}
                                                {code === '01' && 'National archery federation member'}
                                                {code === '02' && 'Archery club owner/manager'}
                                                {code === '03' && 'School or educational institution'}
                                                {code === '04' && 'Registered athlete/archer'}
                                                {code === '05' && 'Parent/guardian of athlete'}
                                                {code === '06' && 'Archery coach/trainer'}
                                                {code === '07' && 'Competition judge/referee'}
                                                {code === '08' && 'Event organizer'}
                                                {code === '09' && 'Equipment supplier/vendor'}
                                                {code === '99' && 'Guest/unregistered user'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card max-w-md w-full mx-4"
                    >
                        <h3 className="text-lg font-semibold mb-2">Reset to Defaults?</h3>
                        <p className="text-dark-400 mb-6">
                            This will reset all role permissions and UI settings to their default values.
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Reset All
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* System Modules Tab */}
            {activeTab === 'system-modules' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card mt-6"
                >
                    <SystemModuleListPage onEditModule={(code) => {
                        setSelectedFactoryModuleId(code);
                        setActiveTab('factory');
                    }} />
                </motion.div>
            )}


            {/* Factory Tab */}
            {activeTab === 'factory' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[calc(100vh-7.5rem)]"
                >
                    <SystemModulesFactoryPage initialAssemblyId={selectedFactoryModuleId} />
                </motion.div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-6"
                >
                    <EODashboard />
                </motion.div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit-logs' && (
                <AuditLogsTab />
            )}

            {/* Troubleshoot Tab */}
            {activeTab === 'troubleshoot' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-6"
                >
                    <TroubleshootTab />
                </motion.div>
            )}
        </div>
    );
}

