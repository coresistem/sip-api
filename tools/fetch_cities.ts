
import https from 'https';
import fs from 'fs';

const url = 'https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/regencies.json';

function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
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
    return toTitleCase(processed);
}

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const regencies = JSON.parse(data);
        const cities = regencies.map((r: any) => ({
            id: r.id,
            provinceId: r.province_id,
            name: processName(r.name)
        }));

        const output = `export const CITIES: City[] = [
${cities.map((c: any) => `    { id: '${c.id}', provinceId: '${c.provinceId}', name: '${c.name}' },`).join('\n')}
];`;

        console.log('Successfully generated cities list.');
        fs.writeFileSync('d:\\Antigravity\\sip\\client\\src\\types\\cities_generated.ts', output);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
