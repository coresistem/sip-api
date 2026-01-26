/**
 * Profile API Service
 * Handles profile CRUD operations
 */
import { api } from '../contexts/AuthContext';

// Types
export interface ProfileData {
    user: UserProfile;
    roleData: any;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
    sipId?: string;
    whatsapp?: string;
    provinceId?: string;
    cityId?: string;
    nik?: string;
    nikVerified?: boolean;
    isStudent?: boolean;
    clubId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileData {
    name?: string;
    phone?: string;
    whatsapp?: string;
    provinceId?: string;
    cityId?: string;
    nik?: string;
    isStudent?: boolean;
    athleteData?: AthleteData;
    clubData?: ClubData;
    studentData?: StudentData;
}

export interface StudentData {
    schoolId?: string;
    nisn?: string;
    currentClass?: string;
    schoolSourceUrl?: string;
}

export interface AthleteData {
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE';
    archeryCategory?: string;
    division?: string;
    skillLevel?: string;
    height?: number;
    weight?: number;
    armSpan?: number;
    drawLength?: number;
    dominantHand?: string;
    dominantEye?: string;
    bowBrand?: string;
    bowModel?: string;
    bowDrawWeight?: number;
    arrowBrand?: string;
    arrowSpine?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    medicalNotes?: string;
}

export interface ClubData {
    name?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    whatsappHotline?: string;
    instagram?: string;
}

/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<ProfileData> => {
    const response = await api.get('/profile');
    return response.data.data;
};

/**
 * Update current user's profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<ProfileData> => {
    const response = await api.put('/profile', data);
    return response.data.data;
};

/**
 * Get a specific user's profile (admin only)
 */
export const getUserProfile = async (userId: string): Promise<{ user: UserProfile }> => {
    const response = await api.get(`/profile/${userId}`);
    return response.data.data;
};

/**
 * Update avatar URL
 */
export const updateAvatar = async (avatarUrl: string): Promise<{ id: string; avatarUrl: string }> => {
    const response = await api.post('/profile/avatar', { avatarUrl });
    return response.data.data;
};
