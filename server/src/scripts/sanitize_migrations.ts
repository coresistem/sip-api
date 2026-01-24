import * as fs from 'fs';
import * as path from 'path';

function sanitizeFile(filePath: string) {
    console.log(`Sanitizing ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf-8');

    const lines = content.split('\n');
    const newLines: string[] = [];
    const constraints: string[] = [];
    let currentTable: string | null = null;

    // Regex to catch: CONSTRAINT "name" FOREIGN KEY ("field") REFERENCES "table"("field") [rest]
    const fkPattern = /^\s*CONSTRAINT\s+"([^"]+)"\s+FOREIGN KEY\s+\("([^"]+)"\)\s+REFERENCES\s+"([^"]+)"\s*\("([^"]+)"\)(.*)$/;

    for (const line of lines) {
        const stripped = line.trim();
        if (stripped.startsWith('CREATE TABLE "')) {
            const match = stripped.match(/"([^"]+)"/);
            if (match) {
                currentTable = match[1];
            }
            newLines.push(line);
        } else if (currentTable && stripped.includes('CONSTRAINT "') && stripped.includes('FOREIGN KEY')) {
            const match = stripped.match(fkPattern);
            if (match) {
                const [_, cName, cField, refTable, refField, rest] = match;
                constraints.push(`ALTER TABLE "${currentTable}" ADD CONSTRAINT "${cName}" FOREIGN KEY ("${cField}") REFERENCES "${refTable}"("${refField}")${rest.trim()};`);
            } else {
                newLines.push(line);
            }
        } else if (stripped.startsWith(');')) {
            currentTable = null;
            // Clean up trailing comma from the column definition before the );
            if (newLines.length > 0 && newLines[newLines.length - 1].trim().endsWith(',')) {
                newLines[newLines.length - 1] = newLines[newLines.length - 1].replace(/,\s*$/, '');
            }
            newLines.push(line);
        } else {
            newLines.push(line);
        }
    }

    // Note: Python's stripped.startswith('CREATE TABLE "') was used to set currentTable.
    // I should ensure newLines.push(line) is called in all branches if not redirected.
    // Wait, my logic above had a bug (newLines.append instead of push, and missing push in one branch).
    // Let me fix the logic to match the python script exactly.
}

// Rewriting properly:
function sanitizeFileProper(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const newLines: string[] = [];
    const constraints: string[] = [];
    let currentTable: string | null = null;

    const fkPattern = /^\s*CONSTRAINT\s+"([^"]+)"\s+FOREIGN KEY\s+\("([^"]+)"\)\s+REFERENCES\s+"([^"]+)"\s*\("([^"]+)"\)(.*)$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const stripped = line.trim();

        if (stripped.startsWith('CREATE TABLE "')) {
            const match = stripped.match(/"([^"]+)"/);
            currentTable = match ? match[1] : null;
            newLines.push(line);
        } else if (currentTable && stripped.includes('CONSTRAINT "') && stripped.includes('FOREIGN KEY')) {
            const match = line.match(fkPattern);
            if (match) {
                const [_, cName, cField, refTable, refField, rest] = match;
                constraints.push(`ALTER TABLE "${currentTable}" ADD CONSTRAINT "${cName}" FOREIGN KEY ("${cField}") REFERENCES "${refTable}"("${refField}")${rest.trim()};`);
            } else {
                newLines.push(line);
            }
        } else if (stripped.startsWith(');')) {
            currentTable = null;
            if (newLines.length > 0) {
                const lastIdx = newLines.length - 1;
                if (newLines[lastIdx].trim().endsWith(',')) {
                    newLines[lastIdx] = newLines[lastIdx].trimEnd().replace(/,$/, '');
                }
            }
            newLines.push(line);
        } else {
            newLines.push(line);
        }
    }

    let result = newLines.join('\n');
    if (constraints.length > 0) {
        result += '\n\n-- Foreign Key Constraints\n' + constraints.join('\n');
    }

    fs.writeFileSync(filePath, result, 'utf-8');
}

const migrationsDir = path.join(process.cwd(), 'prisma/migrations');

function walk(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file === 'migration.sql') {
            console.log(`Sanitizing ${fullPath}...`);
            sanitizeFileProper(fullPath);
        }
    }
}

walk(migrationsDir);
console.log('✨ All migrations sanitized successfully!');
