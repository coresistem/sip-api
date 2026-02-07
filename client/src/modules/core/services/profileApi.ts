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
    coreId?: string;
    whatsapp?: string;
    provinceId?: string;
    cityId?: string;
    nik?: string;
    nikVerified?: boolean;
    isStudent?: boolean;
    dateOfBirth?: string;
    gender?: string;
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
    dateOfBirth?: string;
    gender?: string;
    isStudent?: boolean;
    occupation?: string;
    athleteData?: AthleteData;
    clubData?: ClubData;
    studentData?: StudentData;
    clubId?: string; // For requesting to join a club
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

/**
 * Request to join a club
 */
export const joinClub = async (clubId: string): Promise<boolean> => {
    const response = await api.post('/profile/join-club', { clubId });
    return response.data.success;
};

export type ClubMembershipStatus = 'NO_CLUB' | 'PENDING' | 'MEMBER' | 'LEFT';

export interface ClubStatusResponse {
    status: ClubMembershipStatus;
    club: {
        id: string;
        name: string;
        city: string;
        logoUrl?: string | null;
    } | null;
    pendingRequest: {
        id: string;
        club: {
            id: string;
            name: string;
            city: string;
            logoUrl?: string | null;
        };
        createdAt: string;
        updatedAt: string;
    } | null;
    leftAt: string | null;
    lastClub: {
        id: string;
        name: string;
        city: string;
        logoUrl?: string | null;
    } | null;
    athleteStatuses?: {
        athleteId: string;
        athleteName: string;
        status: ClubMembershipStatus;
        club: {
            id: string;
            name: string;
            city: string;
            logoUrl?: string | null;
        } | null;
        pendingRequest: {
            id: string;
            club: {
                id: string;
                name: string;
                city: string;
                logoUrl?: string | null;
            };
            createdAt: string;
            updatedAt: string;
        } | null;
        leftAt: string | null;
        lastClub: {
            id: string;
            name: string;
            city: string;
            logoUrl?: string | null;
        } | null;
    }[];
}

export const getClubStatus = async (): Promise<ClubStatusResponse> => {
    const response = await api.get('/profile/club-status');
    return response.data.data;
};

export interface ClubHistoryItem {
    clubId: string;
    clubName: string;
    city: string;
    joinDate: string;
    status: string;
}

export const getClubHistory = async (): Promise<ClubHistoryItem[]> => {
    const response = await api.get('/profile/club-history');
    return response.data.data;
};

/**
 * Update a linked child's profile (Parent role only)
 */
export const updateChildProfile = async (athleteId: string, data: { nik?: string; whatsapp?: string; clubId?: string }): Promise<boolean> => {
    const response = await api.put(`/profile/child/${athleteId}`, data);
    return response.data.success;
};
