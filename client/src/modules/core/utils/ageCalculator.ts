// Age Category Calculator for Athletes

export type UnderAgeCategory = 'U10' | 'U13' | 'U15' | 'U18' | 'U21' | 'Senior' | 'Master';

export function calculateUnderAgeCategory(dateOfBirth: Date | string): UnderAgeCategory {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    if (age < 10) return 'U10';
    if (age < 13) return 'U13';
    if (age < 15) return 'U15';
    if (age < 18) return 'U18';
    if (age < 21) return 'U21';
    if (age < 50) return 'Senior';
    return 'Master';
}

export function getAgeCategoryColor(category: UnderAgeCategory): string {
    const colors: Record<UnderAgeCategory, string> = {
        'U10': 'bg-pink-500/20 text-pink-400',
        'U13': 'bg-purple-500/20 text-purple-400',
        'U15': 'bg-blue-500/20 text-blue-400',
        'U18': 'bg-cyan-500/20 text-cyan-400',
        'U21': 'bg-green-500/20 text-green-400',
        'Senior': 'bg-amber-500/20 text-amber-400',
        'Master': 'bg-red-500/20 text-red-400',
    };
    return colors[category];
}

export function formatAge(dateOfBirth: Date | string): number {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    return age;
}
