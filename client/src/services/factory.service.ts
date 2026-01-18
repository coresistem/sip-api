import { api } from '../context/AuthContext';

// ============================================
// TYPES
// ============================================

export type PartType = 'FULLSTACK' | 'WIDGET' | 'FORM_INPUT';
export type PartCategory = 'SPORT' | 'ADMIN' | 'COMMERCE' | 'FOUNDATION';
export type PartStatus = 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
export type AssemblyStatus = 'DRAFT' | 'TESTING' | 'APPROVED' | 'DEPLOYED';

export interface SystemPart {
    id: string;
    code: string;
    name: string;
    description?: string;
    type: PartType;
    category: PartCategory;
    icon?: string;
    componentPath: string;
    propsSchema?: string;
    dataSource?: string;
    requiredPerms?: string;
    dependencies?: string;
    status: PartStatus;
    isCore: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FeaturePart {
    id: string;
    featureId: string;
    partId: string;
    part: SystemPart;
    section: string;
    sortOrder: number;
    propsConfig?: string;
    dataBinding?: string;
    showCondition?: string;
    createdAt: string;
}

export interface FeatureAssembly {
    id: string;
    code: string;
    name: string;
    description?: string;
    targetRole: string;
    targetPage?: string;
    route?: string;
    status: AssemblyStatus;
    version: number;
    createdById: string;
    approvedById?: string;
    approvedAt?: string;
    deployedAt?: string;
    previewConfig?: string;
    testNotes?: string;
    createdAt: string;
    updatedAt: string;
    parts: FeaturePart[];
}

// ============================================
// PARTS API
// ============================================

export const getParts = async (filters?: {
    type?: PartType;
    category?: PartCategory;
    status?: PartStatus;
}): Promise<SystemPart[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/factory/parts?${params.toString()}`);
    return response.data.data;
};

export const getPartByCode = async (code: string): Promise<SystemPart> => {
    const response = await api.get(`/factory/parts/${code}`);
    return response.data.data;
};

export const createPart = async (part: Partial<SystemPart>): Promise<SystemPart> => {
    const response = await api.post('/factory/parts', part);
    return response.data.data;
};

export const updatePart = async (code: string, data: Partial<SystemPart>): Promise<SystemPart> => {
    const response = await api.put(`/factory/parts/${code}`, data);
    return response.data.data;
};

export const deletePart = async (code: string): Promise<void> => {
    await api.delete(`/factory/parts/${code}`);
};

// ============================================
// ASSEMBLIES API
// ============================================

export const getAssemblies = async (filters?: {
    targetRole?: string;
    status?: AssemblyStatus;
}): Promise<FeatureAssembly[]> => {
    const params = new URLSearchParams();
    if (filters?.targetRole) params.append('targetRole', filters.targetRole);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/factory/assemblies?${params.toString()}`);
    return response.data.data;
};

export const getAssemblyById = async (id: string): Promise<FeatureAssembly> => {
    const response = await api.get(`/factory/assemblies/${id}`);
    return response.data.data;
};

export const createAssembly = async (assembly: {
    code: string;
    name: string;
    description?: string;
    targetRole: string;
    targetPage?: string;
    route?: string;
    parts?: Array<{
        partId: string;
        section?: string;
        sortOrder?: number;
        propsConfig?: Record<string, any>;
        dataBinding?: Record<string, any>;
    }>;
}): Promise<FeatureAssembly> => {
    const response = await api.post('/factory/assemblies', assembly);
    return response.data.data;
};

export const updateAssembly = async (id: string, data: Partial<FeatureAssembly>): Promise<FeatureAssembly> => {
    const response = await api.put(`/factory/assemblies/${id}`, data);
    return response.data.data;
};

export const deleteAssembly = async (id: string): Promise<void> => {
    await api.delete(`/factory/assemblies/${id}`);
};

// Part management in assembly
export const addPartToAssembly = async (assemblyId: string, data: {
    partId: string;
    section?: string;
    sortOrder?: number;
    propsConfig?: Record<string, any>;
    dataBinding?: Record<string, any>;
    showCondition?: Record<string, any>;
}): Promise<FeaturePart> => {
    const response = await api.post(`/factory/assemblies/${assemblyId}/parts`, data);
    return response.data.data;
};

export const removePartFromAssembly = async (assemblyId: string, featurePartId: string): Promise<void> => {
    await api.delete(`/factory/assemblies/${assemblyId}/parts/${featurePartId}`);
};

export const updateFeaturePart = async (assemblyId: string, featurePartId: string, data: {
    section?: string;
    sortOrder?: number;
    propsConfig?: Record<string, any>;
    dataBinding?: Record<string, any>;
    showCondition?: Record<string, any>;
}): Promise<FeaturePart> => {
    const response = await api.put(`/factory/assemblies/${assemblyId}/parts/${featurePartId}`, data);
    return response.data.data;
};

// Workflow actions
export const approveAssembly = async (id: string): Promise<FeatureAssembly> => {
    const response = await api.post(`/factory/assemblies/${id}/approve`);
    return response.data.data;
};

export const deployAssembly = async (id: string): Promise<FeatureAssembly> => {
    const response = await api.post(`/factory/assemblies/${id}/deploy`);
    return response.data.data;
};

export const rollbackAssembly = async (id: string): Promise<FeatureAssembly> => {
    const response = await api.post(`/factory/assemblies/${id}/rollback`);
    return response.data.data;
};

export const revertToDraft = async (id: string): Promise<FeatureAssembly> => {
    const response = await api.post(`/factory/assemblies/${id}/revert`);
    return response.data.data;
};

// ============================================
// HELPERS
// ============================================

export const PART_TYPE_LABELS: Record<PartType, string> = {
    FULLSTACK: 'FullStack',
    WIDGET: 'Widget',
    FORM_INPUT: 'Form Input',
};

export const CATEGORY_LABELS: Record<PartCategory, string> = {
    SPORT: 'Sport',
    ADMIN: 'Admin',
    COMMERCE: 'Commerce',
    FOUNDATION: 'Foundation',
};

export const STATUS_LABELS: Record<AssemblyStatus, string> = {
    DRAFT: 'Draft',
    TESTING: 'Testing',
    APPROVED: 'Approved',
    DEPLOYED: 'Deployed',
};

export const ROLE_OPTIONS = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'PERPANI', label: 'Perpani' },
    { value: 'CLUB', label: 'Club' },
    { value: 'SCHOOL', label: 'School' },
    { value: 'ATHLETE', label: 'Athlete' },
    { value: 'PARENT', label: 'Parent' },
    { value: 'COACH', label: 'Coach' },
    { value: 'JUDGE', label: 'Judge' },
    { value: 'EO', label: 'Event Organizer' },
    { value: 'SUPPLIER', label: 'Supplier' },
    { value: 'MANPOWER', label: 'Manpower' },
];
