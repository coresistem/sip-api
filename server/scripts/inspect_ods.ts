
import XLSX from 'xlsx';
import path from 'path';

const filePath = 'd:/Antigravity/sip/hdd/TOAC24.ods';

try {
    console.log(`Reading file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);

    console.log('Sheet Names:', workbook.SheetNames);

    // Look for Qualification sheets (usually ending in Q_I or similar)
    const qualSheets = workbook.SheetNames.filter(name => /.*Q_I$/.test(name) || name.includes('Qual'));

    if (qualSheets.length > 0) {
        const sheetName = qualSheets[0];
        console.log(`\nInspecting Sheet: ${sheetName}`);
        const sheet = workbook.Sheets[sheetName];

        // Get range
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:H1');
        console.log(`Range: ${sheet['!ref']}`);

        // Read first 10 rows
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: null }).slice(0, 10);

        console.log('\n--- HEADERS (Row 0) ---');
        const header = rows[0] || [];
        header.forEach((val: any, i: number) => console.log(`[${i}] ${val}`));

        console.log('\n--- SAMPLE DATA (Row 1) ---');
        const sample = rows[1] || [];
        sample.forEach((val: any, i: number) => console.log(`[${i}] ${val}`));
    } else {
        console.log('No Qualification sheets found (ending in Q_I). Dumping first sheet...');
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 5);
        console.log(rows);
    }

} catch (error) {
    console.error('Error reading ODS:', error);
}
