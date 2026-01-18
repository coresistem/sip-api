
import { MiroApi } from '@mirohq/miro-api';
import * as fs from 'fs';
import * as path from 'path';

const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y";
const BOARD_ID = "uXjVGSGyPCY=";
const SCHEMA_PATH = path.join(__dirname, '../server/prisma/schema.prisma');

const ROLES = [
    'SUPER_ADMIN', 'PERPANI', 'CLUB', 'SCHOOL', 'ATHLETE',
    'PARENT', 'COACH', 'JUDGE', 'EO', 'SUPPLIER', 'WORKER'
];

// MAPPING: Who is the ORIGINAL CREATOR / INPUTTER of this data?
const TABLE_CREATORS: Record<string, string[]> = {
    'User': ['SUPER_ADMIN', 'CLUB'], // Usually created by admin or club invite
    'RefreshToken': [], // System only
    'Notification': [], // System only
    'Club': ['CLUB', 'SUPER_ADMIN'], // Self-reg or Admin
    'ClubOrganization': ['CLUB'],
    'Athlete': ['ATHLETE', 'CLUB', 'PARENT'],
    'ScoringRecord': ['ATHLETE', 'JUDGE'], // Athlete scores, Judge scores in competition
    'MembershipFee': ['CLUB'],
    'TrainingSchedule': ['COACH', 'CLUB'],
    'ScheduleParticipant': ['ATHLETE'], // Join schedule
    'AssetInventory': ['CLUB', 'SCHOOL'],
    'AssetMaintenanceLog': ['CLUB', 'SCHOOL'],
    'Attendance': ['ATHLETE', 'COACH'], // Athlete checks in
    'Document': ['SUPER_ADMIN', 'CLUB', 'SCHOOL'],
    'AuditLog': [], // System
    'EquipmentConfigLog': ['ATHLETE'],
    'Perpani': ['PERPANI'],
    'School': ['SCHOOL'],
    'StudentEnrollment': ['SCHOOL', 'ATHLETE', 'PARENT'],
    'AssessmentRecord': ['COACH'],
    'JerseyProduct': ['SUPPLIER'],
    'ProductVariant': ['SUPPLIER'],
    'JerseyOrder': ['CLUB', 'ATHLETE', 'PARENT'],
    'OrderItem': ['CLUB', 'ATHLETE', 'PARENT'], // Part of order
    'OrderTracking': ['SUPPLIER', 'WORKER'], // Updates tracking
    'JerseyWorker': ['SUPPLIER'],
    'WorkerTask': ['SUPPLIER'], // Validated: Supplier assigns task to worker
    'QCInspection': ['WORKER'], // Worker inputs inspection result
    'QCRejection': ['WORKER'],
    'RepairRequest': ['ATHLETE', 'CLUB'],
    'CourierInfo': ['SUPPLIER']
};

interface Model {
    name: string;
    fields: string[];
}

function parseSchema(schemaPath: string): Model[] {
    const content = fs.readFileSync(schemaPath, 'utf-8');
    const models: Model[] = [];
    const lines = content.split('\n');

    let currentModel: Model | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('model ')) {
            const parts = trimmed.split(/\s+/);
            const name = parts[1];
            currentModel = { name, fields: [] };
        }
        else if (trimmed === '}' && currentModel) {
            models.push(currentModel);
            currentModel = null;
        }
        else if (currentModel && trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('@')) {
            if (!trimmed.startsWith('@@')) {
                const parts = trimmed.split(/\s+/);
                const fieldName = parts[0];
                if (fieldName) {
                    currentModel.fields.push(fieldName);
                }
            }
        }
    }
    return models;
}

function getDataSource(fieldName: string): 'System' | 'User Input' {
    const systemFields = ['id', 'createdAt', 'updatedAt', 'deletedAt'];
    return systemFields.includes(fieldName) ? 'System' : 'User Input';
}

async function createFieldMatrices() {
    const miro = new MiroApi(ACCESS_TOKEN);
    const board = await miro.getBoard(BOARD_ID);

    console.log(`Accessing Board: ${board.viewLink}`);
    const models = parseSchema(SCHEMA_PATH);
    console.log(`Parsed ${models.length} models.`);

    const START_X = 18000; // New Location
    const START_Y = 0;

    const FIELD_COL_WIDTH = 200;
    const DATA_COL_WIDTH = 120;
    const ROLE_COL_WIDTH = 100;
    const HEADER_HEIGHT = 50;
    const ROW_HEIGHT = 40;

    const MATRICES_PER_ROW = 3;
    const COL_GAP = 200;

    const TABLE_WIDTH = FIELD_COL_WIDTH + DATA_COL_WIDTH + (ROLES.length * ROLE_COL_WIDTH);

    let currentMatrixIndex = 0;

    for (const model of models) {
        if (model.fields.length === 0) continue;
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(model.name)) continue;

        const gridCol = currentMatrixIndex % MATRICES_PER_ROW;
        const gridRow = Math.floor(currentMatrixIndex / MATRICES_PER_ROW);

        const xBase = START_X + (gridCol * (TABLE_WIDTH + COL_GAP));
        const yBase = START_Y + (gridRow * 2000);

        try {
            console.log(`Creating Creator Matrix for ${model.name}...`);

            // 1. Model Title
            await board.createShapeItem({
                data: { content: `<strong>${model.name}</strong> Original Data Source`, shape: 'rectangle' },
                style: { fillColor: '#b2dfdb', fontSize: '24', textAlign: 'center' }, // Teal color for distinction
                geometry: { width: TABLE_WIDTH, height: HEADER_HEIGHT },
                position: { x: xBase + (TABLE_WIDTH / 2), y: yBase + (HEADER_HEIGHT / 2) }
            });

            // 2. Headers
            const headersY = yBase + HEADER_HEIGHT + (HEADER_HEIGHT / 2);

            await board.createShapeItem({
                data: { content: `<strong>Data Source</strong>`, shape: 'rectangle' },
                style: { fillColor: '#e0e0e0', fontSize: '12', textAlign: 'center' },
                geometry: { width: DATA_COL_WIDTH, height: HEADER_HEIGHT },
                position: { x: xBase + FIELD_COL_WIDTH + (DATA_COL_WIDTH / 2), y: headersY }
            });

            for (let c = 0; c < ROLES.length; c++) {
                const x = xBase + FIELD_COL_WIDTH + DATA_COL_WIDTH + (c * ROLE_COL_WIDTH) + (ROLE_COL_WIDTH / 2);
                await board.createShapeItem({
                    data: { content: `<strong>${ROLES[c]}</strong>`, shape: 'rectangle' },
                    style: { fillColor: '#e1f5fe', fontSize: '10', textAlign: 'center' },
                    geometry: { width: ROLE_COL_WIDTH, height: HEADER_HEIGHT },
                    position: { x, y: headersY }
                });
            }

            // 3. Rows
            const bodyStartY = yBase + HEADER_HEIGHT + HEADER_HEIGHT;
            const creators = TABLE_CREATORS[model.name] || [];

            for (let r = 0; r < model.fields.length; r++) {
                const fieldName = model.fields[r];
                const sourceType = getDataSource(fieldName);
                const y = bodyStartY + (r * ROW_HEIGHT) + (ROW_HEIGHT / 2);

                // Field Name
                await board.createShapeItem({
                    data: { content: `${fieldName}`, shape: 'rectangle' },
                    style: { fillColor: '#f5f5f5', textAlign: 'left', fontSize: '12' },
                    geometry: { width: FIELD_COL_WIDTH, height: ROW_HEIGHT },
                    position: { x: xBase + (FIELD_COL_WIDTH / 2), y }
                });

                // Data Source Label
                const sourceColor = sourceType === 'System' ? '#ffeeff' : '#ffffff';
                await board.createShapeItem({
                    data: { content: sourceType, shape: 'rectangle' },
                    style: { fillColor: sourceColor, textAlign: 'center', fontSize: '12' },
                    geometry: { width: DATA_COL_WIDTH, height: ROW_HEIGHT },
                    position: { x: xBase + FIELD_COL_WIDTH + (DATA_COL_WIDTH / 2), y }
                });

                // Role Checkmarks
                for (let c = 0; c < ROLES.length; c++) {
                    const roleName = ROLES[c];
                    const xCell = xBase + FIELD_COL_WIDTH + DATA_COL_WIDTH + (c * ROLE_COL_WIDTH) + (ROLE_COL_WIDTH / 2);

                    let content = '';
                    // ONLY Mark if User Input AND Role is a Creator
                    if (sourceType === 'User Input' && creators.includes(roleName)) {
                        content = '✅';
                    }

                    await board.createShapeItem({
                        data: { content: content, shape: 'rectangle' },
                        style: { fillColor: '#ffffff', textAlign: 'center', fontSize: '14' },
                        geometry: { width: ROLE_COL_WIDTH, height: ROW_HEIGHT },
                        position: { x: xCell, y }
                    });
                }
            }

            console.log(`Success ${model.name}`);

        } catch (e: any) {
            console.error(`Failed ${model.name}`);
            if (e.body) console.error(JSON.stringify(e.body, null, 2));
            else console.error(e.message);
        }

        currentMatrixIndex++;
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    console.log('\nCreator Matrix created!');
    console.log(board.viewLink);
}

createFieldMatrices().catch(console.error);
