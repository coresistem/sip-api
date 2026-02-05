
export interface AthleteDomain {
    id: string;
    userId: string;
    clubId?: string | null;
    coreId?: string | null;
    name: string;
}

export interface AthleteRepositoryPort {
    findByUserId(userId: string): Promise<AthleteDomain | null>;
    findById(id: string): Promise<AthleteDomain | null>;
}
