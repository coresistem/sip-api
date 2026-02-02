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
    locationUrl: '',
    description: '',
    rules: '',
    maxParticipants: 500,
    status: 'DRAFT',
    competitionCategories: [],
    currency: 'IDR',
    feeIndividual: 0,
    feeTeam: 0,
    feeMixTeam: 0,
    feeOfficial: 0,
    instagram: '',
    website: '',
};

export const CATEGORY_DIVISIONS = ['RECURVE', 'COMPOUND', 'BAREBOW', 'STANDARD', 'TRADITIONAL'];
export const AGE_CLASSES = ['U9', 'U10', 'U13', 'U15', 'U18', 'U21', 'Senior', 'Master (50+)', 'Open'];
export const GENDERS = ['MALE', 'FEMALE', 'MIXED'];
export const DISTANCES = ['90m', '70m', '60m', '50m', '40m', '30m', '25m', '20m', '18m', '15m', '10m', '5m'];

export const CATEGORY_TEMPLATES = [
    {
        label: 'Recurve Senior (WA 70m)',
        division: 'RECURVE',
        ageClass: 'Senior',
        gender: 'MALE',
        distance: '70m',
        qInd: true,
        eInd: true,
        qTeam: true,
        eTeam: true,
        qMix: true,
        eMix: true
    },
    {
        label: 'Compound Senior (WA 50m)',
        division: 'COMPOUND',
        ageClass: 'Senior',
        gender: 'MALE',
        distance: '50m',
        qInd: true,
        eInd: true,
        qTeam: true,
        eTeam: true,
        qMix: true,
        eMix: true
    },
    {
        label: 'Barebow Senior (50m)',
        division: 'BAREBOW',
        ageClass: 'Senior',
        gender: 'MALE',
        distance: '50m',
        qInd: true,
        eInd: true,
        qTeam: true,
        eTeam: true,
        qMix: true,
        eMix: true
    },
    {
        label: 'Standard/Nasional U15 (30m)',
        division: 'STANDARD',
        ageClass: 'U15',
        gender: 'MALE',
        distance: '30m',
        qInd: true,
        eInd: true,
        qTeam: true,
        eTeam: true,
        qMix: true,
        eMix: true
    },
    {
        label: 'Recurve U18 (60m)',
        division: 'RECURVE',
        ageClass: 'U18',
        gender: 'MALE',
        distance: '60m',
        qInd: true,
        eInd: true,
        qTeam: true,
        eTeam: true,
        qMix: true,
        eMix: true
    }
];

export const SCHEDULE_TEMPLATES = [
    {
        label: 'Standard 1-Day Event',
        items: [
            { startTime: '08:00', endTime: '08:30', activity: 'Registration & Re-registration', notes: 'Check-in at Secretariat' },
            { startTime: '08:30', endTime: '09:00', activity: 'Opening Ceremony', notes: 'Speech by local officials' },
            { startTime: '09:00', endTime: '10:00', activity: 'Official Practice', notes: '3 ends of practice' },
            { startTime: '10:00', endTime: '12:00', activity: 'Qualification Session 1', notes: '36 arrows' },
            { startTime: '12:00', endTime: '13:00', activity: 'Break', notes: 'Lunch break' },
            { startTime: '13:00', endTime: '15:00', activity: 'Qualification Session 2', notes: '36 arrows' },
            { startTime: '15:00', endTime: '17:00', activity: 'Elimination Rounds', notes: 'Matches start' },
            { startTime: '17:00', endTime: '18:00', activity: 'Medal Ceremony', notes: 'Podium' }
        ]
    },
    {
        label: '2-Day Championship',
        items: [
            { startTime: '08:00', endTime: '09:00', activity: 'Day 1: Qualification Stage', notes: 'All categories' },
            { startTime: '09:00', endTime: '17:00', activity: 'Day 1: Ongoing Qualification', notes: 'Alternating sessions' },
            { startTime: '08:00', endTime: '16:00', activity: 'Day 2: Final Elimination Stage', notes: 'Bracket matches' },
            { startTime: '16:00', endTime: '18:00', activity: 'Day 2: Closing & Awards', notes: 'Final ceremony' }
        ]
    }
];
