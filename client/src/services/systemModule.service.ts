
import { api } from '../context/AuthContext';

export interface ModuleOption {
    id: string;
    subModuleId: string;
    code: string;
    label: string;
    type: 'BOOLEAN' | 'TEXT' | 'NUMBER';
    defaultValue: string;
}

export interface SubModule {
    id: string;
    moduleId: string;
    code: string;
    name: string;
    options: ModuleOption[];
}

export interface SystemModule {
    id: string;
    code: string;
    name: string;
    description?: string;
    category: string;
    moduleType: 'UNIVERSAL' | 'ROLE_SPECIFIC';
    targetRoles?: string | string[]; // Can be JSON string or parsed array
    subModules: SubModule[];
    config?: Record<string, any>;
}

export interface OrgModuleConfig {
    id: string;
    organizationId: string;
    moduleId: string;
    isEnabled: boolean;
    config: Record<string, any>;
    module: {
        code: string;
        name: string;
    };
}

// Fetch all available System Modules (Lego Warehouse)
export const getSystemModules = async (): Promise<SystemModule[]> => {
    const response = await api.get('/system-modules');
    return response.data.data;
};

// Fetch Organization's Config
export const getOrgModuleConfig = async (): Promise<OrgModuleConfig[]> => {
    const response = await api.get('/system-modules/config');
    return response.data.data;
};

// Update Organization's Config for a specific module
export const updateOrgModuleConfig = async (moduleId: string, isEnabled: boolean, config: Record<string, any>) => {
    const response = await api.post('/system-modules/config', {
        moduleId,
        isEnabled,
        config
    });
    return response.data.data;
};
