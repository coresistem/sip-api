/**
 * Enhanced Troubleshooting Sync Script (Fixed Parser)
 * Syncs ALL entries from docs/troubleshoot.md to the database.
 * Run with: npx tsx scripts/sync-troubleshoot-full.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const entries: TroubleshootEntry[] = [];

        // Split by "## TS-" to get chunks
        const chunks = content.split(/^## TS-/m).slice(1);

        for (const chunk of chunks) {
            try {
                const lines = chunk.split('\n');

                // 1. Extract ID and Title
                const headerLine = lines[0].trim();
                const [idPart, ...titleParts] = headerLine.split(':');
                const tsId = `TS-${idPart.trim()}`;
                const title = titleParts.join(':').trim();

                // 2. Extract Metadata Table
                // Look for the data row (usually 3rd row of the table)
                // Format:
                // | **Category** | **Severity** | **Effort** |
                // | :--- | :--- | :--- |
                // | Value1 | Value2 | Value3 |
                const tableMatch = chunk.match(/\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*\n\|\s*[:|-]+\s*\|\s*[:|-]+\s*\|\s*[:|-]+\s*\|\s*\n\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/);

                let category = '';
                let severity = '';
                let effort = '';

                if (tableMatch) {
                    category = tableMatch[4].trim();
                    severity = tableMatch[5].trim();
                    effort = tableMatch[6].trim().split(' ')[0];
                }

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

                if (!tsId || !title || !category || !severity) {
                    // console.warn(`[Skip] ${tsId || 'Unknown'}: Missing metadata (Id: ${!!tsId}, Title: ${!!title}, Cat: ${!!category}, Sev: ${!!severity})`);
                    continue;
                }

                entries.push({
                    tsId,
                    title,
                    category,
                    severity,
                    effort: effort || 'Quick',
                    symptoms,
                    rootCause,
                    debugSteps,
                    solution,
                    prevention: prevention || undefined,
                    relatedFiles: relatedFiles && relatedFiles !== 'N/A' ? relatedFiles : undefined,
                });
            } catch (err) {
                // Skip invalid chunks
            }
        }
        return entries;
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
}

async function main() {
    const mdPath = 'd:/Antigravity/sip/docs/troubleshoot.md';

    if (!fs.existsSync(mdPath)) {
        console.error(`❌ File not found: ${mdPath}`);
        return;
    }

    console.log(`📖 Parsing ${mdPath}...`);
    const entries = parseTroubleshootMd(mdPath);
    console.log(`✨ Found ${entries.length} entries. Syncing to DB...`);

    let syncedCount = 0;
    for (const entry of entries) {
        try {
            await (prisma as any).troubleshoot.upsert({
                where: { tsId: entry.tsId },
                update: entry,
                create: {
                    ...entry,
                    createdBy: 'system-sync',
                },
            });
            syncedCount++;
        } catch (err) {
            console.error(`❌ Failed to sync ${entry.tsId}:`, (err as Error).message);
        }
    }

    console.log(`\n🎉 Done! Successfully synced ${syncedCount} / ${entries.length} entries.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
