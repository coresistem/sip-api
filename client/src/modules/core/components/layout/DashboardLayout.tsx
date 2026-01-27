import { useState, useMemo, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, api } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { UserRole, ModuleName, MODULE_LIST, SidebarCategory, SIDEBAR_ROLE_GROUPS, SidebarGroupConfig } from '../../types/permissions';
import { getRoleUISettings } from '../../types/uiBuilder';
import {
    LayoutDashboard, Users, Crosshair, Calendar,
    ScanLine, Wallet, Package, BarChart3, User, LogOut,
    Menu, X, ChevronDown, FileBarChart, Shield, CreditCard, Target,
    Building2, FolderOpen, Star, Shirt, ShoppingBag, ClipboardList, Timer, Eye,
    GraduationCap, CheckCircle, Bell, FileSearch, History, Truck,
    Trophy, TrendingUp, UserPlus, FileText, Award, Plus, ChevronLeft, ChevronRight, Home, Settings, MapPin, Store, HelpCircle
} from 'lucide-react';
import HexLogoFrame from '../ui/HexLogoFrame';
import { NAV_ITEMS } from '../../constants/navigation';

// Navigation items migrated to ../../constants/navigation.ts




export default function DashboardLayout() {
    const { user, logout, simulatedRole, setSimulatedRole, originalUser, setSimulatedSipId, simulatedSipId, switchRole, isAuthenticated, isLoading } = useAuth();
    const { hasPermission, getUISettings, getEffectiveSidebar, sidebarConfigs } = usePermissions();
    const navigate = useNavigate();
    const location = useLocation();

    // Guard: If not loading and not authenticated, redirect to login
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) return null; // Or a loading spinner

    // Desktop Sidebar: simple show/hide
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [shopMenuOpen, setShopMenuOpen] = useState(false);
    const [jerseyMenuOpen, setJerseyMenuOpen] = useState(true);
    const [expandedSection, setExpandedSection] = useState<string>('general');

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

    // Shortcut options for navbar (available features) - Moved down to after effectiveModules declaration

    const ROLE_OPTIONS = [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'ATHLETE', label: 'Athlete' },
        { value: 'COACH', label: 'Coach' },
        { value: 'CLUB', label: 'Club' },
        { value: 'SCHOOL', label: 'School' },
        { value: 'PARENT', label: 'Parent' },
        { value: 'EO', label: 'Event Organizer' },
        { value: 'JUDGE', label: 'Judge' },
        { value: 'SUPPLIER', label: 'Supplier' },
        { value: 'MANPOWER', label: 'Manpower' },
    ];

    const userRole = (simulatedRole || user?.role || 'ATHLETE') as UserRole;
    const isSimulating = !!simulatedRole;

    // Determine the role to use for fetching sidebar configurations
    // CLUB role uses its standard configuration
    const configRole = userRole;

    const uiSettings = getUISettings(configRole);

    // Get UI Builder settings for this role
    const uiBuilderSettings = useMemo(() => getRoleUISettings(configRole), [configRole]);

    const effectiveModules = useMemo(() => getEffectiveSidebar(configRole, user?.clubId), [configRole, user?.clubId, getEffectiveSidebar]);

    // Shortcut options for navbar (available features) - Dynamically filtered
    const SHORTCUT_OPTIONS = useMemo(() => {
        return NAV_ITEMS
            .filter(item => {
                // Check if module is in effectiveModules
                return effectiveModules.includes(item.module);
            })
            .map(item => ({
                id: item.module,
                label: item.label,
                icon: item.icon,
                path: item.path
            }));
    }, [effectiveModules]);

    // Dynamic Sidebar Groups (fetched from DB via Context or fallback)
    const roleGroups = useMemo(() => {
        return sidebarConfigs[configRole] || SIDEBAR_ROLE_GROUPS;
    }, [sidebarConfigs, configRole]);

    // Group nav items by role-based categories (dynamic)
    const roleGroupedNavItems = useMemo(() => {
        // For each role group, get visible nav items that match
        return roleGroups.map(group => {
            // Get all modules including nested children
            const nestedConfig = group.nestedModules || {};
            const nestedChildModules = Object.values(nestedConfig).flat();
            const allGroupModules = [...group.modules, ...nestedChildModules];

            // Filter and sort items based on the order in allGroupModules (Sidebar Builder order)
            let groupNavItems = allGroupModules
                .map(moduleName => NAV_ITEMS.find(item => item.module === moduleName))
                .filter((item): item is typeof NAV_ITEMS[0] => !!item && effectiveModules.includes(item.module)); // Use effectiveModules for filtering

            // Search Filtering
            if (searchTerm.trim()) {
                const lowerTerm = searchTerm.toLowerCase();
                groupNavItems = groupNavItems.filter(item => {
                    const matchesSearch = item.label.toLowerCase().includes(lowerTerm) ||
                        item.module.toLowerCase().includes(lowerTerm);

                    if (matchesSearch) return true;

                    // If parent doesn't match, check if any of its children match
                    const nestedChildren = nestedConfig[item.module];
                    if (nestedChildren) {
                        return nestedChildren.some(childModule => {
                            const childItem = NAV_ITEMS.find(nav => nav.module === childModule);
                            return childItem && (
                                childItem.label.toLowerCase().includes(lowerTerm) ||
                                childItem.module.toLowerCase().includes(lowerTerm)
                            );
                        });
                    }

                    return false;
                });
            }

            return {
                ...group,
                items: groupNavItems
            };
        }).filter(group => group.items.length > 0); // Only show groups with visible items
    }, [roleGroups, effectiveModules, searchTerm]);


    // Get visible custom modules
    const customModules = useMemo(() => {
        if (!uiBuilderSettings) return [];
        return uiBuilderSettings.customModules.filter(m => m.visible);
    }, [uiBuilderSettings]);

    // Add Admin item for Super Admin (real role check, not simulated)
    const isAdmin = (originalUser || user)?.role === 'SUPER_ADMIN';

    // Track page views
    useEffect(() => {
        const trackView = async () => {
            try {
                // Ignore initial load if needed, but useful to track
                // Simple debounce or check if path changed
                await api.post('/analytics/track-view', { path: location.pathname });
            } catch (error) {
                // Silent fail
            }
        };

        trackView();
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
    };

    const isMarketplace = location.pathname.startsWith('/marketplace');

    return (
        <div className="min-h-screen flex" >
            {/* Sidebar */}
            {!isMarketplace && (
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

                        {/* Sidebar Search */}
                        {sidebarOpen && (
                            <div className="px-3 py-3 border-b border-dark-800">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileSearch size={14} className="text-dark-500 group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search modules..."
                                        className="block w-full pl-9 pr-8 py-1.5 border border-dark-700 rounded-lg leading-5 bg-dark-800 text-slate-300 placeholder-dark-500 focus:outline-none focus:bg-dark-900 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 sm:text-xs transition-all"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-500 hover:text-white cursor-pointer"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation - Scrollable */}
                        <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                            {/* ... (rest of sidebar content clipped for brevity in replace_file_content) */}
                            {/* Dynamic Role-Based Groups */}
                            {roleGroupedNavItems.map((group) => {
                                // Get nested module config for this group
                                const nestedConfig = group.nestedModules || {};
                                // Get all nested child modules (to exclude from top-level)
                                const nestedChildModules = Object.values(nestedConfig).flat();

                                return (
                                    <div key={group.id} className="mb-0.5">
                                        {sidebarOpen && (
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === group.id ? '' : group.id)}
                                                className={`w-full flex items-center justify-between py-1.5 px-2 text-xs font-medium uppercase tracking-wider hover:text-dark-400 transition-colors ${group.id === 'general' ? 'text-primary-500/70' :
                                                    group.color === 'blue' ? 'text-blue-500/70' :
                                                        group.color === 'green' ? 'text-green-500/70' :
                                                            group.color === 'orange' ? 'text-orange-500/70' :
                                                                group.color === 'emerald' ? 'text-emerald-500/70' :
                                                                    group.color === 'purple' ? 'text-purple-500/70' :
                                                                        group.color === 'teal' ? 'text-teal-500/70' :
                                                                            group.color === 'indigo' ? 'text-indigo-500/70' :
                                                                                group.color === 'rose' ? 'text-rose-500/70' :
                                                                                    group.color === 'violet' ? 'text-violet-500/70' :
                                                                                        group.color === 'red' ? 'text-red-500/70' :
                                                                                            'text-dark-500'
                                                    }`}
                                            >
                                                <span>{group.label}</span>
                                                <ChevronDown
                                                    size={12}
                                                    className={`transition-transform ${expandedSection === group.id ? '' : '-rotate-90'}`}
                                                />
                                            </button>
                                        )}
                                        {(expandedSection === group.id || !!searchTerm.trim() || !sidebarOpen) && group.items
                                            .filter(item => !nestedChildModules.includes(item.module)) // Exclude nested children from top-level
                                            .map((item) => {
                                                // Check if this item has nested children
                                                const nestedChildren = nestedConfig[item.module];
                                                let nestedNavItems = nestedChildren
                                                    ? NAV_ITEMS.filter(nav => nestedChildren.includes(nav.module))
                                                    : [];

                                                // Filter nested items during search
                                                if (searchTerm.trim()) {
                                                    const lowerTerm = searchTerm.toLowerCase();
                                                    nestedNavItems = nestedNavItems.filter(nav =>
                                                        nav.label.toLowerCase().includes(lowerTerm) ||
                                                        nav.module.toLowerCase().includes(lowerTerm)
                                                    );
                                                }

                                                return (
                                                    <div key={item.path}>
                                                        <NavLink
                                                            to={item.path}
                                                            end={item.path === '/'}
                                                            className={({ isActive }) => `
                                                        flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-xs
                                                        ${isActive
                                                                    ? `bg-${group.color === 'primary' ? 'primary' : group.color}-500/20 text-${group.color === 'primary' ? 'primary' : group.color}-400`
                                                                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'}
                                                        ${!sidebarOpen ? 'justify-center py-2' : ''}
                                                    `}
                                                            title={!sidebarOpen ? item.label : undefined}
                                                        >
                                                            <item.icon size={16} />
                                                            {sidebarOpen && <span className="font-medium truncate">{item.label}</span>}
                                                            {sidebarOpen && nestedNavItems.length > 0 && (
                                                                <span className="ml-auto text-dark-500 text-[10px]">▼</span>
                                                            )}
                                                        </NavLink>
                                                        {/* Render nested children with indentation */}
                                                        {sidebarOpen && nestedNavItems.length > 0 && (
                                                            <div className="ml-4 pl-2 border-l border-dark-700/50">
                                                                {nestedNavItems.map((nestedItem) => (
                                                                    <NavLink
                                                                        key={nestedItem.path}
                                                                        to={nestedItem.path}
                                                                        end={nestedItem.path === '/'}
                                                                        className={({ isActive }) => `
                                                                    flex items-center gap-2 px-2 py-1 rounded-md transition-all text-xs
                                                                    ${isActive
                                                                                ? `bg-${group.color === 'primary' ? 'primary' : group.color}-500/20 text-${group.color === 'primary' ? 'primary' : group.color}-400`
                                                                                : 'text-dark-500 hover:text-white hover:bg-dark-700/30'}
                                                                `}
                                                                        title={nestedItem.label}
                                                                    >
                                                                        <nestedItem.icon size={14} />
                                                                        <span className="font-medium truncate text-[11px]">{nestedItem.label}</span>
                                                                    </NavLink>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )
                            })}


                            {/* --- Admin Only (Hidden in sidebar - shown in bottom area) --- */}

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

                            {/* Jersey System and Jersey Shop sections removed - now in SIDEBAR_ROLE_GROUPS */}
                            {/* - Catalog and My Orders → General group */}
                            {/* - Jersey System sub-items → Supplier will have nested submenu (TODO) */}
                        </nav>

                        {/* User Role & Logout Section - Bottom of Sidebar */}
                        < div className="p-3 border-t border-dark-700/50 space-y-2" >
                            {/* Role & User ID - with Role Switcher for multi-role users */}
                            {
                                sidebarOpen ? (
                                    <div className="px-3 py-2 rounded-lg bg-dark-800/50" >
                                        {/* Role Selection Logic */}
                                        {(() => {
                                            let availableRoles: string[] = [];
                                            try {
                                                if (user?.roles) {
                                                    availableRoles = JSON.parse(user.roles);
                                                } else if (user?.role) {
                                                    availableRoles = [user.role];
                                                }
                                            } catch (e) {
                                                availableRoles = user?.role ? [user.role] : [];
                                            }

                                            // Ensure current role is in list (fallback)
                                            if (userRole && !availableRoles.includes(userRole)) {
                                                availableRoles.push(userRole);
                                            }

                                            // Filter out duplicates
                                            availableRoles = [...new Set(availableRoles)];

                                            if (availableRoles.length > 1 && !isSimulating) {
                                                return (
                                                    <div className="relative">
                                                        <select
                                                            value={userRole}
                                                            onChange={(e) => {
                                                                switchRole(e.target.value as any);
                                                            }}
                                                            className="w-full bg-dark-900 border border-dark-600 text-sm text-primary-400 rounded px-2 py-1 focus:outline-none focus:border-primary-500 appearance-none cursor-pointer mb-1"
                                                        >
                                                            {availableRoles.map(role => (
                                                                <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown size={12} className="absolute right-2 top-2.5 text-primary-400 pointer-events-none" />
                                                    </div>
                                                );
                                            } else {
                                                return <p className="text-sm font-medium text-primary-400">{userRole.replace('_', ' ')}</p>;
                                            }
                                        })()}

                                        <p className="text-[11px] text-dark-400 mt-0.5 font-mono">{user?.sipId || 'Not generated'}</p>

                                        {/* Club Panel Link - Only for Club/Club Owner */}
                                        {userRole === 'CLUB' && (
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

                            {/* Admin Panel Link - Only for Super Admin */}
                            {userRole === 'SUPER_ADMIN' && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) => `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${isActive
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'
                                        } ${sidebarOpen ? '' : 'justify-center'}`}
                                    title={!sidebarOpen ? 'Admin Panel' : undefined}
                                >
                                    <Shield size={20} />
                                    {sidebarOpen && <span className="font-medium">Admin Panel</span>}
                                </NavLink>
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
            )}

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {
                    mobileMenuOpen && (
                        <motion.div
                            className="lg:hidden fixed inset-0 z-[100] bg-dark-950/98 backdrop-blur-md flex flex-col"
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
                                {/* Dynamic Role-Based Groups (Mobile) */}
                                {roleGroupedNavItems.map((group) => {
                                    // Get nested module config for this group
                                    const nestedConfig = group.nestedModules || {};
                                    // Get all nested child modules (to exclude from top-level)
                                    const nestedChildModules = Object.values(nestedConfig).flat();

                                    return (
                                        <div key={group.id} className="mb-1">
                                            <button
                                                onClick={() => setExpandedSection(expandedSection === group.id ? '' : group.id)}
                                                className={`w-full flex items-center justify-between py-2 px-1 text-xs font-medium uppercase tracking-wider ${group.id === 'general' ? 'text-primary-500/70' :
                                                    group.color === 'blue' ? 'text-blue-500/70' :
                                                        group.color === 'green' ? 'text-green-500/70' :
                                                            group.color === 'orange' ? 'text-orange-500/70' :
                                                                group.color === 'emerald' ? 'text-emerald-500/70' :
                                                                    group.color === 'purple' ? 'text-purple-500/70' :
                                                                        group.color === 'teal' ? 'text-teal-500/70' :
                                                                            group.color === 'indigo' ? 'text-indigo-500/70' :
                                                                                group.color === 'rose' ? 'text-rose-500/70' :
                                                                                    group.color === 'violet' ? 'text-violet-500/70' :
                                                                                        group.color === 'red' ? 'text-red-500/70' :
                                                                                            'text-dark-500'
                                                    }`}
                                            >
                                                <span>{group.label}</span>
                                                <ChevronDown
                                                    size={14}
                                                    className={`transition-transform ${expandedSection === group.id ? '' : '-rotate-90'}`}
                                                />
                                            </button>
                                            {(expandedSection === group.id || !!searchTerm.trim()) && group.items
                                                .filter(item => !nestedChildModules.includes(item.module))
                                                .map((item) => {
                                                    // Check if this item has nested children
                                                    const nestedChildren = nestedConfig[item.module];
                                                    let nestedNavItems = nestedChildren
                                                        ? NAV_ITEMS.filter(nav => nestedChildren.includes(nav.module))
                                                        : [];

                                                    // Filter nested items during search
                                                    if (searchTerm.trim()) {
                                                        const lowerTerm = searchTerm.toLowerCase();
                                                        nestedNavItems = nestedNavItems.filter(nav =>
                                                            nav.label.toLowerCase().includes(lowerTerm) ||
                                                            nav.module.toLowerCase().includes(lowerTerm)
                                                        );
                                                    }

                                                    return (
                                                        <div key={item.path}>
                                                            <NavLink
                                                                to={item.path}
                                                                end={item.path === '/'}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className={({ isActive }) => `
                                                                flex items-center gap-3 px-4 py-2 rounded-lg transition-all mb-1 text-sm
                                                                ${isActive ? 'bg-primary-500/20 text-primary-400' : 'text-dark-300 bg-dark-800/30'}
                                                            `}
                                                            >
                                                                <item.icon size={18} />
                                                                <span className="font-medium">{item.label}</span>
                                                                {nestedNavItems.length > 0 && (
                                                                    <span className="ml-auto text-dark-500 text-[10px]">▼</span>
                                                                )}
                                                            </NavLink>

                                                            {/* Render nested children with indentation (Mobile) */}
                                                            {nestedNavItems.length > 0 && (
                                                                <div className="ml-6 pl-3 border-l border-dark-700/50 mb-2 space-y-1">
                                                                    {nestedNavItems.map((nestedItem) => (
                                                                        <NavLink
                                                                            key={nestedItem.path}
                                                                            to={nestedItem.path}
                                                                            end={nestedItem.path === '/'}
                                                                            onClick={() => setMobileMenuOpen(false)}
                                                                            className={({ isActive }) => `
                                                                            flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs
                                                                            ${isActive
                                                                                    ? `bg-${group.color === 'primary' ? 'primary' : group.color}-500/20 text-${group.color === 'primary' ? 'primary' : group.color}-400`
                                                                                    : 'text-dark-400 hover:text-white hover:bg-dark-700/30'}
                                                                        `}
                                                                        >
                                                                            <nestedItem.icon size={14} />
                                                                            <span className="font-medium truncate">{nestedItem.label}</span>
                                                                        </NavLink>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    );
                                })}

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
                                {userRole === 'CLUB' && (
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
                                            to="/order-history"
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
            < main className={`flex-1 ${(sidebarOpen && !isMarketplace) ? 'lg:ml-64' : 'lg:ml-0'} transition-all duration-300 pb-20 lg:pb-0`
            }>
                {/* Mobile Header */}
                {!location.pathname.startsWith('/marketplace') && (
                    <header className="lg:hidden h-16 bg-dark-900/80 backdrop-blur-md border-b border-dark-800 flex items-center justify-between px-4 sticky top-0 z-30" >
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
                    </header >
                )}

                {/* Desktop Header */}
                {!location.pathname.startsWith('/marketplace') && (
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
                                            value={simulatedRole || originalUser?.role || ''}
                                            onChange={(e) => {
                                                const role = e.target.value as any;
                                                if (role === originalUser?.role) {
                                                    setSimulatedRole(null);
                                                    setSimulatedSipId(null);
                                                } else if (role) {
                                                    setSimulatedRole(role);
                                                    setSimulatedSipId(null);
                                                }
                                                navigate('/profile');
                                            }}
                                            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary-500 min-w-[120px]"
                                        >
                                            <option value="" disabled>Select Role</option>
                                            <option value={originalUser?.role}>Reset (Me)</option>
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
                                                            const res = await api.get(`/auth/search-users?query=${encodeURIComponent(val.trim())}`);
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

                        {/* Marketplace Direct Link */}
                        <div className="mr-2">
                            <NavLink
                                to="/marketplace"
                                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : (user?.role === 'SUPPLIER'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                        : 'bg-dark-800/50 text-dark-300 hover:text-white border border-white/5')
                                    }`}
                            >
                                <ShoppingBag size={18} />
                                <span className="text-sm font-semibold hidden sm:inline">Csystem Market</span>
                            </NavLink>
                        </div>

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
                )}

                {/* Page Content */}
                < div className={`transition-all duration-300 ${location.pathname.startsWith('/admin') ? 'pt-0' : 'p-4 lg:p-6 pt-20 lg:pt-6'}`} >
                    <Outlet />
                </div >
            </main >

            {/* Mobile Bottom Navigation (Dynamic 3-5 slots) */}
            < div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-900/90 backdrop-blur-xl border-t border-dark-800 flex items-center justify-around z-40 pb-safe" >
                {/* Slot 1: Menu (Fixed) */}
                < button
                    onClick={() => setMobileMenuOpen(true)}
                    className={`
                        flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors
                        ${mobileMenuOpen ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'}
                    `}
                >
                    <Menu size={20} />
                    <span className="text-[10px] font-medium">Menu</span>
                </button >

                {/* Slot 2: Shortcut 1 (Optional) */}
                {
                    navbarShortcuts.slot2 && (() => {
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
                    })()
                }

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
                {
                    navbarShortcuts.slot4 && (() => {
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
                    })()
                }

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
            </div >
        </div >
    );
}
