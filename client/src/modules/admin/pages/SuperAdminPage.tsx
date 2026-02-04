import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
    Shield, Users, Settings, RotateCcw, Check, X, Palette, LayoutGrid, Layout,
    LayoutDashboard, Target, Calendar, CheckSquare, DollarSign, BarChart3, FileText, User,
    MapPin, Search, ChevronRight, Plus, Pencil, Trash2, CreditCard, Building2, FolderOpen, Trophy,
    TrendingUp, UserPlus, History, CheckCircle, FileSearch, Bug, Columns, ClipboardList, Beaker, ShieldAlert
} from 'lucide-react';
import { usePermissions } from '../../core/contexts/PermissionsContext';
import {
    UserRole,
    ModuleName,
    ActionType,
    MODULE_LIST,
} from '../../core/types/permissions';
import { useLayoutTabs } from '../../core/hooks/useLayoutTabs';
import { PROVINCES, CITIES, getCitiesByProvince } from '../../core/types/territoryData';
import { Province, City, ROLE_CODES, ROLE_CODE_TO_NAME } from '../../core/types/territory';
import PageCoverageWidget from '../components/admin/widgets/PageCoverageWidget';
import UserAnalyticsChart from '../components/admin/widgets/UserAnalyticsChart';
import EventDashboardPage from '../../event/pages/EventDashboardPage';
import AuditLogsTab from '../components/admin/AuditLogsTab';
import TroubleshootTab from '../components/admin/TroubleshootTab';
import RoleRequestsAdminPage from './RoleRequestsAdminPage';
import SidebarMenuBuilder from '../components/admin/SidebarMenuBuilder';
import InnovationPanel from '../components/admin/InnovationPanel';
import RestorePage from './RestorePage';
import LayoutManagerTab from '../components/admin/LayoutManagerTab';

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

    const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'role-config' | 'sidebar' | 'territories' | 'roles' | 'assessment-builder' | 'factory' | 'events' | 'audit-logs' | 'troubleshoot' | 'role-requests' | 'restore' | 'layouts'>('overview');

    const defaultTabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'primary' },
        { id: 'role-requests', label: 'Requests', icon: UserPlus, color: 'orange' },
        { id: 'events', label: 'Events', icon: Trophy, color: 'purple' },

        { id: 'territories', label: 'Territory', icon: MapPin, color: 'teal' },
        { id: 'sidebar', label: 'Sidebar', icon: Columns, color: 'blue' },
        { id: 'roles', label: 'Codes', icon: LayoutGrid, color: 'indigo' },
        { id: 'audit-logs', label: 'Audit', icon: FileSearch, color: 'rose' },
        { id: 'troubleshoot', label: 'Debug', icon: Bug, color: 'pink' },
        { id: 'innovation', label: 'Labs', icon: Beaker, color: 'cyan' },
        { id: 'layouts', label: 'Layouts', icon: Layout, color: 'primary' },
        { id: 'restore', label: 'Restore', icon: RotateCcw, color: 'purple' },
    ];

    const { tabs } = useLayoutTabs('super_admin', defaultTabs);
    const [selectedRole, setSelectedRole] = useState<UserRole>('CLUB');
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Territories state
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [territorySearch, setTerritorySearch] = useState('');

    // UI Builder state


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

        // Architect Model: Prevent manual toggling of 'view' permission
        if (action === 'view') {
            toast.info('View permissions are automatically managed via the Sidebar Builder.');
            return;
        }

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
        setShowResetConfirm(false);
    };




    return (
        <div className="space-y-6 text-sm lg:text-base">
            {/* Header (Removed - handled by DashboardLayout) */}

            {/* Tab Navigation */}
            <div className="relative">
                <motion.div
                    className="sticky top-16 z-20 bg-dark-950/95 backdrop-blur-md border-b border-dark-700/50 mb-4 -mx-4 lg:-mx-6 px-4 lg:px-6 pb-2 overflow-x-auto"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                    }}
                >
                    <div className="flex flex-wrap gap-1 md:gap-2 py-1 min-w-max">
                        {tabs.map((tab: any) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const colorClass = tab.color === 'primary' ? 'primary' : tab.color;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    title={tab.label}
                                    className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${isActive
                                        ? `bg-${colorClass}-500/20 text-${colorClass}-400 border border-${colorClass}-500/30`
                                        : 'text-dark-400 hover:text-white hover:bg-dark-700/30'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="hidden xl:inline text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Restore Page Tab */}
            {activeTab === 'restore' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-4"
                >
                    <RestorePage />
                </motion.div>
            )}

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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

            {/* Role Requests Tab */}
            {activeTab === 'role-requests' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-4"
                >
                </motion.div>
            )}

            {/* Sidebar Builder Tab */}
            {activeTab === 'sidebar' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-4"
                >
                    <SidebarMenuBuilder />
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
                            CORE ID Format
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
                                        <th className="text-left py-3 px-4 text-sm font-medium text-dark-400">CORE ID</th>
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

            {/* Events Tab */}
            {activeTab === 'events' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-6"
                >
                    <EventDashboardPage />
                </motion.div>
            )}

            {/* Layouts Tab */}
            {activeTab === 'layouts' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-6"
                >
                    <LayoutManagerTab />
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

            {/* Innovation Labs Tab */}
            {activeTab === ('innovation' as any) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-6"
                >
                    <InnovationPanel />
                </motion.div>
            )}
        </div>
    );
}

