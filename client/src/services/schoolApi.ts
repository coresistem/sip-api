/**
 * School API Service
 * Handles school search and enrollment
 */
import { api } from '../context/AuthContext';

// Types
export interface School {
    id: string;
    sipId: string;
    npsn?: string;
    name: string;
    provinceId: string;
    cityId: string;
    address?: string;
    website?: string;
    sourceUrl?: string;
    status: string;
    _count?: {
        students: number;
    };
}

export interface SchoolSearchParams {
    query: string;
    provinceId?: string;
    limit?: number;
}

export interface UrlValidationResult {
    isValid: boolean;
    url?: string;
    npsn?: string;
    message: string;
}

export interface SchoolEnrollment {
    id: string;
    userId: string;
    schoolId: string;
    nisn?: string;
    currentClass?: string;
    status: string;
}

export interface ClaimSchoolData {
    schoolSipId: string;
    sourceUrl?: string;
    nisn?: string;
    currentClass?: string;
}

/**
 * Search schools in SIP database
 */
export const searchSchools = async (params: SchoolSearchParams): Promise<School[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', params.query);
    if (params.provinceId) queryParams.append('provinceId', params.provinceId);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/schools/search?${queryParams.toString()}`);
    return response.data.data;
};

/**
 * Get school by SIP ID
 */
export const getSchoolBySipId = async (sipId: string): Promise<School> => {
    const response = await api.get(`/schools/${sipId}`);
    return response.data.data;
};

/**
 * Validate Kemendikdasmen URL
 */
export const validateKemendikdasmenUrl = async (url: string): Promise<UrlValidationResult> => {
    const response = await api.post('/schools/validate-url', { url });
    return response.data.data;
};

/**
 * Claim school enrollment
 */
export const claimSchool = async (data: ClaimSchoolData): Promise<{ enrollment: SchoolEnrollment; school: School }> => {
    const response = await api.post('/schools/claim', data);
    return response.data.data;
};
