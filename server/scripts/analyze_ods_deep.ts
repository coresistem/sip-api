
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const filePath = 'D:/Antigravity/sip/hdd/TOAC24.ods';

function analyzeODS() {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    try {
        console.log(`\n=== Analyzing: ${filePath} ===`);
        const workbook = XLSX.readFile(filePath, { cellFormula: false });

        // Find all sheets that look like 'Individual Qualification' (usually ending in Q_I or similar)
        const qualSheets = workbook.SheetNames.filter(s => s.endsWith('Q_I') || s.includes('Qualification'));
        console.log('Qualification Sheets found:', qualSheets);

        if (qualSheets.length === 0) {
            console.warn('No Qualification sheets found matching pattern *Q_I');
            return;
        }

        // Analyze first 3 sheets to check consistency
        const sheetsToAnalyze = qualSheets.slice(0, 3);

        sheetsToAnalyze.forEach(sheetName => {
            console.log(`\n\n--- SHEET: ${sheetName} ---`);
            const sheet = workbook.Sheets[sheetName];
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: null });

            console.log('Total Rows:', rows.length);

            // 1. Scan for Header Row (Column definitions)
            let headerIdx = -1;
            for (let i = 0; i < 20; i++) {
                if (!rows[i]) continue;
                const rowStr = JSON.stringify(rows[i]).toLowerCase();
                // "Rank" is a strong signal. "Archer" or "Name" is another.
                if (rowStr.includes('rank') && (rowStr.includes('name') || rowStr.includes('archer') || rowStr.includes('bib'))) {
                    headerIdx = i;
                    console.log(`[HEADER CANDIDATE] Row ${i}:`, JSON.stringify(rows[i]));
                }
            }

            // 2. Scan for Data Consistency (Check a few rows after header, or middle of file)
            const startRow = headerIdx !== -1 ? headerIdx + 1 : 5; // Default to 5 if no header
            const sampleRows = rows.slice(startRow, startRow + 5);

            console.log(`\n[DATA SAMPLE] (Starting Row ${startRow})`);
            sampleRows.forEach((row, i) => {
                if (row && row.length > 0) {
                    console.log(`Row ${startRow + i}:`, JSON.stringify(row));

                    // Simple Validation Log
                    // Assuming Schema: Rank(0), Name(1), Bib(3), Score(5)?
                    const rank = row[0];
                    const name = row[1];
                    const bib = row[3];
                    const score = row[5];
                    console.log(`   -> Parsed: Rank=${rank}, Name=${name}, Bib=${bib}, Score=${score}`);
                }
            });
        });

    } catch (error) {
        console.error('Error parsing ODS:', error);
    }
}

analyzeODS();
