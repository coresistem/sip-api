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
    sipId?: string;
    nik?: string;
    nikVerified?: boolean;
    isStudent?: boolean;
    isActive?: boolean;
    // Multi-role fields
    roles?: string; // JSON string from backend
    activeRole?: Role;
    sipIds?: string; // JSON string
    roleStatuses?: string; // JSON string
}

interface AuthContextType {
    user: User | null;
    originalUser: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    activeRole: Role | null;
    switchRole: (role: Role) => void;
    simulatedRole: Role | null;
    setSimulatedRole: (role: Role | null) => void;
    simulatedSipId: string | null;
    setSimulatedSipId: (sipId: string | null) => void;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
    role?: Role;
    provinceId?: string;
    cityId?: string;
    whatsapp?: string;
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
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Do NOT force reload to avoid infinite loops
                // window.location.href = '/login'; 
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
    const [simulatedSipId, setSimulatedSipId] = useState<string | null>(null);
    const [simulatedUserData, setSimulatedUserData] = useState<User | null>(null);

    // switchRole: Updates the active context for multi-role users
    const switchRole = async (role: Role) => {
        try {
            await api.patch('/auth/switch-role', { role });
            setActiveRole(role);
            localStorage.setItem('lastActiveRole', role);
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

    // Fetch simulated user data when role or SIP ID changes
    useEffect(() => {
        const fetchSimulatedUser = async () => {
            if (user?.role === 'SUPER_ADMIN') {
                try {
                    if (simulatedSipId) {
                        // Priority 1: Simulate by SIP ID
                        const response = await api.get(`/auth/simulate-user/${simulatedSipId}`);
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
    }, [simulatedRole, simulatedSipId, user?.role]);

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
    };

    const register = async (data: RegisterData) => {
        const response = await api.post('/auth/register', data);
        const { user: userData, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
        setActiveRole(userData.role);
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
            setSimulatedSipId(null);
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
            // Priority 1: Simulate by SIP ID (Specific User)
            if (simulatedSipId && simulatedUserData) {
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
            let currentSipId = user.sipId;
            try {
                if (user.sipIds) {
                    const sipIdsMap = JSON.parse(user.sipIds);
                    if (sipIdsMap[activeRole]) {
                        currentSipId = sipIdsMap[activeRole];
                    }
                }
            } catch (e) {
                console.error('Failed to parse sipIds', e);
            }
            return { ...user, role: activeRole, sipId: currentSipId };
        }

        // 3. Default User State
        return user;
    }, [user, simulatedRole, simulatedSipId, simulatedUserData, activeRole]);

    return (
        <AuthContext.Provider
            value={{
                user: displayedUser,
                originalUser: user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshAuth,
                activeRole,
                switchRole,
                simulatedRole,
                setSimulatedRole,
                simulatedSipId,
                setSimulatedSipId,
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
