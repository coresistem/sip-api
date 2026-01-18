
import { MiroApi } from '@mirohq/miro-api';

const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y";
const BOARD_ID = "uXjVGSGyPCY=";

// --- Configuration ---
const START_X = 24000;
const START_Y = 0;

// Module Categories & Colors
const CATEGORIES = {
    FOUNDATION: { label: 'Foundation (Core)', color: '#cfd8dc' }, // Gray
    COMMERCE: { label: 'Commerce & Finance', color: '#c8e6c9' }, // Green
    OPS: { label: 'Manufacturing & Ops', color: '#ffe0b2' },   // Orange
    SPORT: { label: 'Sport & Event', color: '#bbdefb' },       // Blue
    ADMIN: { label: 'Admin Utilities', color: '#ffcdd2' }      // Red
};

// The Lego Blocks
const MODULES = [
    // Foundation
    { id: 'auth', label: 'Auth & Session', cat: 'FOUNDATION' },
    { id: 'profile', label: 'Profile & Identity', cat: 'FOUNDATION' },
    { id: 'notif', label: 'Notification Sys', cat: 'FOUNDATION' },
    { id: 'files', label: 'File Manager', cat: 'FOUNDATION' },

    // Commerce
    { id: 'catalog', label: 'Product Catalog', cat: 'COMMERCE' },
    { id: 'inventory', label: 'Inventory (Simple)', cat: 'COMMERCE' },
    { id: 'orders', label: 'Order Processing', cat: 'COMMERCE' },
    { id: 'finance', label: 'Finance/Journal', cat: 'COMMERCE' },

    // Ops (Jersey)
    { id: 'timeline', label: 'Production Timeline', cat: 'OPS' },
    { id: 'workstation', label: 'Workstation Assign', cat: 'OPS' },
    { id: 'qc', label: 'QC & Inspection', cat: 'OPS' },
    { id: 'logistics', label: 'Courier & Logistics', cat: 'OPS' },

    // Sport
    { id: 'scoring', label: 'Scoring System', cat: 'SPORT' },
    { id: 'schedule', label: 'Training Schedule', cat: 'SPORT' },
    { id: 'bleep', label: 'Bleep Test', cat: 'SPORT' },
    { id: 'attendance', label: 'Attendance', cat: 'SPORT' },

    // Admin
    { id: 'users', label: 'User Management', cat: 'ADMIN' },
    { id: 'builder', label: 'Module Builder', cat: 'ADMIN' },
    { id: 'perms', label: 'Role Permissions', cat: 'ADMIN' }
];

// Assembly Examples
const ASSEMBLIES = [
    {
        name: 'Jersey Supplier (Complex)',
        modules: ['auth', 'profile', 'notif', 'catalog', 'orders', 'finance', 'timeline', 'workstation', 'qc', 'logistics']
    },
    {
        name: 'General Supplier (Simple)',
        modules: ['auth', 'profile', 'notif', 'catalog', 'inventory', 'orders', 'finance']
    },
    {
        name: 'Athlete (User)',
        modules: ['auth', 'profile', 'notif', 'scoring', 'schedule', 'bleep', 'attendance']
    }
];

async function visualizeModules() {
    const miro = new MiroApi(ACCESS_TOKEN);
    const board = await miro.getBoard(BOARD_ID);
    console.log(`Accessing Board: ${board.viewLink}`);

    // Track created item IDs for connectors if needed (skipping connectors for now to keep it clean)

    // 1. Draw "The Warehouse" (All Modules)
    const WAREHOUSE_X = START_X;
    const WAREHOUSE_Y = START_Y;
    const COL_WIDTH = 250;
    const ROW_HEIGHT = 100;

    await board.createShapeItem({
        data: { content: '<strong>Module Warehouse</strong><br>The "Lego Blocks"', shape: 'rectangle' },
        style: { fillColor: '#e0e0e0', fontSize: 36, textAlign: 'center' },
        geometry: { width: 800, height: 100 },
        position: { x: WAREHOUSE_X + 400, y: WAREHOUSE_Y - 150 }
    });

    let row = 0;
    let col = 0;

    // Draw Category Headers and Modules in Columns
    const cats = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[];

    for (const catKey of cats) {
        const catConfig = CATEGORIES[catKey];
        const catModules = MODULES.filter(m => m.cat === catKey);

        const catX = WAREHOUSE_X + (col * (COL_WIDTH + 50));
        let catY = WAREHOUSE_Y;

        // Header
        await board.createShapeItem({
            data: { content: `<strong>${catConfig.label}</strong>`, shape: 'round_rectangle' }, // Pill shape
            style: { fillColor: '#eceff1', fontSize: 18, textAlign: 'center', borderOpacity: 0 },
            geometry: { width: COL_WIDTH, height: 60 },
            position: { x: catX + (COL_WIDTH / 2), y: catY }
        });

        catY += 80;

        // Modules
        for (const mod of catModules) {
            await board.createShapeItem({
                data: { content: mod.label, shape: 'rectangle' },
                style: { fillColor: catConfig.color, fontSize: 14, textAlign: 'center' },
                geometry: { width: COL_WIDTH, height: 80 },
                position: { x: catX + (COL_WIDTH / 2), y: catY + (80 / 2) }
            });
            catY += 100;
        }

        col++;
    }

    // 2. Draw "Assembly Examples"
    const ASSEMBLY_X = START_X;
    const ASSEMBLY_Y = START_Y + 1200; // Below Warehouse

    await board.createShapeItem({
        data: { content: '<strong>Assembly Examples</strong><br>Composed Roles', shape: 'rectangle' },
        style: { fillColor: '#fff9c4', fontSize: 36, textAlign: 'center' },
        geometry: { width: 800, height: 100 },
        position: { x: ASSEMBLY_X + 400, y: ASSEMBLY_Y - 150 }
    });

    let assemblyCol = 0;

    for (const assembly of ASSEMBLIES) {
        const ax = ASSEMBLY_X + (assemblyCol * (COL_WIDTH + 100));
        let ay = ASSEMBLY_Y;

        // Assembly Title
        await board.createShapeItem({
            data: { content: `<strong>${assembly.name}</strong>`, shape: 'rectangle' },
            style: { fillColor: '#37474f', color: '#ffffff', fontSize: 20, textAlign: 'center' },
            geometry: { width: COL_WIDTH, height: 80 },
            position: { x: ax + (COL_WIDTH / 2), y: ay }
        });

        ay += 100;

        // Stacked Modules
        for (const modId of assembly.modules) {
            const mod = MODULES.find(m => m.id === modId);
            if (!mod) continue;

            const catConfig = CATEGORIES[mod.cat as keyof typeof CATEGORIES];

            await board.createShapeItem({
                data: { content: mod.label, shape: 'rectangle' },
                style: { fillColor: catConfig.color, fontSize: 14, textAlign: 'center' },
                geometry: { width: COL_WIDTH, height: 60 },
                position: { x: ax + (COL_WIDTH / 2), y: ay + 30 }
            });

            ay += 70;
        }

        assemblyCol++;
    }

    console.log("Visualization Created Successfully!");
    console.log(board.viewLink);
}

visualizeModules().catch(console.error);
