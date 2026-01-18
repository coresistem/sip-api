import prisma from '../lib/prisma.js';

const ROLE_CODES: Record<string, string> = {
    'SUPER_ADMIN': '00',
    'PERPANI': '01',
    'CLUB_OWNER': '02',
    'SCHOOL': '03',
    'ATHLETE': '04',
    'PARENT': '05',
    'COACH': '06',
    'JUDGE': '07',
    'EO': '08',
    'SUPPLIER': '09',
    'MANPOWER': '10',
};

export const generateSipId = async (role: string, cityId: string = '0000'): Promise<string> => {
    const roleCode = ROLE_CODES[role] || '99'; // 99 for unknown

    // Ensure location code is 4 digits. If it's a real city ID (e.g. 3171), use it.
    // If invalid or empty, default to 0000.
    const locationCode = (cityId && cityId.length >= 2)
        ? cityId.replace(/\./g, '').padEnd(4, '0').substring(0, 4)
        : '0000';

    const prefix = `${roleCode}.${locationCode}.`;

    // Find the latest user with this prefix
    const lastUser = await prisma.user.findFirst({
        where: {
            sipId: {
                startsWith: prefix
            }
        },
        orderBy: {
            sipId: 'desc'
        },
        select: {
            sipId: true
        }
    });

    let sequence = 1;
    if (lastUser && lastUser.sipId) {
        const parts = lastUser.sipId.split('.');
        if (parts.length === 3) {
            const lastSeq = parseInt(parts[2], 10);
            if (!isNaN(lastSeq)) {
                sequence = lastSeq + 1;
            }
        }
    }

    const sequenceStr = sequence.toString().padStart(4, '0');
    return `${prefix}${sequenceStr}`;
};
