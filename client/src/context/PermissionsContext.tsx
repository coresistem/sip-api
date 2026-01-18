import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    UserRole,
    ModuleName,
    ActionType,
    RolePermissions,
    RoleUISettings,
    DEFAULT_PERMISSIONS,
    DEFAULT_UI_SETTINGS,
} from '../types/permissions';

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
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const PERMISSIONS_STORAGE_KEY = 'sip_role_permissions_v4';
const UI_SETTINGS_STORAGE_KEY = 'sip_ui_settings_v4';

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

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    }, [permissions]);

    useEffect(() => {
        localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(uiSettings));
    }, [uiSettings]);

    // Check if a role has permission for a module/action
    const hasPermission = useCallback((role: UserRole, module: ModuleName, action: ActionType = 'view'): boolean => {
        const rolePerms = permissions.find(p => p.role === role);
        if (!rolePerms) return false;

        const modulePerms = rolePerms.permissions.find(p => p.module === module);
        if (!modulePerms) return false;

        switch (action) {
            case 'view': return modulePerms.canView;
            case 'create': return modulePerms.canCreate;
            case 'edit': return modulePerms.canEdit;
            case 'delete': return modulePerms.canDelete;
            default: return false;
        }
    }, [permissions]);

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
        return uiSettings.find(s => s.role === role) || DEFAULT_UI_SETTINGS.find(s => s.role === role)!;
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
