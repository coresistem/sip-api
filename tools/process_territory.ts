
import fs from 'fs';
import path from 'path';

const csvPath = path.join(__dirname, 'territory_input.csv');
const outputPath = 'd:\\Antigravity\\sip\\client\\src\\types\\territoryData_custom.ts';

interface SimpleProvince {
    id: string;
    name: string;
}

interface SimpleCity {
    id: string;
    provinceId: string;
    name: string;
}

function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => {
        // Handle "Kab.", "Kota", "Adm.", "Kep." etc specifically if needed, but standard title case is usually fine
        // for "Dki Jakarta" vs "DKI Jakarta", maybe I should keep user casing for known abbreviations?
        // User provided: "11,Aceh,..." "31,Dki Jakarta,..."
        // I will trust the user provided casing mostly, but clean up if needed.
        // Actually, user provided "Dki Jakarta". I'll keep it or fix "Dki" -> "DKI"?
        // Let's stick to the input as source of truth to respect their "Code".
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function main() {
    const rawData = fs.readFileSync(csvPath, 'utf8');
    const lines = rawData.split('\n').filter(line => line.trim().length > 0);

    const provincesMap = new Map<string, string>();
    const cities: SimpleCity[] = [];

    lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 4) {
            const provinceId = parts[0];
            const provinceName = parts[1];
            const citySuffix = parts[2];
            const cityName = parts[3];

            // Add Province if not exists
            if (!provincesMap.has(provinceId)) {
                provincesMap.set(provinceId, provinceName);
            }

            // Create City ID (ProvinceID + CitySuffix)
            // Ensure no duplicate slashes or anything. Just concat.
            const cityId = provinceId + citySuffix;

            cities.push({
                id: cityId,
                provinceId: provinceId,
                name: cityName
            });
        }
    });

    // Convert Map to Array and Sort by ID numerical
    const provinces = Array.from(provincesMap.entries()).map(([id, name]) => ({ id, name }));
    provinces.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    // Sort cities by ID
    cities.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    const fileContent = `// Indonesia Territory Data - Custom Source
// Generated from user provided CSV list

import { Province, City } from './territory';

export const PROVINCES: Province[] = [
${provinces.map(p => `    { id: '${p.id}', name: '${p.name}' },`).join('\n')}
];

export const CITIES: City[] = [
${cities.map(c => `    { id: '${c.id}', provinceId: '${c.provinceId}', name: '${c.name}' },`).join('\n')}
];

// Helper to get cities by province
export function getCitiesByProvince(provinceId: string): City[] {
    return CITIES.filter(city => city.provinceId === provinceId);
}

// Helper to get province by ID
export function getProvinceById(id: string): Province | undefined {
    return PROVINCES.find(p => p.id === id);
}

// Helper to get city by ID
export function getCityById(id: string): City | undefined {
    return CITIES.find(c => c.id === id);
}
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully processed territory data. Provinces: ${provinces.length}, Cities: ${cities.length}`);
}

main();
