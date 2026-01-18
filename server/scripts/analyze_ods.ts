
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
        // cellFormula: false forces reading values, though that's default.
        const workbook = XLSX.readFile(filePath, { cellFormula: false });

        const sheetsToInspect = ['All_Participants', 'N9MQ_I']; // 'N9MQ_I' seems to be National 9M Qualification Individual

        sheetsToInspect.forEach(sheetName => {
            if (!workbook.SheetNames.includes(sheetName)) return;

            console.log(`\n\n--- SHEET: ${sheetName} ---`);
            const sheet = workbook.Sheets[sheetName];
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: '' });

            // 1. Look for Header Row
            let headerIndex = -1;
            for (let i = 0; i < 30 && i < rows.length; i++) {
                const rowStr = JSON.stringify(rows[i]).toLowerCase();
                // Common IanSEO headers or potential keywords
                if (rowStr.includes('name') && (rowStr.includes('rank') || rowStr.includes('score') || rowStr.includes('total') || rowStr.includes('country'))) {
                    headerIndex = i;
                    console.log(`[FOUND HEADER @ Row ${i}]:`, JSON.stringify(rows[i]));
                    break;
                }
            }

            // 2. Sample Data (Post-Header or just top rows)
            const startRow = headerIndex !== -1 ? headerIndex + 1 : 0;
            console.log(`--- First 5 Rows of Data (starting row ${startRow}) ---`);
            rows.slice(startRow, startRow + 5).forEach((row, i) => {
                // Filter out empty rows for cleaner log
                if (JSON.stringify(row).length > 50) {
                    console.log(`[R${startRow + i}]: ${JSON.stringify(row)}`);
                }
            });
        });

    } catch (error) {
        console.error('Error parsing ODS:', error);
    }
}

analyzeODS();
