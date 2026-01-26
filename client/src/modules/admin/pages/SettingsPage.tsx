import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../core/contexts/AuthContext';
import {
    Settings, Moon, Sun, Monitor, Bell, BellOff, Mail, Smartphone,
    CreditCard, Crosshair, Users, Calendar, BarChart3, Shield,
    ChevronRight, Check, X, LogOut, Trophy, TrendingUp, Timer, Target
} from 'lucide-react';
import { usePermissions } from '../../core/contexts/PermissionsContext';
import { NAV_ITEMS } from '../../core/constants/navigation';

// Shortcut options migrated to dynamic generation logic inside component

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { getEffectiveSidebar } = usePermissions();
    const navigate = useNavigate();
    const userRole = user?.role || 'ATHLETE';

    const effectiveModules = useMemo(() => getEffectiveSidebar(userRole, user?.clubId), [userRole, user?.clubId, getEffectiveSidebar]);

    // Shortcut options for navbar (available features) - Dynamically filtered to match sidebar
    const shortcutOptions = useMemo(() => {
        return NAV_ITEMS
            .filter(item => effectiveModules.includes(item.module))
            .map(item => ({
                id: item.module,
                label: item.label,
                icon: item.icon,
                path: item.path
            }));
    }, [effectiveModules]);

    // Theme State
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'dark';
    });

    // Notification Preferences
    const [notifications, setNotifications] = useState({
        push: true,
        email: true,
    });

    // Navbar Shortcuts State
    const [navbarShortcuts, setNavbarShortcuts] = useState<{ slot2: string | null; slot4: string | null }>(() => {
        const saved = localStorage.getItem('navbar_shortcuts');
        return saved ? JSON.parse(saved) : { slot2: null, slot4: null };
    });

    // Persist settings
    useEffect(() => {
        localStorage.setItem('theme', theme);
        // Apply theme to document (for future implementation)
        document.documentElement.classList.remove('light', 'dark');
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.classList.add(systemTheme);
        } else {
            document.documentElement.classList.add(theme);
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('navbar_shortcuts', JSON.stringify(navbarShortcuts));
    }, [navbarShortcuts]);

    const handleShortcutChange = (slot: 'slot2' | 'slot4', value: string | null) => {
        setNavbarShortcuts(prev => ({ ...prev, [slot]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-primary-500/30">
                    <Settings className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                    <p className="text-sm text-dark-400">Customize your experience</p>
                </div>
            </div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden"
            >
                <button
                    onClick={() => navigate('/profile')}
                    className="w-full p-4 flex items-center justify-between hover:bg-dark-700/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center border border-primary-500/30">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <span className="text-primary-400 font-bold text-lg">{user?.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="font-semibold text-white">{user?.name || 'User'}</p>
                            <p className="text-xs text-dark-400">{userRole.replace('_', ' ')} • Tap to view profile</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-dark-500" />
                </button>
            </motion.div>

            {/* Appearance Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden"
            >
                <div className="p-4 border-b border-dark-700">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <Moon size={18} className="text-primary-400" />
                        Appearance
                    </h2>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-sm text-dark-400">Choose your preferred theme</p>
                    <div className="flex gap-2">
                        {[
                            { id: 'light', label: 'Light', icon: Sun },
                            { id: 'dark', label: 'Dark', icon: Moon },
                            { id: 'system', label: 'System', icon: Monitor },
                        ].map(option => (
                            <button
                                key={option.id}
                                onClick={() => setTheme(option.id as Theme)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${theme === option.id
                                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                                    : 'bg-dark-900/50 border-dark-600 text-dark-400 hover:border-dark-500'
                                    }`}
                            >
                                <option.icon size={16} />
                                <span className="text-sm font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Notifications Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden"
            >
                <div className="p-4 border-b border-dark-700">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <Bell size={18} className="text-primary-400" />
                        Notifications
                    </h2>
                </div>
                <div className="divide-y divide-dark-700">
                    {/* Push Notifications */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Smartphone size={18} className="text-dark-400" />
                            <div>
                                <p className="text-sm font-medium text-white">Push Notifications</p>
                                <p className="text-xs text-dark-500">Receive notifications on this device</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                            className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-primary-500' : 'bg-dark-600'
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${notifications.push ? 'left-6' : 'left-0.5'
                                    }`}
                            />
                        </button>
                    </div>
                    {/* Email Notifications */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-dark-400" />
                            <div>
                                <p className="text-sm font-medium text-white">Email Notifications</p>
                                <p className="text-xs text-dark-500">Receive updates via email</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                            className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-primary-500' : 'bg-dark-600'
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${notifications.email ? 'left-6' : 'left-0.5'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Navigation Shortcuts Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden"
            >
                <div className="p-4 border-b border-dark-700">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <Smartphone size={18} className="text-primary-400" />
                        Navigation Shortcuts
                    </h2>
                    <p className="text-xs text-dark-500 mt-1">Pin up to 2 features to your bottom navigation bar</p>
                </div>
                <div className="p-4 space-y-4">
                    {/* Shortcut Slot 1 */}
                    <div>
                        <label className="text-xs text-dark-400 uppercase tracking-wider mb-2 block">Shortcut Slot 1</label>
                        <select
                            value={navbarShortcuts.slot2 || ''}
                            onChange={(e) => handleShortcutChange('slot2', e.target.value || null)}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer"
                        >
                            <option value="">None (Hidden)</option>
                            {shortcutOptions.map(option => (
                                <option
                                    key={option.id}
                                    value={option.id}
                                    disabled={navbarShortcuts.slot4 === option.id}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Shortcut Slot 2 */}
                    <div>
                        <label className="text-xs text-dark-400 uppercase tracking-wider mb-2 block">Shortcut Slot 2</label>
                        <select
                            value={navbarShortcuts.slot4 || ''}
                            onChange={(e) => handleShortcutChange('slot4', e.target.value || null)}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer"
                        >
                            <option value="">None (Hidden)</option>
                            {shortcutOptions.map(option => (
                                <option
                                    key={option.id}
                                    value={option.id}
                                    disabled={navbarShortcuts.slot2 === option.id}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Club Panel Section (Role-based) */}
            {userRole === 'CLUB' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-orange-500/10 rounded-xl border border-orange-500/30 overflow-hidden"
                >
                    <button
                        onClick={() => navigate('/club/permissions')}
                        className="w-full p-4 flex items-center justify-between hover:bg-orange-500/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Shield size={20} className="text-orange-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-orange-400">Club Panel</p>
                                <p className="text-xs text-orange-400/60">Manage member permissions</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-orange-400" />
                    </button>
                </motion.div>
            )}

            {/* Logout Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-red-500/10 rounded-xl border border-red-500/30 overflow-hidden"
            >
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                            logout();
                            navigate('/login');
                        }
                    }}
                    className="w-full p-4 flex items-center justify-center gap-3 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} className="text-red-400" />
                    <span className="font-semibold text-red-400">Logout</span>
                </button>
            </motion.div>
        </div>
    );
}
