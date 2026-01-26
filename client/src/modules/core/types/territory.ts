// Territory Types for SIP - Indonesia Province and City Codes

export interface Province {
    id: string;      // 2-digit code, e.g., "31"
    name: string;    // e.g., "DKI Jakarta"
}

export interface City {
    id: string;       // 4-digit code (province + city), e.g., "3174"
    provinceId: string;
    name: string;     // e.g., "Jakarta Selatan"
}

// Role codes for SIP ID generation
export const ROLE_CODES: Record<string, string> = {
    'SUPER_ADMIN': '00',
    'PERPANI': '01',
    'CLUB': '02',
    'SCHOOL': '03',
    'ATHLETE': '04',
    'PARENT': '05',
    'COACH': '06',
    'JUDGE': '07',
    'EO': '08',
    'SUPPLIER': '09',
    'GUEST': '99',
};

export const ROLE_CODE_TO_NAME: Record<string, string> = {
    '00': 'Super Admin',
    '01': 'Perpani',
    '02': 'Club',
    '03': 'School',
    '04': 'Athlete',
    '05': 'Parent',
    '06': 'Coach',
    '07': 'Judge',
    '08': 'Event Organizer',
    '09': 'Supplier',
    '99': 'Guest',
};

// Helper function to generate SIP ID
export function generateSipId(roleCode: string, provinceId: string, cityCode: string, serialNumber: number): string {
    const serial = serialNumber.toString().padStart(4, '0');
    return `${roleCode}.${provinceId}${cityCode}.${serial}`;
}

// Parse SIP ID into components
export function parseSipId(sipId: string): { roleCode: string; provinceId: string; cityCode: string; serial: string } | null {
    const match = sipId.match(/^(\d{2})\.(\d{2})(\d{2})\.(\d{4})$/);
    if (!match) return null;
    return {
        roleCode: match[1],
        provinceId: match[2],
        cityCode: match[3],
        serial: match[4],
    };
}
