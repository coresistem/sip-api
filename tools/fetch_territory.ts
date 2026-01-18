
import https from 'https';
import fs from 'fs';

const provincesUrl = 'https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/provinces.json';
const regenciesUrl = 'https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/regencies.json';

function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function processName(name: string): string {
    let processed = name.toUpperCase();
    if (processed.startsWith('KABUPATEN ')) {
        processed = processed.replace('KABUPATEN ', '');
        return 'Kab. ' + toTitleCase(processed);
    } else if (processed.startsWith('KOTA ')) {
        processed = processed.replace('KOTA ', '');
        return 'Kota ' + toTitleCase(processed);
    }
    return toTitleCase(processed); // Province names generally just need Title Case
}

function fetchJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    try {
        const [provinces, regencies] = await Promise.all([
            fetchJson(provincesUrl),
            fetchJson(regenciesUrl)
        ]);

        const provincesProcessed = provinces.map((p: any) => ({
            id: p.id,
            name: toTitleCase(p.name)
        }));

        const citiesProcessed = regencies.map((r: any) => ({
            id: r.id,
            provinceId: r.province_id,
            name: processName(r.name)
        }));

        const output = `// Indonesia Territory Data - Provinces and Cities
// Generated from yusufsyaifudin/wilayah-indonesia repository

import { Province, City } from './territory';

export const PROVINCES: Province[] = [
${provincesProcessed.map((p: any) => `    { id: '${p.id}', name: '${p.name}' },`).join('\n')}
];

export const CITIES: City[] = [
${citiesProcessed.map((c: any) => `    { id: '${c.id}', provinceId: '${c.provinceId}', name: '${c.name}' },`).join('\n')}
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

        fs.writeFileSync('d:\\Antigravity\\sip\\client\\src\\types\\territoryData_generated.ts', output);
        console.log('Successfully generated full territory data.');

    } catch (err) {
        console.error('Failed:', err);
    }
}

main();
