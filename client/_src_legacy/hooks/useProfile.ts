/**
 * useProfile Hook
 * Manages profile data fetching, updating, and state
 */
import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile, UpdateProfileData, ProfileData } from '../services/profileApi';

interface UseProfileReturn {
    profile: ProfileData | null;
    isLoading: boolean;
    error: string | null;
    isSaving: boolean;
    saveError: string | null;
    refreshProfile: () => Promise<void>;
    saveProfile: (data: UpdateProfileData) => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Fetch profile on mount
    const fetchProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getProfile();
            setProfile(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load profile');
            console.error('Profile fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Save profile updates
    const saveProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
        try {
            setIsSaving(true);
            setSaveError(null);
            const updated = await updateProfile(data);
            setProfile(updated);
            return true;
        } catch (err: any) {
            setSaveError(err.response?.data?.message || 'Failed to save profile');
            console.error('Profile save error:', err);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    // Refresh profile data
    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        isLoading,
        error,
        isSaving,
        saveError,
        refreshProfile,
        saveProfile,
    };
}
