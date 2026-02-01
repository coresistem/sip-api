import { EventForm } from './types';

export const INITIAL_FORM: EventForm = {
    name: '',
    level: 'CLUB',
    type: 'OPEN',
    fieldType: 'OUTDOOR',
    startDate: null,
    endDate: null,
    registrationDeadline: null,
    venue: '',
    address: '',
    city: '',
    province: '',
    country: 'Indonesia',
    competitionCategories: [],
    description: '',
    rules: '',
    currency: 'IDR',
    feeIndividual: 0,
    feeTeam: 0,
    feeMixTeam: 0,
    feeOfficial: 0,
    instagram: '',
    website: '',
};

export const CATEGORY_DIVISIONS = ['Recurve', 'Compound', 'Barebow', 'Nasional', 'Traditional'];
export const AGE_CLASSES = ['U10', 'U13', 'U15', 'U18', 'U21', 'Senior', 'Master (50+)'];
export const GENDERS = ['Man', 'Woman'];
export const DISTANCES = ['90m', '70m', '60m', '50m', '40m', '30m', '25m', '20m', '18m', '15m', '10m', '5m'];
