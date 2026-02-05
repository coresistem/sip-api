
export interface UserDomain {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: string;
    coreId?: string | null;
    clubId?: string | null;
    isActive: boolean;
    avatarUrl?: string | null;
    roles?: any;
    activeRole?: string | null;
    coreIds?: any;
    roleStatuses?: any;
}

export interface UserRepositoryPort {
    findByEmail(email: string): Promise<UserDomain | null>;
    findById(id: string): Promise<UserDomain | null>;
    create(user: Omit<UserDomain, 'id' | 'isActive'>): Promise<UserDomain>;
    updateLastLogin(id: string): Promise<void>;
    updatePassword(id: string, passwordHash: string): Promise<void>;
}
