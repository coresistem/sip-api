
export interface ScoringRecordDomain {
    id: string;
    athleteId: string;
    coachId?: string | null;
    scheduleId?: string | null;
    sessionDate: Date;
    sessionType: string;
    distance: number;
    targetFace?: string | null;
    arrowScores: string; // JSON string
    totalSum: number;
    arrowCount: number;
    average: number;
    tensCount: number;
    xCount: number;
    notes?: string | null;
    weatherCondition?: string | null;
    competitionId?: string | null;
    categoryId?: string | null;
    isVerified: boolean;
}

export interface ScoringRepositoryPort {
    create(data: Omit<ScoringRecordDomain, 'id' | 'isVerified'>): Promise<ScoringRecordDomain>;
    findById(id: string): Promise<ScoringRecordDomain | null>;
    updateVerification(id: string, isVerified: boolean, coachId: string): Promise<ScoringRecordDomain>;
    findMany(filter: any, skip: number, take: number): Promise<[ScoringRecordDomain[], number]>;
    findByAthleteId(athleteId: string, limit: number): Promise<ScoringRecordDomain[]>;
}
