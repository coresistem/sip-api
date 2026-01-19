import { useState, useMemo, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { UserRole, ModuleName, MODULE_LIST, SidebarCategory } from '../../types/permissions';
import { getRoleUISettings } from '../../types/uiBuilder';
import { ROLE_OPTIONS } from '../../services/factory.service';
import {
    LayoutDashboard, Users, Crosshair, Calendar,
    ScanLine, Wallet, Package, BarChart3, User, LogOut,
    Menu, X, ChevronDown, FileBarChart, Shield, CreditCard, Target,
    Building2, FolderOpen, Star, Shirt, ShoppingBag, ClipboardList, Timer, Eye,
    GraduationCap, CheckCircle, Bell, FileSearch, History, Truck,
    Trophy, TrendingUp, UserPlus, FileText, Award, Plus, ChevronLeft, ChevronRight, Home, Settings
} from 'lucide-react';
import HexLogoFrame from '../ui/HexLogoFrame';

// Navigation items with module mapping
const NAV_ITEMS: { path: string; icon: typeof LayoutDashboard; label: string; module: ModuleName }[] = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard' },
    { path: '/athletes', icon: Users, label: 'Athletes', module: 'athletes' },
    { path: '/schedules', icon: Calendar, label: 'Schedules', module: 'schedules' },
    { path: '/scoring', icon: Crosshair, label: 'Scoring', module: 'scoring' },
    { path: '/training/schedule', icon: Calendar, label: 'Training Schedule', module: 'athlete_training_schedule' },
    { path: '/guidance', icon: Shield, label: 'Archery Guidance', module: 'athlete_archery_guidance' },
    { path: '/training/bleep-test', icon: Timer, label: 'Bleep Test', module: 'bleep_test' },
    { path: '/attendance', icon: ScanLine, label: 'Attendance', module: 'attendance' },
    { path: '/finance', icon: Wallet, label: 'Finance', module: 'finance' },
    { path: '/inventory', icon: Package, label: 'Inventory', module: 'inventory' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', module: 'analytics' },
    { path: '/reports', icon: FileBarChart, label: 'Reports', module: 'reports' },
    { path: '/digitalcard', icon: CreditCard, label: 'Digital ID Card', module: 'digitalcard' },
    { path: '/archerconfig', icon: Target, label: 'Archer Config', module: 'archerconfig' },
    { path: '/organization', icon: Building2, label: 'Organization', module: 'organization' },
    { path: '/manpower', icon: Users, label: 'Manpower', module: 'manpower' },
    { path: '/filemanager', icon: FolderOpen, label: 'File Manager', module: 'filemanager' },
    { path: '/perpani', icon: Building2, label: 'Perpani Management', module: 'perpani_management' },
    { path: '/schools', icon: GraduationCap, label: 'Schools', module: 'schools' },

    { path: '/quality-control', icon: CheckCircle, label: 'Quality Control', module: 'quality_control' },
    { path: '/notifications', icon: Bell, label: 'Notifications', module: 'notifications' },
    { path: '/audit-logs', icon: FileSearch, label: 'Audit Logs', module: 'audit_logs' },
    { path: '/history', icon: History, label: 'History', module: 'history' },
    { path: '/shipping', icon: Truck, label: 'Shipping', module: 'shipping' },
    { path: '/achievements', icon: Trophy, label: 'Achievements', module: 'achievements' },
    { path: '/progress', icon: TrendingUp, label: 'Progress Charts', module: 'progress' },
    { path: '/coach-analytics', icon: BarChart3, label: 'Team Analytics', module: 'coach_analytics' },
    { path: '/member-approval', icon: UserPlus, label: 'Member Approval', module: 'member_approval' },
    { path: '/invoicing', icon: FileText, label: 'Invoicing', module: 'invoicing' },
    { path: '/payments', icon: CreditCard, label: 'Payments', module: 'payments' },
    { path: '/o2sn-registration', icon: Trophy, label: 'O2SN Registration', module: 'o2sn_registration' },
    { path: '/club-approval', icon: Building2, label: 'Club Approval', module: 'club_approval' },
    { path: '/licensing', icon: Award, label: 'Licensing', module: 'licensing' },
    { path: '/event-create', icon: Plus, label: 'Create Event', module: 'event_creation' },
    { path: '/enhanced-reports', icon: FileBarChart, label: 'Enhanced Reports', module: 'enhanced_reports' },
    { path: '/attendance-history', icon: Calendar, label: 'Attendance History', module: 'attendance_history' },
    { path: '/event-registration', icon: Users, label: 'Registrations', module: 'event_registration' },
    { path: '/event-results', icon: Trophy, label: 'Results', module: 'event_results' },
    { path: '/score-validation', icon: Target, label: 'Score Validation', module: 'score_validation' },
    { path: '/events', icon: Calendar, label: 'Events', module: 'events' },
    { path: '/admin', icon: Shield, label: 'Admin Panel', module: 'admin' },
];


import axios from 'axios';

export default function DashboardLayout() {
    const { user, logout, simulatedRole, setSimulatedRole, originalUser, setSimulatedSipId, simulatedSipId } = useAuth();
    const { hasPermission, getUISettings, getEffectiveSidebar } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();

    // Desktop Sidebar: simple show/hide
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [jerseyMenuOpen, setJerseyMenuOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        general: true,
        role_specific: true,
        admin_only: true,
    });

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef<any>(null);

    // Navbar Shortcuts State (stored in localStorage)
    const [navbarShortcuts, setNavbarShortcuts] = useState<{ slot2: string | null; slot4: string | null }>(() => {
        const saved = localStorage.getItem('navbar_shortcuts');
        return saved ? JSON.parse(saved) : { slot2: null, slot4: null };
    });

    // Persist navbar shortcuts
    useEffect(() => {
        localStorage.setItem('navbar_shortcuts', JSON.stringify(navbarShortcuts));
    }, [navbarShortcuts]);

    // Listen for storage changes (from SettingsPage) to sync instantly
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'navbar_shortcuts' && e.newValue) {
                setNavbarShortcuts(JSON.parse(e.newValue));
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Also poll for changes (for same-tab updates)
        const interval = setInterval(() => {
            const saved = localStorage.getItem('navbar_shortcuts');
            if (saved) {
                const parsed = JSON.parse(saved);
                setNavbarShortcuts(prev =>
                    (prev.slot2 !== parsed.slot2 || prev.slot4 !== parsed.slot4)
                        ? parsed
                        : prev
                );
            }
        }, 500);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Shortcut options for navbar (available features)
    const SHORTCUT_OPTIONS = [
        { id: 'digitalcard', label: 'ID Card', icon: CreditCard, path: '/digitalcard' },
        { id: 'scoring', label: 'Scoring', icon: Crosshair, path: '/scoring' },
        { id: 'athletes', label: 'Athletes', icon: Users, path: '/athletes' },
        { id: 'schedules', label: 'Schedules', icon: Calendar, path: '/schedules' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    ];

    const userRole = (simulatedRole || user?.role || 'ATHLETE') as UserRole;
    const isSimulating = !!simulatedRole;
    const uiSettings = getUISettings(userRole);

    // Get UI Builder settings for this role
    const uiBuilderSettings = useMemo(() => getRoleUISettings(userRole), [userRole]);

    // Filter nav items based on permissions, UI settings, and UI Builder visibility
    const navItems = useMemo(() => {
        // Get effective sidebar considering hierarchical permissions (SuperAdmin > Club > Member)
        const clubId = user?.clubId || undefined;
        const effectiveModules = getEffectiveSidebar(userRole, clubId);

        return NAV_ITEMS.filter(item => {
            const hasAccess = hasPermission(userRole, item.module, 'view');
            const isInSidebar = effectiveModules.includes(item.module);

            return hasAccess && isInSidebar;
        });
    }, [userRole, user?.clubId, getEffectiveSidebar, hasPermission]);

    // Group nav items by category
    const groupedNavItems = useMemo(() => {
        const groups: Record<SidebarCategory, typeof NAV_ITEMS> = {
            general: [],
            role_specific: [],
            admin_only: []
        };

        navItems.forEach(item => {
            const metadata = MODULE_LIST.find(m => m.name === item.module);
            const category = metadata?.category || 'role_specific';
            if (groups[category]) {
                groups[category].push(item);
            }
        });

        return groups;
    }, [navItems]);

    // Get visible custom modules
    const customModules = useMemo(() => {
        if (!uiBuilderSettings) return [];
        return uiBuilderSettings.customModules.filter(m => m.visible);
    }, [uiBuilderSettings]);

    // Add Admin item for Super Admin (real role check, not simulated)
    const isAdmin = (originalUser || user)?.role === 'SUPER_ADMIN';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex" >
            <motion.aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40
                    bg-dark-900 border-r border-dark-800 transition-all duration-300
                    ${sidebarOpen ? 'w-64' : 'w-0 border-r-0'}
                `}
            >
                {/* Sidebar Toggle Tab (Desktop) */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`
                        absolute -right-5 top-24 h-12 w-5
                        bg-dark-800 border-y border-r border-dark-600
                        rounded-r-md flex items-center justify-center
                        text-primary-500 hover:text-primary-400 hover:bg-dark-700
                        transition-all z-50 shadow-md cursor-pointer
                    `}
                    title={sidebarOpen ? 'Hide Sidebar' : 'Open Sidebar'}
                >
                    <div className="flex items-center justify-center">
                        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </div>
                </button>

                {/* Sidebar Content */}
                <div className={`flex flex-col h-full w-full overflow-hidden ${!sidebarOpen ? 'invisible' : 'visible'}`}>
                    {/* Brand Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-dark-800 shrink-0">
                        <HexLogoFrame size={32} />
                        <span className="ml-3 font-bold text-xl tracking-tight text-white truncate">
                            SIP <span className="text-primary-500">System</span>
                        </span>
                    </div>


                    {/* Simulation Indicator - Sticky Top */}
                    {isSimulating && sidebarOpen && (
                        <div className="px-3 py-2 border-b border-dark-700/50 bg-amber-500/10">
                            <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer group">
                                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-dark-900 font-bold group-hover:scale-105 transition-transform">
                                    <Eye size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Viewing As</p>
                                    <p className="text-sm font-bold text-white truncate">{userRole.replace('_', ' ')}</p>
                                </div>
                            </NavLink>
                        </div>
                    )}

                    {/* Navigation - Scrollable */}
                    <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                        {/* --- General --- */}
                        {groupedNavItems.general.length > 0 && (
                            <div className="mb-1">
                                {sidebarOpen && groupedNavItems.role_specific.length > 0 && (
                                    <button
                                        onClick={() => setExpandedSections(prev => ({ ...prev, general: !prev.general }))}
                                        className="w-full flex items-center justify-between pt-3 pb-1 px-2 text-xs font-medium text-dark-500 uppercase tracking-wider hover:text-dark-400 transition-colors"
                                    >
                                        <span>General</span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform ${expandedSections.general ? '' : '-rotate-90'}`}
                                        />
                                    </button>
                                )}
                                {(expandedSections.general || !sidebarOpen) && groupedNavItems.general.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/'}
                                        className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                        ${isActive
                                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                        ${!sidebarOpen ? 'justify-center' : ''}
                        `}
                                        title={!sidebarOpen ? item.label : undefined}
                                    >
                                        <item.icon size={18} />
                                        {sidebarOpen && <span className="font-medium">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        )}

                        {/* --- Role Features --- */}
                        {groupedNavItems.role_specific.length > 0 && (
                            <div className="mb-1">
                                {sidebarOpen && (
                                    <button
                                        onClick={() => setExpandedSections(prev => ({ ...prev, role_specific: !prev.role_specific }))}
                                        className="w-full flex items-center justify-between pt-3 pb-1 px-2 text-xs font-medium text-dark-500 uppercase tracking-wider hover:text-dark-400 transition-colors"
                                    >
                                        <span>Role Features</span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform ${expandedSections.role_specific ? '' : '-rotate-90'}`}
                                        />
                                    </button>
                                )}
                                {(expandedSections.role_specific || !sidebarOpen) && groupedNavItems.role_specific.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                        ${isActive
                                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                        ${!sidebarOpen ? 'justify-center' : ''}
                        `}
                                        title={!sidebarOpen ? item.label : undefined}
                                    >
                                        <item.icon size={18} />
                                        {sidebarOpen && <span className="font-medium">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        )}

                        {/* --- Admin Only --- */}
                        {groupedNavItems.admin_only.length > 0 && (
                            <div className="mb-1">
                                {sidebarOpen && (
                                    <button
                                        onClick={() => setExpandedSections(prev => ({ ...prev, admin_only: !prev.admin_only }))}
                                        className="w-full flex items-center justify-between pt-3 pb-1 px-2 text-xs font-medium text-red-500/70 uppercase tracking-wider hover:text-red-400 transition-colors"
                                    >
                                        <span>Admin</span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform ${expandedSections.admin_only ? '' : '-rotate-90'}`}
                                        />
                                    </button>
                                )}
                                {(expandedSections.admin_only || !sidebarOpen) && groupedNavItems.admin_only.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                        ${isActive
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                        ${!sidebarOpen ? 'justify-center' : ''}
                        `}
                                        title={!sidebarOpen ? item.label : undefined}
                                    >
                                        <item.icon size={18} />
                                        {sidebarOpen && <span className="font-medium">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        )}

                        {/* Custom Modules from UI Builder */}
                        {customModules.length > 0 && (
                            <>
                                {sidebarOpen && (
                                    <div className="pt-3 pb-1 px-2">
                                        <span className="text-xs font-medium text-dark-500 uppercase tracking-wider">Custom</span>
                                    </div>
                                )}
                                {customModules.map((module) => (
                                    <NavLink
                                        key={module.id}
                                        to={`/custom/${module.name}`}
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                                        title={!sidebarOpen ? module.label : undefined}
                                    >
                                        <Star size={20} />
                                        {sidebarOpen && <span className="font-medium">{module.label}</span>}
                                    </NavLink>
                                ))}
                            </>
                        )}

                        {/* Removed Hardcoded Athlete Preview - Now Handled by Role Features Group */}

                        {/* Jersey System - Conditional based on 'jersey' module */}
                        {uiSettings.sidebarModules.includes('jersey') && (
                            <>
                                {sidebarOpen && (
                                    <button
                                        onClick={() => setJerseyMenuOpen(!jerseyMenuOpen)}
                                        className="w-full flex items-center justify-between pt-3 pb-1 px-2 group cursor-pointer"
                                    >
                                        <span className="text-xs font-medium text-dark-500 uppercase tracking-wider group-hover:text-primary-400 transition-colors">Jersey System</span>
                                        <ChevronDown
                                            size={14}
                                            className={`text-dark-500 transition-transform duration-200 ${jerseyMenuOpen ? '' : '-rotate-90'}`}
                                        />
                                    </button>
                                )}

                                {/* Collapsible Content */}
                                <div className={`${!jerseyMenuOpen && sidebarOpen ? 'hidden' : 'block'}`}>
                                    <NavLink
                                        to="/jersey/admin"
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                                        title={!sidebarOpen ? 'Dashboard' : undefined}
                                    >
                                        <LayoutDashboard size={20} />
                                        {sidebarOpen && <span className="font-medium">Dashboard</span>}
                                    </NavLink>
                                    <NavLink
                                        to="/supplier/orders"
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                                        title={!sidebarOpen ? 'Orders' : undefined}
                                    >
                                        <ClipboardList size={20} />
                                        {sidebarOpen && <span className="font-medium">Orders & Production</span>}
                                    </NavLink>
                                    <NavLink
                                        to="/jersey/admin/production"
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                                        title={!sidebarOpen ? 'Timeline' : undefined}
                                    >
                                        <Timer size={20} />
                                        {sidebarOpen && <span className="font-medium">Timeline Monitor</span>}
                                    </NavLink>
                                    <NavLink
                                        to="/supplier/products"
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                                        title={!sidebarOpen ? 'Products' : undefined}
                                    >
                                        <Shirt size={20} />
                                        {sidebarOpen && <span className="font-medium">Products</span>}
                                    </NavLink>
                                    <NavLink
                                        to="/jersey/admin/manpower"
                                        className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                                        title={!sidebarOpen ? 'Staff' : undefined}
                                    >
                                        <Users size={20} />
                                        {sidebarOpen && <span className="font-medium">My Staff</span>}
                                    </NavLink>

                                    {isAdmin && (
                                        <>
                                            <div className="my-2 border-t border-dark-700/50 mx-2" />
                                            <NavLink
                                                to="/jersey/manpower/station"
                                                className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                          ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-dark-400 hover:text-white'}
                          ${!sidebarOpen ? 'justify-center' : ''}
                        `}
                                                title={!sidebarOpen ? 'Manpower Station' : undefined}
                                            >
                                                <Target size={20} />
                                                {sidebarOpen && <span className="font-medium">Manpower Station (View)</span>}
                                            </NavLink>
                                            <NavLink
                                                to="/jersey/catalog"
                                                className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                          ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-dark-400 hover:text-white'}
                          ${!sidebarOpen ? 'justify-center' : ''}
                        `}
                                                title={!sidebarOpen ? 'Public Catalog' : undefined}
                                            >
                                                <ShoppingBag size={20} />
                                                {sidebarOpen && <span className="font-medium">Public Catalog (View)</span>}
                                            </NavLink>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Jersey Catalog - All users except Supplier-only */}
                        {userRole !== 'SUPPLIER' && (
                            <>
                                {sidebarOpen && (
                                    <div className="pt-3 pb-1 px-2">
                                        <span className="text-xs font-medium text-dark-500 uppercase tracking-wider">Jersey Shop</span>
                                    </div>
                                )}
                                <NavLink
                                    to="/jersey-catalog"
                                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                                    title={!sidebarOpen ? 'Jersey Catalog' : undefined}
                                >
                                    <Shirt size={20} />
                                    {sidebarOpen && <span className="font-medium">Jersey Catalog</span>}
                                </NavLink>
                                <NavLink
                                    to="/my-orders"
                                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                                    title={!sidebarOpen ? 'My Orders' : undefined}
                                >
                                    <ShoppingBag size={20} />
                                    {sidebarOpen && <span className="font-medium">My Orders</span>}
                                </NavLink>
                            </>
                        )}
                    </nav>

                    {/* User Role & Logout Section - Bottom of Sidebar */}
                    < div className="p-3 border-t border-dark-700/50 space-y-2" >
                        {/* Role & User ID - with Role Switcher for multi-role users */}
                        {
                            sidebarOpen ? (
                                <div className="px-3 py-2 rounded-lg bg-dark-800/50" >
                                    <p className="text-sm font-medium text-primary-400">{userRole.replace('_', ' ')}</p>
                                    <p className="text-[11px] text-dark-400 mt-0.5 font-mono">{user?.sipId || 'Not generated'}</p>
                                    {/* Add Role Link */}
                                    <NavLink
                                        to="/add-role"
                                        className="mt-2 flex items-center gap-1.5 text-xs text-dark-400 hover:text-primary-400 transition-colors"
                                    >
                                        <Plus size={12} />
                                        <span>Ajukan Peran Baru</span>
                                    </NavLink>
                                    {/* Club Panel Link - Only for Club/Club Owner */}
                                    {(userRole === 'CLUB' || userRole === 'CLUB_OWNER') && (
                                        <NavLink
                                            to="/club/permissions"
                                            className="mt-1 flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                                        >
                                            <Shield size={12} />
                                            <span>Club Panel</span>
                                        </NavLink>
                                    )}
                                </div>
                            ) : (
                                <div className="flex justify-center" title={userRole.replace('_', ' ')}>
                                    <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs font-bold">
                                        {userRole.charAt(0)}
                                    </span>
                                </div>
                            )}


                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${sidebarOpen ? '' : 'justify-center'}`}
                            title={!sidebarOpen ? 'Logout' : undefined}
                        >
                            <LogOut size={20} />
                            {sidebarOpen && <span className="font-medium">Logout</span>}
                        </button>


                    </div>
                </div >
            </motion.aside >

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {
                    mobileMenuOpen && (
                        <motion.div
                            className="lg:hidden fixed inset-0 z-50 bg-dark-950/98 backdrop-blur-md flex flex-col"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            {/* Close Button Header */}
                            <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800">
                                <div className="flex items-center gap-3">
                                    <HexLogoFrame size={28} />
                                    <span className="font-bold text-lg text-white">Menu</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar pb-24">
                                {/* --- General --- */}
                                {groupedNavItems.general.length > 0 && (
                                    <div className="mb-2">
                                        <button
                                            onClick={() => setExpandedSections(prev => ({ ...prev, general: !prev.general }))}
                                            className="w-full flex items-center justify-between py-2 px-1 text-xs font-medium text-dark-500 uppercase tracking-wider"
                                        >
                                            <span>General</span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform ${expandedSections.general ? '' : '-rotate-90'}`}
                                            />
                                        </button>
                                        {expandedSections.general && groupedNavItems.general.map((item) => (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                end={item.path === '/'}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
                                                    ${isActive ? 'bg-primary-500/20 text-primary-400' : 'text-dark-300 bg-dark-800/30'}
                                                `}
                                            >
                                                <item.icon size={20} />
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}

                                {/* --- Role Features --- */}
                                {groupedNavItems.role_specific.length > 0 && (
                                    <div className="mb-2">
                                        <button
                                            onClick={() => setExpandedSections(prev => ({ ...prev, role_specific: !prev.role_specific }))}
                                            className="w-full flex items-center justify-between py-2 px-1 text-xs font-medium text-dark-500 uppercase tracking-wider"
                                        >
                                            <span>Role Features</span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform ${expandedSections.role_specific ? '' : '-rotate-90'}`}
                                            />
                                        </button>
                                        {expandedSections.role_specific && groupedNavItems.role_specific.map((item) => (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
                                                    ${isActive ? 'bg-primary-500/20 text-primary-400' : 'text-dark-300 bg-dark-800/30'}
                                                `}
                                            >
                                                <item.icon size={20} />
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}

                                {/* --- Admin Only --- */}
                                {groupedNavItems.admin_only.length > 0 && (
                                    <div className="mb-2">
                                        <button
                                            onClick={() => setExpandedSections(prev => ({ ...prev, admin_only: !prev.admin_only }))}
                                            className="w-full flex items-center justify-between py-2 px-1 text-xs font-medium text-red-500/70 uppercase tracking-wider"
                                        >
                                            <span>Admin</span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform ${expandedSections.admin_only ? '' : '-rotate-90'}`}
                                            />
                                        </button>
                                        {expandedSections.admin_only && groupedNavItems.admin_only.map((item) => (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={({ isActive }) => `
                                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
                                                    ${isActive ? 'bg-red-500/20 text-red-400' : 'text-dark-300 bg-dark-800/30'}
                                                `}
                                            >
                                                <item.icon size={20} />
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}

                                {/* Custom Modules */}
                                {customModules.length > 0 && customModules.map((module) => (
                                    <NavLink
                                        key={module.id}
                                        to={`/custom/${module.name}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
                                            ${isActive ? 'bg-amber-500/20 text-amber-400' : 'text-dark-300 bg-dark-800/30'}
                                        `}
                                    >
                                        <Star size={20} />
                                        <span className="font-medium text-sm">{module.label}</span>
                                    </NavLink>
                                ))}

                                {/* View As Mode - Super Admin Only (Mobile) */}
                                {isAdmin && (
                                    <>
                                        <div className="pt-3 pb-1 px-4">
                                            <span className="text-xs font-medium text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                                <Eye size={14} />
                                                View As
                                            </span>
                                        </div>
                                        <div className="px-4 pb-2">
                                            <select
                                                value={simulatedRole || ''}
                                                onChange={(e) => {
                                                    const role = e.target.value as any;
                                                    if (role) {
                                                        setSimulatedRole(role);
                                                        setSimulatedSipId(null);
                                                        setMobileMenuOpen(false);
                                                        navigate('/profile');
                                                    }
                                                }}
                                                className="w-full bg-dark-800 border border-dark-600 text-sm text-white rounded-lg px-3 py-2.5"
                                            >
                                                <option value="" disabled>Select Role</option>
                                                <option value={user?.role}>Reset (Me)</option>
                                                <option disabled>──────────</option>
                                                {ROLE_OPTIONS.filter(r => r.value !== 'SUPER_ADMIN').map(r => (
                                                    <option key={r.value} value={r.value}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {(simulatedRole || simulatedSipId) && (
                                            <button
                                                onClick={() => {
                                                    setSimulatedRole(null);
                                                    setSimulatedSipId(null);
                                                    setMobileMenuOpen(false);
                                                    navigate('/profile');
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 mx-4 mb-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30"
                                            >
                                                <LogOut size={18} />
                                                <span className="font-medium">Exit View As</span>
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Admin Panel - Super Admin Only */}
                                {isAdmin && (
                                    <NavLink
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-red-500/20 text-red-400' : 'text-red-400/70'}
                  `}
                                    >
                                        <Shield size={22} />
                                        <span className="font-medium">Admin Panel</span>
                                    </NavLink>
                                )}

                                {/* Club Panel - Mobile */}
                                {(userRole === 'CLUB' || userRole === 'CLUB_OWNER') && (
                                    <NavLink
                                        to="/club/permissions"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
                                            ${isActive ? 'bg-orange-500/20 text-orange-400' : 'text-orange-400/70 bg-orange-500/5'}
                                        `}
                                    >
                                        <Shield size={22} />
                                        <span className="font-medium">Club Panel</span>
                                    </NavLink>
                                )}

                                {/* Jersey Order - Supplier */}
                                {(user?.role === 'SUPPLIER' || user?.role === 'SUPER_ADMIN') && (
                                    <>
                                        <div className="pt-3 pb-1 px-4">
                                            <span className="text-xs font-medium text-dark-500 uppercase tracking-wider">Supplier</span>
                                        </div>
                                        <NavLink
                                            to="/supplier/products"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-dark-300'}
                  `}
                                        >
                                            <Shirt size={22} />
                                            <span className="font-medium">My Products</span>
                                        </NavLink>
                                        <NavLink
                                            to="/supplier/orders"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-dark-300'}
                  `}
                                        >
                                            <ClipboardList size={22} />
                                            <span className="font-medium">Supplier Orders</span>
                                        </NavLink>
                                    </>
                                )}

                                {/* Jersey Catalog - Customers */}
                                {user?.role !== 'SUPPLIER' && (
                                    <>
                                        <div className="pt-3 pb-1 px-4">
                                            <span className="text-xs font-medium text-dark-500 uppercase tracking-wider">Jersey Shop</span>
                                        </div>
                                        <NavLink
                                            to="/jersey-catalog"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-violet-500/20 text-violet-400' : 'text-dark-300'}
                  `}
                                        >
                                            <Shirt size={22} />
                                            <span className="font-medium">Jersey Catalog</span>
                                        </NavLink>
                                        <NavLink
                                            to="/my-orders"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-violet-500/20 text-violet-400' : 'text-dark-300'}
                  `}
                                        >
                                            <ShoppingBag size={22} />
                                            <span className="font-medium">My Orders</span>
                                        </NavLink>
                                    </>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 w-full text-red-400"
                                >
                                    <LogOut size={22} />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </nav>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Main Content */}
            < main className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} transition-all duration-300 pb-20 lg:pb-0`
            }>
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-dark-900/80 backdrop-blur-md border-b border-dark-800 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <HexLogoFrame size={28} />
                        <span className="font-bold text-lg text-white">SIP System</span>
                    </div>

                    {/* Top Right: Profile + Logout */}
                    <div className="flex items-center gap-3">
                        {/* Profile Avatar */}
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center justify-center rounded-lg active:scale-95 transition-transform cursor-pointer z-50"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-primary-500/30 pointer-events-none">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <span className="text-primary-400 font-bold text-xs">{user?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                                )}
                            </div>
                        </button>

                        {/* Logout / Exit View As */}
                        {(simulatedRole || simulatedSipId) ? (
                            <button
                                onClick={() => {
                                    setSimulatedRole(null);
                                    setSimulatedSipId(null);
                                    navigate('/profile');
                                }}
                                className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30 active:scale-95 transition-transform"
                                title="Exit View As"
                            >
                                <Eye size={16} className="text-amber-400" />
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 active:scale-95 transition-transform"
                                title="Logout"
                            >
                                <LogOut size={16} className="text-red-400" />
                            </button>
                        )}
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-md sticky top-0 z-30" >
                    {/* Left - Club Identity & Title (visible when sidebar collapsed) */}
                    < div className="flex items-center gap-4" >
                        {!sidebarOpen && (
                            <div className="flex items-center gap-3 pr-4 border-r border-dark-700/50">
                                <HexLogoFrame size={32} />
                                <div>
                                    <p className="font-display font-bold text-sm gradient-text">Csystem</p>
                                    <p className="text-[9px] text-dark-400">Sistem Integrasi Panahan</p>
                                </div>
                            </div>
                        )}
                        {/* Conditional Header Content */}
                        {
                            location.pathname.startsWith('/admin') ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                                        <Shield className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-sm font-bold text-white">Admin Panel</h1>
                                        <p className="text-[10px] text-slate-400">Manage role permissions and UI settings</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-primary-500/30">
                                        <span className="text-primary-400 font-bold text-xs">{user?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{user?.name || 'User'}</p>
                                        <p className="text-[10px] text-dark-400">{userRole.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            )
                        }

                        {/* Super Admin - View As Controls in Header */}
                        {
                            isAdmin && (
                                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-dark-700/50">
                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden xl:block">View As:</span>

                                    {/* Role Dropdown */}
                                    <select
                                        value={simulatedRole || ''}
                                        onChange={(e) => {
                                            const role = e.target.value as any;
                                            if (role) {
                                                setSimulatedRole(role);
                                                setSimulatedSipId(null);
                                                navigate('/profile');
                                            }
                                        }}
                                        className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary-500 min-w-[120px]"
                                    >
                                        <option value="" disabled>Select Role</option>
                                        <option value={user?.role}>Reset (Me)</option>
                                        <option disabled>──────────</option>
                                        {ROLE_OPTIONS.filter(r => r.value !== 'SUPER_ADMIN').map(r => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* SIP ID Search with Autocomplete */}
                                    <div className="flex items-center gap-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Enter SIP ID or Name..."
                                            className="w-24 xl:w-40 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary-500"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSearchTerm(val);

                                                // Show dropdown if previously had results and user is typing
                                                if (val.trim().length >= 2 && searchResults.length > 0) {
                                                    setShowResults(true);
                                                }

                                                if (searchTimeoutRef.current) {
                                                    clearTimeout(searchTimeoutRef.current);
                                                }

                                                if (val.trim().length < 2) {
                                                    setSearchResults([]);
                                                    setShowResults(false);
                                                    return;
                                                }

                                                searchTimeoutRef.current = setTimeout(async () => {
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const res = await axios.get(`http://localhost:5000/api/v1/auth/search-users?query=${encodeURIComponent(val.trim())}`, {
                                                            headers: { Authorization: `Bearer ${token}` }
                                                        });
                                                        if (res.data.success) {
                                                            setSearchResults(res.data.data);
                                                            if (res.data.data.length > 0) {
                                                                setShowResults(true);
                                                            }
                                                        }
                                                    } catch (err) {
                                                        console.error('Search error', err);
                                                    }
                                                }, 300);
                                            }}
                                            onFocus={() => {
                                                if (searchTerm.length >= 2 && searchResults.length > 0) {
                                                    setShowResults(true);
                                                }
                                            }}
                                            onBlur={() => {
                                                // Delay hiding to allow click event on dropdown
                                                setTimeout(() => setShowResults(false), 200);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    if (searchTerm.trim()) {
                                                        setSimulatedRole(null);
                                                        setSimulatedSipId(searchTerm.trim());
                                                        navigate('/profile');
                                                        setShowResults(false);
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            className="bg-primary-500/20 text-primary-400 p-1.5 rounded hover:bg-primary-500/30 transition-colors"
                                            title="Search by SIP ID"
                                            onClick={() => {
                                                if (searchTerm.trim()) {
                                                    setSimulatedRole(null);
                                                    setSimulatedSipId(searchTerm.trim());
                                                    navigate('/profile');
                                                    setShowResults(false);
                                                }
                                            }}
                                        >
                                            <Eye size={14} />
                                        </button>

                                        {/* Search Results Dropdown */}
                                        <AnimatePresence>
                                            {showResults && searchResults.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full right-0 mt-2 w-64 bg-slate-950 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 divide-y divide-slate-800"
                                                >
                                                    {searchResults.map((result) => (
                                                        <div
                                                            key={result.sipId}
                                                            className="px-3 py-2 hover:bg-slate-900 cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                setSearchTerm(result.sipId);
                                                                setSimulatedRole(null);
                                                                setSimulatedSipId(result.sipId);
                                                                navigate('/profile');
                                                                setShowResults(false);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-700">
                                                                    {result.avatarUrl ? (
                                                                        <img src={result.avatarUrl} alt={result.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-xs text-slate-400 font-bold">{result.name?.substring(0, 1)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs text-slate-200 font-medium truncate">{result.name}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <p className="text-[10px] text-primary-400 font-mono bg-primary-500/10 px-1 rounded">{result.sipId}</p>
                                                                        <span className="text-[9px] text-slate-500 uppercase">{result.role?.replace('_', ' ')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Exit Simulation Button */}
                                    {(simulatedRole || isSimulating || (user?.role === 'SUPER_ADMIN' && location.pathname === '/profile' && (simulatedRole || !!simulatedSipId))) && (simulatedRole || simulatedSipId) && (
                                        <button
                                            onClick={() => {
                                                setSimulatedRole(null);
                                                setSimulatedSipId(null);
                                                // Optionally navigate back to dashboard or stay on profile showing super admin data
                                                navigate('/profile');
                                            }}
                                            className="flex items-center gap-1 px-2 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 text-[10px] font-medium transition-colors cursor-pointer"
                                            title="Exit View As Mode"
                                        >
                                            <LogOut size={12} />
                                            <span>Exit</span>
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    </div >

                    {/* User Menu */}
                    < div className="relative" >
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-800/50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{user?.name}</span>
                            <ChevronDown size={16} className="text-dark-400" />
                        </button>

                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    className="absolute right-0 mt-2 w-48 py-2 rounded-xl glass-strong shadow-lg"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <NavLink
                                        to="/profile"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700/50"
                                    >
                                        <User size={16} />
                                        Profile
                                    </NavLink>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 w-full text-sm text-red-400 hover:bg-dark-700/50"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div >
                </header >

                {/* Page Content */}
                < div className={`transition-all duration-300 ${location.pathname.startsWith('/admin') ? 'pt-0' : 'p-4 lg:p-6 pt-20 lg:pt-6'}`} >
                    <Outlet />
                </div >
            </main >

            {/* Mobile Bottom Navigation (Dynamic 3-5 slots) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-900/90 backdrop-blur-xl border-t border-dark-800 flex items-center justify-around z-40 pb-safe">
                {/* Slot 1: Menu (Fixed) */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className={`
                        flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
                        ${mobileMenuOpen ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'}
                    `}
                >
                    <Menu size={20} />
                    <span className="text-[10px] font-medium">Menu</span>
                </button>

                {/* Slot 2: Shortcut 1 (Optional) */}
                {navbarShortcuts.slot2 && (() => {
                    const shortcut = SHORTCUT_OPTIONS.find(s => s.id === navbarShortcuts.slot2);
                    if (!shortcut) return null;
                    const ShortcutIcon = shortcut.icon;
                    return (
                        <NavLink
                            to={shortcut.path}
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
                                ${isActive ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'}
                            `}
                        >
                            <ShortcutIcon size={20} />
                            <span className="text-[10px] font-medium">{shortcut.label}</span>
                        </NavLink>
                    );
                })()}

                {/* Slot 3: Home (Fixed - Center) */}
                <NavLink
                    to="/"
                    className={({ isActive }) => `
                        flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
                        ${isActive ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'}
                    `}
                >
                    <Home size={20} />
                    <span className="text-[10px] font-medium">Home</span>
                </NavLink>

                {/* Slot 4: Shortcut 2 (Optional) */}
                {navbarShortcuts.slot4 && (() => {
                    const shortcut = SHORTCUT_OPTIONS.find(s => s.id === navbarShortcuts.slot4);
                    if (!shortcut) return null;
                    const ShortcutIcon = shortcut.icon;
                    return (
                        <NavLink
                            to={shortcut.path}
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
                                ${isActive ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'}
                            `}
                        >
                            <ShortcutIcon size={20} />
                            <span className="text-[10px] font-medium">{shortcut.label}</span>
                        </NavLink>
                    );
                })()}

                {/* Slot 5: Settings (Fixed) */}
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
                        flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
                        ${isActive ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'}
                    `}
                >
                    <Settings size={20} />
                    <span className="text-[10px] font-medium">Settings</span>
                </NavLink>
            </div>
        </div >
    );
}
