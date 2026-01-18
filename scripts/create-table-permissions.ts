
import { MiroApi } from '@mirohq/miro-api';

const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y";
const BOARD_ID = "uXjVGSGyPCY="; // SIP Database Structure Board

const ROLES = [
    'SUPER_ADMIN', 'PERPANI', 'CLUB', 'SCHOOL', 'ATHLETE',
    'PARENT', 'COACH', 'JUDGE', 'EO', 'SUPPLIER', 'WORKER'
];

const TABLES = [
    'User', 'RefreshToken', 'Club', 'ClubOrganization', 'Athlete',
    'ScoringRecord', 'MembershipFee', 'TrainingSchedule', 'ScheduleParticipant',
    'AssetInventory', 'AssetMaintenanceLog', 'Attendance', 'Document',
    'Notification', 'AuditLog', 'EquipmentConfigLog', 'Perpani',
    'School', 'StudentEnrollment', 'HistoryLog', 'CustomModule', 'ModuleField',
    'AssessmentRecord', 'JerseyProduct', 'ProductVariant', 'JerseyOrder',
    'OrderItem', 'OrderTracking', 'JerseyWorker', 'WorkerTask',
    'QCInspection', 'QCRejection', 'RepairRequest', 'CourierInfo'
];

// Inferred Access Logic
// All roles touch User/RefreshToken/Notification
// Specific business logic for others
const TABLE_ACCESS = {
    'User': ROLES, // Everyone has a user
    'RefreshToken': ROLES,
    'Notification': ROLES,
    'Club': ['SUPER_ADMIN', 'PERPANI', 'CLUB', 'COACH', 'ATHLETE'],
    'ClubOrganization': ['CLUB'],
    'Athlete': ['CLUB', 'SCHOOL', 'ATHLETE', 'PARENT', 'COACH', 'PERPANI'],
    'ScoringRecord': ['ATHLETE', 'COACH', 'CLUB', 'JUDGE', 'EO'],
    'MembershipFee': ['CLUB', 'ATHLETE', 'PARENT'],
    'TrainingSchedule': ['CLUB', 'COACH', 'ATHLETE'],
    'ScheduleParticipant': ['ATHLETE', 'COACH'],
    'AssetInventory': ['CLUB', 'SCHOOL'],
    'AssetMaintenanceLog': ['CLUB', 'SCHOOL'],
    'Attendance': ['ATHLETE', 'COACH', 'CLUB', 'SCHOOL'],
    'Document': ['SUPER_ADMIN', 'CLUB', 'SCHOOL'],
    'AuditLog': ['SUPER_ADMIN'],
    'EquipmentConfigLog': ['ATHLETE', 'COACH'],
    'Perpani': ['PERPANI', 'SUPER_ADMIN'],
    'School': ['SCHOOL', 'SUPER_ADMIN', 'CLUB'],
    'StudentEnrollment': ['SCHOOL', 'ATHLETE', 'PARENT'],
    'AssessmentRecord': ['COACH', 'ATHLETE', 'CLUB'],
    'JerseyProduct': ['SUPPLIER', 'CLUB', 'ATHLETE'],
    'ProductVariant': ['SUPPLIER'],
    'JerseyOrder': ['CLUB', 'ATHLETE', 'PARENT', 'SUPPLIER', 'WORKER'],
    'OrderItem': ['CLUB', 'ATHLETE', 'SUPPLIER'],
    'OrderTracking': ['SUPPLIER', 'WORKER', 'CLUB', 'ATHLETE'],
    'JerseyWorker': ['SUPPLIER', 'WORKER'],
    'WorkerTask': ['SUPPLIER', 'WORKER'],
    'QCInspection': ['WORKER', 'SUPPLIER'],
    'QCRejection': ['WORKER', 'SUPPLIER'],
    'RepairRequest': ['ATHLETE', 'CLUB', 'SUPPLIER'],
    'CourierInfo': ['SUPPLIER', 'CLUB', 'ATHLETE']
};

async function createTableMatrix() {
    const miro = new MiroApi(ACCESS_TOKEN);
    const board = await miro.getBoard(BOARD_ID);

    console.log(`Accessing Board: ${board.viewLink}`);

    // Position: Further right to avoid overlap with previous matrix
    const START_X = 4000;
    const START_Y = 0;
    const COL_WIDTH = 120; // Slightly narrower cols
    const ROW_HEIGHT = 50;
    const FIRST_COL_WIDTH = 250;

    // 1. Create Title
    await board.createShapeItem({
        data: { content: '<strong>Table Data vs Roles Matrix</strong><br>(CRUD Scope)', shape: 'rectangle' },
        style: { fillColor: '#fff9c4', fontSize: 36, borderOpacity: 0 },
        geometry: { width: 1000, height: 100 },
        position: { x: START_X + 600, y: START_Y - 120 }
    });

    // 2. Draw Header Row (Roles)
    for (let c = 0; c < ROLES.length; c++) {
        const roleName = ROLES[c];
        const x = START_X + FIRST_COL_WIDTH + (c * COL_WIDTH) + (COL_WIDTH / 2);
        const y = START_Y + (ROW_HEIGHT / 2);

        // Rotate text vertical for space? No, Miro API text rotation is tricky on simple shapes.
        // Keep standard horizontal but use acronyms if needed? Standard names are fine.

        await board.createShapeItem({
            data: { content: `<strong>${roleName}</strong>`, shape: 'rectangle' },
            style: { fillColor: '#bbdefb', borderColor: '#000000', textAlign: 'center', fontSize: 12 },
            geometry: { width: COL_WIDTH, height: ROW_HEIGHT },
            position: { x, y }
        });
    }

    // 3. Draw Rows (Tables)
    for (let r = 0; r < TABLES.length; r++) {
        const tableName = TABLES[r];
        const allowedRoles = TABLE_ACCESS[tableName] || [];

        const y = START_Y + ((r + 1) * ROW_HEIGHT) + (ROW_HEIGHT / 2);

        // Row Header
        await board.createShapeItem({
            data: { content: `<strong>${tableName}</strong>`, shape: 'rectangle' },
            style: { fillColor: '#f5f5f5', borderColor: '#aaaaaa', textAlign: 'left', fontSize: 14 },
            geometry: { width: FIRST_COL_WIDTH, height: ROW_HEIGHT },
            position: { x: START_X + (FIRST_COL_WIDTH / 2), y }
        });

        // Intersection Cells
        for (let c = 0; c < ROLES.length; c++) {
            const roleName = ROLES[c];
            const hasAccess = allowedRoles.includes(roleName);

            const xCell = START_X + FIRST_COL_WIDTH + (c * COL_WIDTH) + (COL_WIDTH / 2);

            // Visual indicator
            const color = hasAccess ? '#c8e6c9' : '#ffffff';
            const content = hasAccess ? '⏺' : '';

            await board.createShapeItem({
                data: { content: content, shape: 'rectangle' },
                style: { fillColor: color, borderColor: '#e0e0e0' },
                geometry: { width: COL_WIDTH, height: ROW_HEIGHT },
                position: { x: xCell, y }
            });
        }
        console.log(`Processed Table: ${tableName}`);
    }

    console.log('\nTable Matrix created successfully!');
    console.log(board.viewLink);
}

createTableMatrix().catch(console.error);
