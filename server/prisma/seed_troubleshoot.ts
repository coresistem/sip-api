import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed data based on TROUBLESHOOTING.md entries
const troubleshootEntries = [
    {
        tsId: 'TS-001',
        title: 'Login 401 Unauthorized',
        category: 'Authentication',
        severity: 'High',
        effort: 'Quick',
        symptoms: 'User enters correct credentials but receives 401 Unauthorized.',
        rootCause: 'Password hash mismatch in the database.',
        debugSteps: '1. Check server logs for POST /api/v1/auth/login requests.\n2. Run scripts/check-admin.ts to verify user exists.',
        solution: 'Run: npx tsx scripts/reset-admin-password.ts',
        prevention: 'Always use bcrypt.hash() when setting passwords programmatically.',
        relatedFiles: 'server/src/controllers/auth.controller.ts, server/scripts/reset-admin-password.ts',
    },
    {
        tsId: 'TS-002',
        title: 'Prisma Client EPERM Error',
        category: 'Database',
        severity: 'Medium',
        effort: 'Medium',
        symptoms: 'EPERM: operation not permitted error when running npm run db:generate:local.',
        rootCause: 'The server process (npx tsx watch) is holding a lock on Prisma Client files.',
        debugSteps: 'Check for running server processes: netstat -ano | findstr :5000',
        solution: 'Stop all server processes (Ctrl+C), run npm run db:generate:local, then restart.',
        prevention: 'Always stop the server before regenerating Prisma Client.',
        relatedFiles: 'server/prisma/schema.dev.prisma, server/README_PRISMA.md',
    },
    {
        tsId: 'TS-003',
        title: 'EADDRINUSE Port 5000',
        category: 'Database',
        severity: 'Medium',
        effort: 'Quick',
        symptoms: 'Server fails to start with EADDRINUSE: address already in use :::5000.',
        rootCause: 'Another process is already using port 5000.',
        debugSteps: 'netstat -ano | findstr :5000',
        solution: 'Kill the offending process: taskkill /PID <PID> /F',
        prevention: 'Use Ctrl+C to properly stop servers instead of closing terminals.',
        relatedFiles: 'server/src/index.ts',
    },
    {
        tsId: 'TS-006',
        title: 'Sidebar Module Not Appearing',
        category: 'UI',
        severity: 'Medium',
        effort: 'Quick',
        symptoms: 'New module added to permissions but does not appear in sidebar.',
        rootCause: 'Module was added to permissions.ts but not to NAV_ITEMS in DashboardLayout.tsx.',
        debugSteps: '1. Check permissions.ts for module definition.\n2. Check DashboardLayout.tsx for NAV_ITEMS entry.',
        solution: 'Add the module to both permissions.ts AND DashboardLayout.tsx.',
        prevention: 'Always update both files when adding modules.',
        relatedFiles: 'client/src/types/permissions.ts, client/src/components/layout/DashboardLayout.tsx',
    },
    {
        tsId: 'TS-008',
        title: 'CORS Blocked Origin in Production',
        category: 'Deployment',
        severity: 'High',
        effort: 'Quick',
        symptoms: 'API requests from production domain fail with CORS errors.',
        rootCause: 'Production domain was not included in the CORS allowedOrigins array.',
        debugSteps: 'Check browser console for Access-Control-Allow-Origin errors.',
        solution: 'Add the production domain to allowedOrigins in server/src/index.ts.',
        prevention: 'Always update CORS configuration when deploying to new domains.',
        relatedFiles: 'server/src/index.ts',
    },
    {
        tsId: 'TS-009',
        title: 'Vercel 404 on Refresh',
        category: 'Deployment',
        severity: 'High',
        effort: 'Quick',
        symptoms: 'SPA pages return 404 when refreshed or accessed directly.',
        rootCause: 'Vercel does not know to route all requests to index.html for client-side routing.',
        debugSteps: 'Refresh any non-root page and observe 404.',
        solution: 'Create vercel.json with rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]',
        prevention: 'Always include vercel.json rewrites for SPAs deployed to Vercel.',
        relatedFiles: 'client/vercel.json',
    },
    {
        tsId: 'TS-021',
        title: 'Localhost Sidebar Missing Modules',
        category: 'UI',
        severity: 'Low',
        effort: 'Quick',
        symptoms: 'Sidebar menu on Localhost is missing items that are visible on Live.',
        rootCause: 'Local Storage Caching. Browser caches sidebar configuration in sip_ui_settings_v7.',
        debugSteps: 'Open DevTools > Application > Local Storage. Check for sip_ui_settings_v7.',
        solution: 'Clear Local Storage for the site and refresh.',
        prevention: 'Increase permissions version key in PermissionsContext.tsx when making changes.',
        relatedFiles: 'client/src/context/PermissionsContext.tsx',
    },
];

async function main() {
    console.log('Start seeding troubleshoot entries...');

    // Get Super Admin user ID for createdBy field
    const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });

    if (!superAdmin) {
        console.error('Super Admin not found. Please seed the users first.');
        process.exit(1);
    }

    for (const entry of troubleshootEntries) {
        const existing = await (prisma as any).troubleshoot.findUnique({
            where: { tsId: entry.tsId },
        });

        if (existing) {
            console.log(`Entry ${entry.tsId} already exists, skipping.`);
            continue;
        }

        await (prisma as any).troubleshoot.create({
            data: {
                ...entry,
                createdBy: superAdmin.id,
            },
        });
        console.log(`Created ${entry.tsId}: ${entry.title}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
