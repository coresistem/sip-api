import { api } from '../context/AuthContext';

// ===========================================
// TYPES
// ===========================================

export interface ModuleField {
    id: string;
    moduleId: string;
    sectionName: string;
    fieldName: string;
    fieldType: 'checkbox' | 'text' | 'number' | 'select' | 'date' | 'file' | 'signature' | 'textarea';
    label: string;
    placeholder?: string;
    isRequired: boolean;
    minValue?: number;
    maxValue?: number;
    options?: string[] | { label: string; value: string }[];
    isScored: boolean;
    maxScore: number;
    feedbackGood?: string;
    feedbackBad?: string;
    sortOrder: number;
    helpText?: string;
    createdAt: string;
}

export interface CustomModule {
    id: string;
    sipId: string;
    name: string;
    description?: string;
    icon?: string;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    version: number;
    createdById: string;
    allowedRoles: string[];
    showInMenu: boolean;
    menuCategory?: string;
    createdAt: string;
    updatedAt: string;
    fieldsCount?: number;
    assessmentsCount?: number;
    fields?: ModuleField[];
    sections?: Record<string, ModuleField[]>;
}

export interface AssessmentRecord {
    id: string;
    assessmentNo: string;
    moduleId: string;
    athleteId: string;
    assessedById: string;
    fieldValues: Record<string, boolean | string | number>;
    sectionScores: Record<string, number>;
    totalScore: number;
    aiFeedback?: string;
    coachNotes?: string;
    assessmentType: 'PRE_TEST' | 'POST_TEST' | 'ASSESSMENT';
    coachSignature?: string;
    assessmentDate: string;
    status: 'DRAFT' | 'COMPLETED' | 'REVIEWED';
    module?: CustomModule;
    athlete?: {
        id: string;
        user: { id: string; name: string; email: string };
    };
    fieldFeedback?: Record<string, { checked: boolean; feedback: string }>;
}

export interface CreateModuleData {
    name: string;
    description?: string;
    icon?: string;
    allowedRoles?: string[];
    menuCategory?: string;
}

export interface CreateFieldData {
    sectionName: string;
    fieldName: string;
    fieldType: string;
    label: string;
    placeholder?: string;
    isRequired?: boolean;
    minValue?: number;
    maxValue?: number;
    options?: string[] | { label: string; value: string }[];
    isScored?: boolean;
    maxScore?: number;
    feedbackGood?: string;
    feedbackBad?: string;
    helpText?: string;
}

export interface CreateAssessmentData {
    moduleId: string;
    athleteId: string;
    fieldValues: Record<string, boolean | string | number>;
    sectionScores?: Record<string, number>;
    totalScore?: number;
    assessmentType?: 'PRE_TEST' | 'POST_TEST' | 'ASSESSMENT';
    coachNotes?: string;
    assessmentDate?: string;
}

// ===========================================
// MODULE API
// ===========================================

export const listModules = async (status?: string, category?: string): Promise<CustomModule[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);

    const response = await api.get(`/modules?${params.toString()}`);
    return response.data.data;
};

export const getModule = async (id: string): Promise<CustomModule> => {
    const response = await api.get(`/modules/${id}`);
    return response.data.data;
};

export const createModule = async (data: CreateModuleData): Promise<CustomModule> => {
    const response = await api.post('/modules', data);
    return response.data.data;
};

export const updateModule = async (id: string, data: Partial<CreateModuleData & { status: string; showInMenu: boolean }>): Promise<CustomModule> => {
    const response = await api.put(`/modules/${id}`, data);
    return response.data.data;
};

export const deleteModule = async (id: string): Promise<void> => {
    await api.delete(`/modules/${id}`);
};

// ===========================================
// FIELD API
// ===========================================

export const addField = async (moduleId: string, data: CreateFieldData): Promise<ModuleField> => {
    const response = await api.post(`/modules/${moduleId}/fields`, data);
    return response.data.data;
};

export const updateField = async (moduleId: string, fieldId: string, data: Partial<CreateFieldData>): Promise<ModuleField> => {
    const response = await api.put(`/modules/${moduleId}/fields/${fieldId}`, data);
    return response.data.data;
};

export const deleteField = async (moduleId: string, fieldId: string): Promise<void> => {
    await api.delete(`/modules/${moduleId}/fields/${fieldId}`);
};

// ===========================================
// ASSESSMENT API
// ===========================================

export const listAssessments = async (filters?: { athleteId?: string; moduleId?: string; limit?: number }): Promise<AssessmentRecord[]> => {
    const params = new URLSearchParams();
    if (filters?.athleteId) params.append('athleteId', filters.athleteId);
    if (filters?.moduleId) params.append('moduleId', filters.moduleId);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/assessments?${params.toString()}`);
    return response.data.data;
};

export const getAssessment = async (id: string): Promise<AssessmentRecord> => {
    const response = await api.get(`/assessments/${id}`);
    return response.data.data;
};

export const createAssessment = async (data: CreateAssessmentData): Promise<AssessmentRecord> => {
    const response = await api.post('/assessments', data);
    return response.data.data;
};

export const generateFeedback = async (assessmentId: string): Promise<{ feedback: string }> => {
    const response = await api.post(`/assessments/${assessmentId}/feedback`);
    return response.data.data;
};
