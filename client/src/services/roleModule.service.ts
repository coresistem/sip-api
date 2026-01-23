import { api } from '../context/AuthContext';
import { ModuleName, SidebarCategory } from '../types/permissions';

export interface SubModule {
    id: string;
    code: string;
    name: string;
}

export interface SystemModule {
    id: string;
    name: string;
    code: string;
    description?: string;
    category: SidebarCategory;
    icon?: string;
    path?: string;
    subModules?: SubModule[];
    moduleType?: 'UNIVERSAL' | 'ROLE_SPECIFIC';
    targetRoles?: string | string[];
}

export interface RoleModuleConfig {
    id: string;
    role: string;
    moduleId: string;
    isEnabled: boolean;
    config: Record<string, any>;
    module?: SystemModule;
}

export interface RoleModuleWithStatus extends SystemModule {
    isEnabled: boolean;
    config: Record<string, any>;
    subModules: SubModule[]; // Required in this view
}

// Get all modules with config status for a specific role (Super Admin only)
export const getRoleModules = async (role: string): Promise<RoleModuleWithStatus[]> => {
    const response = await api.get(`/role-modules/${role}`);
    return response.data.data;
};

// Update single module config for a role (Super Admin only)
export const updateRoleModuleConfig = async (
    role: string,
    moduleId: string,
    isEnabled: boolean,
    config?: Record<string, any>
): Promise<RoleModuleConfig> => {
    const response = await api.put(`/role-modules/${role}/${moduleId}`, {
        isEnabled,
        config
    });
    return response.data.data;
};

// Get enabled modules for current user's role (for sidebar)
export const getMyEnabledModules = async (): Promise<SystemModule[]> => {
    const response = await api.get('/role-modules/my-modules');
    return response.data.data;
};

// Batch update modules for a role (Super Admin only)
export const batchUpdateRoleModules = async (
    role: string,
    modules: Array<{ moduleId: string; isEnabled: boolean; config?: Record<string, any> }>
): Promise<RoleModuleConfig[]> => {
    const response = await api.post(`/role-modules/${role}/batch`, { modules });
    return response.data.data;
};

// Available roles for Role Features config
export const CONFIGURABLE_ROLES = [
    { role: 'ATHLETE', label: 'Athlete', color: 'text-cyan-400' },
    { role: 'PARENT', label: 'Parent', color: 'text-purple-400' },
    { role: 'COACH', label: 'Coach', color: 'text-green-400' },
    { role: 'CLUB', label: 'Club Owner', color: 'text-orange-400' },
    { role: 'SCHOOL', label: 'School', color: 'text-emerald-400' },
    { role: 'JUDGE', label: 'Judge', color: 'text-indigo-400' },
    { role: 'EO', label: 'Event Organizer', color: 'text-teal-400' },
    { role: 'SUPPLIER', label: 'Supplier', color: 'text-rose-400' },
    { role: 'MANPOWER', label: 'Manpower', color: 'text-violet-400' },
];
