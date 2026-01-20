import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Map Markdown fields to Database fields
interface TroubleshootEntry {
    tsId: string;
    title: string;
    category: string;
    severity: string;
    effort: string;
    symptoms: string;
    rootCause: string;
    debugSteps: string;
    solution: string;
    prevention?: string;
    relatedFiles?: string;
}

function parseTroubleshootMd(filePath: string): TroubleshootEntry[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const entries: TroubleshootEntry[] = [];

    // Split by "## TS-" to get chunks
    const chunks = content.split(/^## TS-/m).slice(1); // Skip preamble

    for (const chunk of chunks) {
        try {
            const lines = chunk.split('\n');

            // 1. Extract ID and Title
            // chunk starts with "001: Login 401 Unauthorized" (because of split)
            const headerLine = lines[0].trim();
            const [idPart, ...titleParts] = headerLine.split(':');
            const tsId = `TS-${idPart.trim()}`;
            const title = titleParts.join(':').trim();

            // 2. Extract Metadata Table
            const categoryMatch = chunk.match(/\|\s*\*\*Category\*\*\s*\|\s*(.*?)\s*\|/);
            const severityMatch = chunk.match(/\|\s*\*\*Severity\*\*\s*\|\s*(.*?)\s*\|/);
            const effortMatch = chunk.match(/\|\s*\*\*Effort\*\*\s*\|\s*(.*?)\s*\|/);

            // 3. Extract Sections
            const getSection = (name: string): string => {
                const regex = new RegExp(`### ${name}\\s*([\\s\\S]*?)(?=###|## TS-|$)`, 'i');
                const match = chunk.match(regex);
                return match ? match[1].trim() : '';
            };

            const symptoms = getSection('Symptoms');
            const rootCause = getSection('Root Cause');
            const debugSteps = getSection('Debug Steps');
            const solution = getSection('Solution');
            const prevention = getSection('Prevention');
            const relatedFiles = getSection('Related Files');

            if (!tsId || !title || !categoryMatch || !severityMatch) {
                console.warn(`Skipping incomplete entry: ${tsId}`);
                continue;
            }

            entries.push({
                tsId,
                title,
                category: categoryMatch[1].trim(),
                severity: severityMatch[1].trim(),
                effort: effortMatch ? effortMatch[1].trim().split(' ')[0] : 'Quick', // 'Quick (<15m)' -> 'Quick'
                symptoms,
                rootCause,
                debugSteps,
                solution,
                prevention: prevention || undefined,
                relatedFiles: relatedFiles && relatedFiles !== 'N/A' ? relatedFiles : undefined,
            });

        } catch (err) {
            console.error('Error parsing chunk:', err);
        }
    }

    return entries;
}

async function main() {
    const docsPath = path.resolve(__dirname, '../../docs/TROUBLESHOOTING.md');
    console.log(`Reading entries from: ${docsPath}`);

    if (!fs.existsSync(docsPath)) {
        console.error('TROUBLESHOOTING.md not found!');
        process.exit(1);
    }

    const troubleshootEntries = parseTroubleshootMd(docsPath);
    console.log(`Found ${troubleshootEntries.length} entries.`);

    // Get Super Admin user ID
    const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });

    if (!superAdmin) {
        console.error('Super Admin not found. Please seed users first.');
        process.exit(1);
    }

    for (const entry of troubleshootEntries) {
        // Upsert: Create if new, Update if exists (to sync changes from MD)
        await (prisma as any).troubleshoot.upsert({
            where: { tsId: entry.tsId },
            update: {
                title: entry.title,
                category: entry.category,
                severity: entry.severity,
                effort: entry.effort,
                symptoms: entry.symptoms,
                rootCause: entry.rootCause,
                debugSteps: entry.debugSteps,
                solution: entry.solution,
                prevention: entry.prevention,
                relatedFiles: entry.relatedFiles,
            },
            create: {
                ...entry,
                createdBy: superAdmin.id,
            },
        });
        console.log(`Synced ${entry.tsId}: ${entry.title}`);
    }

    console.log('Troubleshoot sync complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
