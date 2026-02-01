export interface CompetitionCategoryItem {
    id: string;
    division: string;
    ageClass: string;
    gender: string;
    distance: string;
    quota: number;
    fee: number;
    qInd: boolean;
    eInd: boolean;
    qTeam: boolean;
    eTeam: boolean;
    qMix: boolean;
    eMix: boolean;
    isSpecial: boolean;
    categoryLabel: string;
}

export interface EventForm {
    name: string;
    level: 'CLUB' | 'CITY' | 'PROVINCE' | 'NATIONAL' | 'INTERNATIONAL';
    type: 'INTERNAL' | 'SELECTION' | 'OPEN';
    fieldType: 'OUTDOOR' | 'INDOOR';
    startDate: Date | null;
    endDate: Date | null;
    registrationDeadline: Date | null;
    venue: string;
    address: string;
    city: string;
    province: string;
    country: string;
    latitude?: number;
    longitude?: number;
    competitionCategories: CompetitionCategoryItem[];
    description: string;
    rules: string;
    // Registration Details
    currency: string;
    feeIndividual: number;
    feeTeam: number;
    feeMixTeam: number;
    feeOfficial: number;
    instagram: string;
    website: string;
    technicalHandbook?: string | File | null;
    eFlyer?: string | File | null;
}
