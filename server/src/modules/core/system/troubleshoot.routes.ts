import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../../lib/prisma.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate } from '../../../middleware/validate.middleware.js';

const router = Router();

// Validation schemas
const createTroubleshootSchema = z.object({
    body: z.object({
        tsId: z.string().min(1, 'TS ID is required'),
        title: z.string().min(1, 'Title is required'),
        category: z.enum(['Authentication', 'Database', 'UI', 'API', 'Build', 'Deployment']),
        severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
        effort: z.enum(['Quick', 'Medium', 'Long']),
        symptoms: z.string().min(1, 'Symptoms are required'),
        rootCause: z.string().min(1, 'Root cause is required'),
        debugSteps: z.string().min(1, 'Debug steps are required'),
        solution: z.string().min(1, 'Solution is required'),
        prevention: z.string().optional(),
        relatedFiles: z.string().optional(),
    }),
});

const updateTroubleshootSchema = z.object({
    body: z.object({
        tsId: z.string().optional(),
        title: z.string().optional(),
        category: z.enum(['Authentication', 'Database', 'UI', 'API', 'Build', 'Deployment']).optional(),
        severity: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
        effort: z.enum(['Quick', 'Medium', 'Long']).optional(),
        symptoms: z.string().optional(),
        rootCause: z.string().optional(),
        debugSteps: z.string().optional(),
        solution: z.string().optional(),
        prevention: z.string().optional(),
        relatedFiles: z.string().optional(),
    }),
});

// GET /api/v1/troubleshoot - List all entries with optional filters
router.get('/', authenticate, async (req, res) => {
    try {
        const { category, severity, search } = req.query;

        const where: any = {};

        if (category && typeof category === 'string') {
            where.category = category;
        }

        if (severity && typeof severity === 'string') {
            where.severity = severity;
        }

        if (search && typeof search === 'string') {
            where.OR = [
                { title: { contains: search } },
                { symptoms: { contains: search } },
                { rootCause: { contains: search } },
                { solution: { contains: search } },
            ];
        }

        const entries = await (prisma as any).troubleshoot.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: entries,
        });
    } catch (error) {
        console.error('Error fetching troubleshoot entries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch troubleshoot entries',
        });
    }
});

// GET /api/v1/troubleshoot/:id - Get single entry
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await (prisma as any).troubleshoot.findUnique({
            where: { id },
        });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found',
            });
        }

        res.json({
            success: true,
            data: entry,
        });
    } catch (error) {
        console.error('Error fetching troubleshoot entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch troubleshoot entry',
        });
    }
});

// POST /api/v1/troubleshoot - Create new entry (Super Admin only)
router.post('/', authenticate, validate(createTroubleshootSchema), async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can create troubleshoot entries',
            });
        }

        const data = req.body;

        // Check if tsId already exists
        const existing = await (prisma as any).troubleshoot.findUnique({
            where: { tsId: data.tsId },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: `TS ID ${data.tsId} already exists`,
            });
        }

        const entry = await (prisma as any).troubleshoot.create({
            data: {
                ...data,
                createdBy: req.user.id,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Entry created successfully',
            data: entry,
        });
    } catch (error) {
        console.error('Error creating troubleshoot entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create troubleshoot entry',
        });
    }
});

// PATCH /api/v1/troubleshoot/:id - Update entry
router.patch('/:id', authenticate, validate(updateTroubleshootSchema), async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can update troubleshoot entries',
            });
        }

        const { id } = req.params;
        const data = req.body;

        const entry = await (prisma as any).troubleshoot.update({
            where: { id },
            data,
        });

        res.json({
            success: true,
            message: 'Entry updated successfully',
            data: entry,
        });
    } catch (error) {
        console.error('Error updating troubleshoot entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update troubleshoot entry',
        });
    }
});

// DELETE /api/v1/troubleshoot/:id - Delete entry
router.delete('/:id', authenticate, async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can delete troubleshoot entries',
            });
        }

        const { id } = req.params;

        await (prisma as any).troubleshoot.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Entry deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting troubleshoot entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete troubleshoot entry',
        });
    }
});

// GET /api/v1/troubleshoot/next-id - Get the next available TS ID
router.get('/next-id', authenticate, async (_req, res) => {
    try {
        const entries = await (prisma as any).troubleshoot.findMany({
            select: { tsId: true },
            orderBy: { tsId: 'desc' },
            take: 1,
        });

        let nextNumber = 1;
        if (entries.length > 0) {
            const lastId = entries[0].tsId; // e.g., "TS-007"
            const lastNumber = parseInt(lastId.replace('TS-', ''), 10);
            nextNumber = lastNumber + 1;
        }

        const nextId = `TS-${nextNumber.toString().padStart(3, '0')}`;

        res.json({
            success: true,
            data: { nextId },
        });
    } catch (error) {
        console.error('Error getting next TS ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get next TS ID',
        });
    }
});

import fs from 'fs';
import path from 'path';

// ... (existing helper function from seed_troubleshoot.ts adapted for route use)
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

                console.log(`[Sync Debug] Parsed: ${tsId} - ${title}`);
                if (!categoryMatch) console.log(`[Sync Debug] ${tsId} -> Category NOT matched`);
                if (!severityMatch) console.log(`[Sync Debug] ${tsId} -> Severity NOT matched`);

                if (!tsId || !title || !categoryMatch || !severityMatch) {
                    console.log(`[Sync Debug] Skipping ${tsId || 'Unknown'} - Missing required fields`);
                    continue;
                }

                entries.push({
                    tsId,
                    title,
                    category: categoryMatch[1].trim(),
                    severity: severityMatch[1].trim(),
                    effort: effortMatch ? effortMatch[1].trim().split(' ')[0] : 'Quick',
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
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
}

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

// Helper to upsert entries
async function processEntries(req: any, res: any, entries: TroubleshootEntry[]) {
    console.log(`[Sync] Found ${entries.length} entries to sync.`);
    let syncedCount = 0;

    for (const entry of entries) {
        if (!entry.tsId || !entry.title) {
            console.warn('[Sync] Skipping invalid entry:', entry);
            continue;
        }

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
                createdBy: req.user.id,
            },
        });
        syncedCount++;
    }

    res.json({
        success: true,
        message: `Successfully synced ${syncedCount} entries`,
        count: syncedCount
    });
}

// POST /api/v1/troubleshoot/sync - Sync from Markdown file
router.post('/sync', authenticate, async (req, res) => {
    try {
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only Super Admin can sync troubleshoot entries',
            });
        }

        const cwd = process.cwd();
        // Fallback Strategies
        const possiblePaths = [
            path.join(cwd, '../docs', 'troubleshoot.md'),      // If cwd is sip/server
            path.join(cwd, '../../docs', 'troubleshoot.md'),   // If deep
            path.resolve(cwd, '../docs/troubleshoot.md'),      // Resolve relative
            'd:/Antigravity/sip/docs/troubleshoot.md'          // Absolute fallback
        ];

        let foundPath = '';
        console.log('[Sync] Searching in:', possiblePaths);

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                foundPath = p;
                console.log('[Sync] Found at:', foundPath);
                break;
            }
        }

        if (!foundPath) {
            return res.status(404).json({
                success: false,
                message: 'troubleshoot.md file not found in any expected location.',
                searchedPaths: possiblePaths
            });
        }

        const entries = parseTroubleshootMd(foundPath);
        return processEntries(req, res, entries);

    } catch (error) {
        console.error('Error syncing troubleshoot entries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync troubleshoot entries',
        });
    }
});

export default router;
