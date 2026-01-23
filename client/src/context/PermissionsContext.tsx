import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    UserRole,
    ModuleName,
    ActionType,
    RolePermissions,
    RoleUISettings,
    DEFAULT_PERMISSIONS,
    DEFAULT_UI_SETTINGS,
    SidebarGroupConfig,
    SIDEBAR_ROLE_GROUPS,
} from '../types/permissions';
import { api } from './AuthContext';

interface PermissionsContextType {
    // Permissions
    permissions: RolePermissions[];
    hasPermission: (role: UserRole, module: ModuleName, action?: ActionType) => boolean;
    updatePermission: (role: UserRole, module: ModuleName, action: ActionType, enabled: boolean) => void;
    resetPermissions: () => void;

    // UI Settings
    uiSettings: RoleUISettings[];
    getUISettings: (role: UserRole) => RoleUISettings;
    updateUISettings: (role: UserRole, settings: Partial<RoleUISettings>) => void;
    resetUISettings: () => void;

    // Hierarchical sidebar (SuperAdmin > Club > Member)
    getEffectiveSidebar: (role: UserRole, clubId?: string) => ModuleName[];

    // Sidebar Configs (Architect Model)
    sidebarConfigs: Record<string, SidebarGroupConfig[]>;
    refreshSidebarConfigs: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const PERMISSIONS_STORAGE_KEY = 'sip_role_permissions_v7';
const UI_SETTINGS_STORAGE_KEY = 'sip_ui_settings_v7';

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
    // Initialize from localStorage or defaults
    // Initialize from localStorage or defaults
    const [permissions, setPermissions] = useState<RolePermissions[]>(() => {
        const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
        let initialPerms = DEFAULT_PERMISSIONS;

        if (stored) {
            try {
                initialPerms = JSON.parse(stored);
            } catch {
                initialPerms = DEFAULT_PERMISSIONS;
            }
        }

        // FORCE FIX: Ensure EO has events permission
        const eoRole = initialPerms.find(p => p.role === 'EO');
        if (eoRole) {
            const hasEvents = eoRole.permissions.some(p => p.module === 'events');
            if (!hasEvents) {
                console.log('Force injecting events permission for EO');
                eoRole.permissions.push({
                    module: 'events',
                    canView: true,
                    canCreate: false,
                    canEdit: false,
                    canDelete: false
                });
            } else {
                // Ensure view is true
                const eventPerm = eoRole.permissions.find(p => p.module === 'events');
                if (eventPerm) eventPerm.canView = true;
            }
        }
        return initialPerms;
    });

    const [uiSettings, setUISettings] = useState<RoleUISettings[]>(() => {
        const stored = localStorage.getItem(UI_SETTINGS_STORAGE_KEY);
        let initialSettings = DEFAULT_UI_SETTINGS;

        if (stored) {
            try {
                initialSettings = JSON.parse(stored);
            } catch {
                initialSettings = DEFAULT_UI_SETTINGS;
            }
        }

        // FORCE FIX: Ensure EO has events in sidebar
        const eoSettings = initialSettings.find(s => s.role === 'EO');
        if (eoSettings) {
            if (!eoSettings.sidebarModules.includes('events')) {
                console.log('Force injecting events sidebar item for EO');
                eoSettings.sidebarModules.push('events');
            }
        }
        return initialSettings;
    });

    const [sidebarConfigs, setSidebarConfigs] = useState<Record<string, SidebarGroupConfig[]>>({});

    // Fetch all sidebar configs from backend
    const fetchSidebarConfigs = useCallback(async () => {
        try {
            const res = await api.get('/permissions/sidebar/config/all');
            if (Array.isArray(res.data)) {
                const configs: Record<string, SidebarGroupConfig[]> = {};
                res.data.forEach((item: any) => {
                    if (item.role && item.groups) {
                        try {
                            configs[item.role] = JSON.parse(item.groups);
                        } catch (e) {
                            console.error(`Error parsing sidebar groups for ${item.role}`, e);
                        }
                    }
                });
                setSidebarConfigs(configs);
            }
        } catch (error) {
            console.error('Error fetching sidebar configs:', error);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchSidebarConfigs();
    }, [fetchSidebarConfigs]);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    }, [permissions]);

    useEffect(() => {
        localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(uiSettings));
    }, [uiSettings]);

    // Check if a role has permission for a module/action
    const hasPermission = useCallback((role: UserRole, module: ModuleName, action: ActionType = 'view'): boolean => {
        // --- Architect Model for View Permission ---
        if (action === 'view') {
            // Get sidebar modules for this role
            const roleConfig = sidebarConfigs[role];

            // If custom config exists, check if module is in any group
            if (roleConfig) {
                return roleConfig.some(group => {
                    const groupModules = [...group.modules];
                    if (group.nestedModules) {
                        Object.values(group.nestedModules).forEach(subList => {
                            groupModules.push(...subList);
                        });
                    }
                    return groupModules.includes(module);
                });
            }

            const defaultGroups = SIDEBAR_ROLE_GROUPS;
            const hasInDefault = defaultGroups.some(group => {
                const modules = [...group.modules];
                if (group.nestedModules) {
                    Object.values(group.nestedModules).forEach(subList => {
                        modules.push(...subList);
                    });
                }
                if (modules.includes(module)) {
                    const settings = uiSettings.find(s => s.role === role) || DEFAULT_UI_SETTINGS.find(s => s.role === role);
                    if (!settings) return false;
                    return settings.sidebarModules.includes(module);
                }
                return false;
            });

            return hasInDefault || false;

        }

        // --- Standard logic for Create/Edit/Delete ---
        const rolePerms = permissions.find(p => p.role === role);
        if (!rolePerms) return false;

        const modulePerms = rolePerms.permissions.find(p => p.module === module);
        if (!modulePerms) return false;

        switch (action) {
            case 'create': return modulePerms.canCreate;
            case 'edit': return modulePerms.canEdit;
            case 'delete': return modulePerms.canDelete;
            default: return false;
        }
    }, [permissions, sidebarConfigs, uiSettings]);

    // Update a specific permission
    const updatePermission = useCallback((role: UserRole, module: ModuleName, action: ActionType, enabled: boolean) => {
        setPermissions(prev => prev.map(rp => {
            if (rp.role !== role) return rp;
            return {
                ...rp,
                permissions: rp.permissions.map(mp => {
                    if (mp.module !== module) return mp;
                    return {
                        ...mp,
                        [`can${action.charAt(0).toUpperCase() + action.slice(1)}`]: enabled,
                    };
                }),
            };
        }));
    }, []);

    // Reset permissions to defaults
    const resetPermissions = useCallback(() => {
        setPermissions(DEFAULT_PERMISSIONS);
    }, []);

    // Get UI settings for a role
    const getUISettings = useCallback((role: UserRole): RoleUISettings => {
        const found = uiSettings.find(s => s.role === role) || DEFAULT_UI_SETTINGS.find(s => s.role === role);
        if (!found) {
            // Ultimate fallback to ATHLETE or first available if role is unknown
            return DEFAULT_UI_SETTINGS[0];
        }
        return found;
    }, [uiSettings]);


    // Update UI settings for a role
    const updateUISettings = useCallback((role: UserRole, settings: Partial<RoleUISettings>) => {
        setUISettings(prev => prev.map(s => {
            if (s.role !== role) return s;
            return { ...s, ...settings };
        }));
    }, []);

    // Reset UI settings to defaults
    const resetUISettings = useCallback(() => {
        setUISettings(DEFAULT_UI_SETTINGS);
    }, []);

    // Get effective sidebar modules considering hierarchical permissions
    // SuperAdmin settings > Club settings > Member view
    const getEffectiveSidebar = useCallback((role: UserRole, clubId?: string): ModuleName[] => {
        // --- Architect Model: Get modules from dynamic backend config ---
        const roleConfig = sidebarConfigs[role];
        let baseModules: ModuleName[] = [];

        if (roleConfig) {
            // Collect all modules from all groups, including nested ones
            baseModules = roleConfig.flatMap(group => {
                const modules = [...group.modules];
                if (group.nestedModules) {
                    Object.values(group.nestedModules).forEach(subList => {
                        modules.push(...subList);
                    });
                }
                return modules;
            });
        } else {
            // Fallback to static UI settings
            const settings = getUISettings(role);
            baseModules = settings.sidebarModules;
        }

        // If no clubId provided, return base settings directy
        if (!clubId) return baseModules;

        // Check for club-specific settings (RESTRICTIVE)
        const clubStorageKey = `sip_club_sidebar_${clubId}_v1`;
        const clubSettingsRaw = localStorage.getItem(clubStorageKey);

        if (!clubSettingsRaw) return baseModules;

        try {
            const clubSettings = JSON.parse(clubSettingsRaw);
            const clubRoleSettings = clubSettings[role] as ModuleName[] | undefined;

            if (!clubRoleSettings) return baseModules;

            // Club can only RESTRICT, not expand
            // Return intersection of Base allowed and Club allowed
            return baseModules.filter(m => clubRoleSettings.includes(m));
        } catch {
            return baseModules;
        }
    }, [sidebarConfigs, getUISettings]);

    return (
        <PermissionsContext.Provider value={{
            permissions,
            hasPermission,
            updatePermission,
            resetPermissions,
            uiSettings,
            getUISettings,
            updateUISettings,
            resetUISettings,
            getEffectiveSidebar,
            sidebarConfigs,
            refreshSidebarConfigs: fetchSidebarConfigs,
        }}>
            {children}
        </PermissionsContext.Provider>
    );
}


export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionsProvider');
    }
    return context;
}
