import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Types
export type Role = 'SUPER_ADMIN' | 'PERPANI' | 'CLUB' | 'SCHOOL' | 'ATHLETE' | 'PARENT' | 'COACH' | 'JUDGE' | 'EO' | 'SUPPLIER' | 'MANPOWER';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    clubId: string | null;
    clubName?: string;
    avatarUrl?: string;
    athleteId?: string;
    provinceId?: string;
    cityId?: string;
    whatsapp?: string;
    phone?: string;
    coreId?: string;
    nik?: string;
    nikVerified?: boolean;
    isStudent?: boolean;
    isActive?: boolean;
    // Multi-role fields
    roles?: string; // JSON string from backend
    activeRole?: Role;
    coreIds?: string; // JSON string
    roleStatuses?: string; // JSON string
}

interface AuthContextType {
    user: User | null;
    originalUser: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    selfRegister: (data: SelfRegisterData) => Promise<{ message: string; user: any }>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    activeRole: Role | null;
    switchRole: (role: Role) => void;
    simulatedRole: Role | null;
    setSimulatedRole: (role: Role | null) => void;
    simulatedCoreId: string | null;
    setSimulatedCoreId: (coreId: string | null) => void;
}

interface SelfRegisterData {
    email: string;
    password: string;
    name: string;
    phone: string;
    clubId: string;
}
interface RegisterData {
    email: string;
    password: string;
    name: string;
    role?: Role;
    provinceId?: string;
    cityId?: string;
    whatsapp?: string;
    childId?: string;
    refAthleteId?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// API base URL
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Axios instance with interceptors
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                    const { accessToken } = response.data.data;

                    localStorage.setItem('accessToken', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // We don't force a reload here, as the checkAuth effect or Router guards
                // will handle the redirection once they detect the missing tokens.
            }
        }

        return Promise.reject(error);
    }
);

export { api };

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeRole, setActiveRole] = useState<Role | null>(null); // For multi-role users
    const [simulatedRole, setSimulatedRole] = useState<Role | null>(null);
    const [simulatedCoreId, setSimulatedCoreId] = useState<string | null>(null);
    const [simulatedUserData, setSimulatedUserData] = useState<User | null>(null);

    // switchRole: Updates the active context for multi-role users
    const switchRole = async (role: Role) => {
        try {
            const response = await api.patch('/auth/switch-role', { role });
            const { accessToken, refreshToken, activeRole: newActiveRole } = response.data.data;

            // Update tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Update state
            setActiveRole(newActiveRole);
            localStorage.setItem('lastActiveRole', newActiveRole);

            // Force reload user profile to ensure consistency with new token
            // This ensures all derived data (like clubId or other role-specific fields) is correct
            await refreshAuth();

            toast.success(`Role switched to ${role}`);
        } catch (error: any) {
            console.error('Failed to switch role:', error);
            toast.error(error.response?.data?.message || 'Failed to switch role');
        }
    };

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');

            // Critical Fix: If no token, immediately stop loading
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/me');
                const userData = response.data.data;
                setUser(userData);

                // Initialize activeRole
                if (userData.activeRole) {
                    setActiveRole(userData.activeRole);
                } else {
                    try {
                        const savedRole = localStorage.getItem('lastActiveRole') as Role;
                        if (savedRole && userData.roles) {
                            const roles = typeof userData.roles === 'string' ? JSON.parse(userData.roles) : userData.roles;
                            if (roles.includes(savedRole) || userData.role === savedRole) {
                                setActiveRole(savedRole);
                            }
                        }
                    } catch (e) {
                        console.error('Failed to parse roles', e);
                    }
                }
                if (userData.manpowerShortcuts) {
                    localStorage.setItem('core_manpower_shortcuts', JSON.stringify(userData.manpowerShortcuts));
                } else {
                    localStorage.removeItem('core_manpower_shortcuts');
                }
            } catch (error: any) {
                console.error('Auth check failed:', error);

                // Surgical Fix: Handle 401 or any error by clearing state explicitly
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
                setActiveRole(null);
            } finally {
                // REQUIRED: Always turn off loading
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Fetch simulated user data when role or CoreID changes
    useEffect(() => {
        const fetchSimulatedUser = async () => {
            if (user?.role === 'SUPER_ADMIN') {
                try {
                    if (simulatedCoreId) {
                        // Priority 1: Simulate by CoreID
                        const response = await api.get(`/auth/simulate-user/${simulatedCoreId}`);
                        setSimulatedUserData(response.data.data);
                        // Also update simulatedRole to match the fetched user's role for UI consistency
                        setSimulatedRole(response.data.data.role);
                    } else if (simulatedRole) {
                        // Priority 2: Simulate by Role (First user found)
                        const response = await api.get(`/auth/simulate/${simulatedRole}`);
                        setSimulatedUserData(response.data.data);
                    } else {
                        setSimulatedUserData(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch simulated user data:', error);
                    setSimulatedUserData(null);
                }
            } else {
                setSimulatedUserData(null);
            }
        };

        fetchSimulatedUser();
    }, [simulatedRole, simulatedCoreId, user?.role]);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { user: userData, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
        if (userData.activeRole) {
            setActiveRole(userData.activeRole);
        } else {
            setActiveRole(userData.role);
        }
        if (userData.manpowerShortcuts) {
            localStorage.setItem('core_manpower_shortcuts', JSON.stringify(userData.manpowerShortcuts));
        } else {
            localStorage.removeItem('core_manpower_shortcuts');
        }
    };

    const register = async (data: RegisterData) => {
        const response = await api.post('/auth/register', data);
        const { user: userData, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
        setActiveRole(userData.role);
    };

    const selfRegister = async (data: SelfRegisterData) => {
        const response = await api.post('/auth/self-register', data);
        return {
            message: response.data.message,
            user: response.data.data.user
        };
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await api.post('/auth/logout', { refreshToken });
        } catch {
            // Ignore errors during logout
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('lastActiveRole');
            setUser(null);
            setActiveRole(null);
            setSimulatedRole(null);
            setSimulatedCoreId(null);
            setSimulatedUserData(null);
            window.location.href = '/';
        }
    };

    const refreshAuth = async () => {
        try {
            const response = await api.get('/auth/me');
            const userData = response.data.data;
            setUser(userData);
            if (userData.activeRole) {
                setActiveRole(userData.activeRole);
            }
            if (userData.manpowerShortcuts) {
                localStorage.setItem('core_manpower_shortcuts', JSON.stringify(userData.manpowerShortcuts));
            } else {
                localStorage.removeItem('core_manpower_shortcuts');
            }
        } catch {
            setUser(null);
            setActiveRole(null);
        }
    };

    // Construct the effectively displayed user (simulated OR active role)
    const displayedUser = useMemo(() => {
        if (!user) return null;

        // 1. Handle Simulation (Super Admin Only)
        if (user.role === 'SUPER_ADMIN') {
            // Priority 1: Simulate by CoreID (Specific User)
            if (simulatedCoreId && simulatedUserData) {
                // When simulating a SPECIFIC user by ID, we use their REAL role.
                // We MUST ignore simulatedRole here to prevent "Andi (Athlete) appearing as Supplier" bug.
                return simulatedUserData;
            }

            // Priority 2: Simulate by Generic Role (First user found for that role)
            if (simulatedRole) {
                if (simulatedUserData) {
                    return simulatedUserData;
                }
                // Fallback to me but with different role permissions
                return { ...user, role: simulatedRole };
            }
        }

        // 2. Handle Active Role Switching (Multi-role users)
        if (activeRole && activeRole !== user.role) {
            let currentCoreId = user.coreId;
            try {
                if (user.coreIds) {
                    const coreIdsMap = JSON.parse(user.coreIds);
                    if (coreIdsMap[activeRole]) {
                        currentCoreId = coreIdsMap[activeRole];
                    }
                }
            } catch (e) {
                console.error('Failed to parse coreIds', e);
            }
            return { ...user, role: activeRole, coreId: currentCoreId };
        }

        // 3. Default User State
        return user;
    }, [user, simulatedRole, simulatedCoreId, simulatedUserData, activeRole]);

    return (
        <AuthContext.Provider
            value={{
                user: displayedUser,
                originalUser: user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                selfRegister,
                logout,
                refreshAuth,
                activeRole,
                switchRole,
                simulatedRole,
                setSimulatedRole,
                simulatedCoreId,
                setSimulatedCoreId,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
