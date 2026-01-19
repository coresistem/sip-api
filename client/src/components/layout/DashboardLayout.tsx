import { useState, useMemo, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { UserRole, ModuleName } from '../../types/permissions';
import { getRoleUISettings } from '../../types/uiBuilder';
import { ROLE_OPTIONS } from '../../services/factory.service';
import {
    LayoutDashboard, Users, Crosshair, Calendar,
    ScanLine, Wallet, Package, BarChart3, User, LogOut,
    Menu, X, ChevronDown, FileBarChart, Shield, CreditCard, Target,
    Building2, FolderOpen, Star, Shirt, ShoppingBag, ClipboardList, Timer, Eye,
    GraduationCap, CheckCircle, Bell, FileSearch, History, Truck,
    Trophy, TrendingUp, UserPlus, FileText, Award, Plus
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
];


import axios from 'axios';

export default function DashboardLayout() {
    const { user, logout, simulatedRole, setSimulatedRole, originalUser, setSimulatedSipId, simulatedSipId } = useAuth();
    const { hasPermission, getUISettings } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [jerseyMenuOpen, setJerseyMenuOpen] = useState(true);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef<any>(null);

    const userRole = (simulatedRole || user?.role || 'ATHLETE') as UserRole;
    const isSimulating = !!simulatedRole;
    const uiSettings = getUISettings(userRole);

    // Get UI Builder settings for this role
    const uiBuilderSettings = useMemo(() => getRoleUISettings(userRole), [userRole]);

    // Filter nav items based on permissions, UI settings, and UI Builder visibility
    const navItems = useMemo(() => {
        return NAV_ITEMS.filter(item => {
            const hasAccess = hasPermission(userRole, item.module, 'view');
            const isInSidebar = uiSettings.sidebarModules.includes(item.module);

            // Also check UI Builder visibility if config exists
            if (uiBuilderSettings) {
                const moduleConfig = uiBuilderSettings.modules.find(m => m.moduleId === item.module);
                if (moduleConfig && !moduleConfig.visible) {
                    return false;
                }
            }

            return hasAccess && isInSidebar;
        });
    }, [userRole, uiSettings, uiBuilderSettings, hasPermission]);

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
        <div className="min-h-screen flex">
            {/* Desktop Sidebar */}
            <motion.aside
                className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 
          ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}
                initial={false}
            >
                <div className="flex flex-col h-full glass-strong">
                    {/* Logo Section - Top of Sidebar */}
                    <div className="border-b border-dark-700/50">
                        <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'flex-col'} px-4 py-4`}>
                            {sidebarOpen ? (
                                <motion.div
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <HexLogoFrame size={40} />
                                    <div>
                                        <p className="font-display font-bold text-sm gradient-text">Csystem</p>
                                        <p className="text-[9px] text-dark-400">Sistem Integrasi Panahan</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    <HexLogoFrame size={40} className="mb-2" />
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700/50 transition-colors"
                                        title="Expand Sidebar"
                                    >
                                        <ChevronDown size={16} className="rotate-[-90deg]" />
                                    </button>
                                </>
                            )}
                            {sidebarOpen && (
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-dark-400 hover:text-white transition-colors"
                                    title="Collapse Sidebar"
                                >
                                    <Menu size={18} />
                                </button>
                            )}
                        </div>
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

                    {/* Navigation */}
                    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${isActive
                                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                        : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                  ${!sidebarOpen ? 'justify-center' : ''}
                `}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <item.icon size={20} />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </NavLink>
                        ))}

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

                        {/* Athlete Preview - Super Admin Only (Hide when simulating) */}
                        {isAdmin && !isSimulating && (
                            <>
                                {sidebarOpen && (
                                    <div className="pt-3 pb-1 px-2">
                                        <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">👤 Athlete Preview</span>
                                    </div>
                                )}
                                <NavLink
                                    to="/scoring"
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                        ${isActive
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-dark-400 hover:text-blue-400 hover:bg-blue-500/10'}
                                        ${!sidebarOpen ? 'justify-center' : ''}
                                    `}
                                    title={!sidebarOpen ? 'Scoring (Athlete)' : undefined}
                                >
                                    <Crosshair size={18} />
                                    {sidebarOpen && <span className="font-medium">Scoring</span>}
                                </NavLink>
                                <NavLink
                                    to="/training/bleep-test"
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                        ${isActive
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-dark-400 hover:text-blue-400 hover:bg-blue-500/10'}
                                        ${!sidebarOpen ? 'justify-center' : ''}
                                    `}
                                    title={!sidebarOpen ? 'Bleep Test (Athlete)' : undefined}
                                >
                                    <Timer size={18} />
                                    {sidebarOpen && <span className="font-medium">Bleep Test</span>}
                                </NavLink>
                                <NavLink
                                    to="/training/schedule"
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                        ${isActive
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-dark-400 hover:text-blue-400 hover:bg-blue-500/10'}
                                        ${!sidebarOpen ? 'justify-center' : ''}
                                    `}
                                    title={!sidebarOpen ? 'Training Schedule (Athlete)' : undefined}
                                >
                                    <Calendar size={18} />
                                    {sidebarOpen && <span className="font-medium">Training Schedule</span>}
                                </NavLink>
                                <NavLink
                                    to="/guidance"
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                        ${isActive
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-dark-400 hover:text-blue-400 hover:bg-blue-500/10'}
                                        ${!sidebarOpen ? 'justify-center' : ''}
                                    `}
                                    title={!sidebarOpen ? 'Archery Guidance (Athlete)' : undefined}
                                >
                                    <Shield size={18} />
                                    {sidebarOpen && <span className="font-medium">Archery Guidance</span>}
                                </NavLink>
                                <NavLink
                                    to="/archerconfig"
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                        ${isActive
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-dark-400 hover:text-blue-400 hover:bg-blue-500/10'}
                                        ${!sidebarOpen ? 'justify-center' : ''}
                                    `}
                                    title={!sidebarOpen ? 'Archer Config (Athlete)' : undefined}
                                >
                                    <Target size={18} />
                                    {sidebarOpen && <span className="font-medium">Archer Config</span>}
                                </NavLink>
                                <NavLink
                                    to="/digitalcard"
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                        ${isActive
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'text-dark-400 hover:text-blue-400 hover:bg-blue-500/10'}
                                        ${!sidebarOpen ? 'justify-center' : ''}
                                    `}
                                    title={!sidebarOpen ? 'Digital ID Card (Athlete)' : undefined}
                                >
                                    <CreditCard size={18} />
                                    {sidebarOpen && <span className="font-medium">Digital ID Card</span>}
                                </NavLink>
                            </>
                        )}

                        {/* Jersey System - Super Admin & Suppliers */}
                        {(userRole === 'SUPPLIER' || userRole === 'SUPER_ADMIN') && (
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
                    <div className="p-3 border-t border-dark-700/50 space-y-2">
                        {/* Role & User ID */}
                        {sidebarOpen ? (
                            <div className="px-3 py-2 rounded-lg bg-dark-800/50">
                                <p className="text-sm font-medium text-primary-400">{userRole.replace('_', ' ')}</p>
                                <p className="text-[11px] text-dark-400 mt-0.5 font-mono">{user?.sipId || 'Not generated'}</p>
                            </div>
                        ) : (
                            <div className="flex justify-center" title={userRole.replace('_', ' ')}>
                                <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs font-bold">
                                    {userRole.charAt(0)}
                                </span>
                            </div>
                        )}

                        {/* Admin Panel - Super Admin Only (Below Role/ID) */}
                        {isAdmin && (
                            <>


                                {userRole === 'SUPER_ADMIN' && (
                                    <NavLink
                                        to="/admin"
                                        className={({ isActive }) => `
                                            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all
                                            ${isActive
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'}
                                            ${!sidebarOpen ? 'justify-center' : ''}
                                        `}
                                        title={!sidebarOpen ? 'Admin Panel' : undefined}
                                    >
                                        <Shield size={20} />
                                        {sidebarOpen && <span className="font-medium">Admin Panel</span>}
                                    </NavLink>
                                )}
                            </>
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
                </div>
            </motion.aside >

            {/* Mobile Header */}
            < header className="lg:hidden fixed top-0 left-0 right-0 h-16 z-50 glass-strong safe-top" >
                <div className="flex items-center justify-between h-full px-4">
                    {/* Left - Logo & Title */}
                    <div className="flex items-center gap-2">
                        <HexLogoFrame size={32} />
                        <div>
                            <p className="font-display font-bold text-xs gradient-text">Csystem</p>
                        </div>
                    </div>

                    {/* Right - User Info & Menu */}
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <p className="font-medium text-xs truncate max-w-[80px]">{user?.name}</p>
                            <p className="text-[10px] text-dark-400">{user?.role?.replace('_', ' ')}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-dark-300 ml-1"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header >

            {/* Mobile Menu */}
            <AnimatePresence>
                {
                    mobileMenuOpen && (
                        <motion.div
                            className="lg:hidden fixed inset-0 z-40 bg-dark-950/95 pt-16"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <nav className="p-4 space-y-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/'}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-primary-500/20 text-primary-400' : 'text-dark-300'}
                  `}
                                    >
                                        <item.icon size={22} />
                                        <span className="font-medium">{item.label}</span>
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
            < main className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`
            }>
                {/* Sticky Header - Shows full title when sidebar collapsed */}
                < header className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-md sticky top-0 z-30" >
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
        </div >
    );
}
