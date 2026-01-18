
import { MiroApi } from '@mirohq/miro-api';

const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y";
const BOARD_ID = "uXjVGSGyPCY="; // SIP Database Structure Board

const ROLES = [
    'SUPER_ADMIN', 'PERPANI', 'CLUB', 'SCHOOL', 'ATHLETE',
    'PARENT', 'COACH', 'JUDGE', 'EO', 'SUPPLIER', 'WORKER'
];

// Renamed "Input Data" to "Modules" effectively in concept
const DATA_ENTITIES = [
    'System Configuration',
    'Club Profile',
    'School Profile',
    'Athlete Profile',
    'Training Schedule',
    'Attendance Record',
    'Scoring Record',
    'Competition Event',
    'Event Registration',
    'Match Score (Event)',
    'Jersey Product Catalog',
    'Jersey Order',
    'Production Task',
    'QC Inspection',
    'Asset Inventory'
];

const PERMISSIONS = {
    'System Configuration': ['SUPER_ADMIN'],
    'Club Profile': ['CLUB', 'SUPER_ADMIN'],
    'School Profile': ['SCHOOL', 'SUPER_ADMIN'],
    'Athlete Profile': ['ATHLETE', 'CLUB', 'SCHOOL', 'PARENT'],
    'Training Schedule': ['COACH', 'CLUB'],
    'Attendance Record': ['ATHLETE', 'COACH'],
    'Scoring Record': ['ATHLETE', 'COACH'],
    'Competition Event': ['EO', 'PERPANI'],
    'Event Registration': ['CLUB', 'ATHLETE', 'SCHOOL'],
    'Match Score (Event)': ['JUDGE', 'EO'],
    'Jersey Product Catalog': ['SUPPLIER'],
    'Jersey Order': ['CLUB', 'ATHLETE', 'PARENT'],
    'Production Task': ['WORKER', 'SUPPLIER'],
    'QC Inspection': ['WORKER', 'SUPPLIER'],
    'Asset Inventory': ['CLUB', 'SCHOOL']
};

async function createMatrixOnDbBoard() {
    const miro = new MiroApi(ACCESS_TOKEN);
    const board = await miro.getBoard(BOARD_ID);

    console.log(`Accessing Board: ${board.viewLink}`);

    // Position: To the right of the ERD (Assuming ERD is around 0,0 to 1000,1000)
    // Let's put it at X=2000, Y=0 top aligned
    const START_X = 2000;
    const START_Y = 0;
    const COL_WIDTH = 180;
    const ROW_HEIGHT = 60;
    const FIRST_COL_WIDTH = 250;

    // 1. Create Title for Matrix
    await board.createShapeItem({
        data: { content: '<strong>Modules & Responsibility Matrix</strong>', shape: 'rectangle' },
        style: { fillColor: '#eeeeee', fontSize: 32, borderOpacity: 0 },
        geometry: { width: 800, height: 80 },
        position: { x: START_X + (ROLES.length * COL_WIDTH) / 2, y: START_Y - 100 }
    });

    // 2. Draw Header Row (Roles)
    for (let c = 0; c < ROLES.length; c++) {
        const roleName = ROLES[c];
        const x = START_X + FIRST_COL_WIDTH + (c * COL_WIDTH) + (COL_WIDTH / 2);
        const y = START_Y + (ROW_HEIGHT / 2);

        await board.createShapeItem({
            data: { content: `<strong>${roleName}</strong>`, shape: 'rectangle' },
            style: { fillColor: '#d0e1f9', borderColor: '#000000', textAlign: 'center' },
            geometry: { width: COL_WIDTH, height: ROW_HEIGHT },
            position: { x, y }
        });
    }

    // 3. Draw Rows (Modules) and Cells
    for (let r = 0; r < DATA_ENTITIES.length; r++) {
        const entityName = DATA_ENTITIES[r];
        const allowedRoles = PERMISSIONS[entityName] || [];

        // Row Y Position
        const y = START_Y + ((r + 1) * ROW_HEIGHT) + (ROW_HEIGHT / 2);

        // 3a. Draw Left Header (Module Name)
        const xTitle = START_X + (FIRST_COL_WIDTH / 2);
        await board.createShapeItem({
            data: { content: `<strong>${entityName}</strong>`, shape: 'rectangle' },
            style: { fillColor: '#f4f4f4', borderColor: '#000000', textAlign: 'left' },
            geometry: { width: FIRST_COL_WIDTH, height: ROW_HEIGHT },
            position: { x: xTitle, y }
        });

        // 3b. Draw Cells
        for (let c = 0; c < ROLES.length; c++) {
            const roleName = ROLES[c];
            const xCell = START_X + FIRST_COL_WIDTH + (c * COL_WIDTH) + (COL_WIDTH / 2);

            const hasAccess = allowedRoles.includes(roleName);
            const cellColor = hasAccess ? '#caffbf' : '#ffffff';
            const content = hasAccess ? '✅' : '';

            await board.createShapeItem({
                data: { content: content, shape: 'rectangle' },
                style: { fillColor: cellColor, borderColor: '#dddddd' },
                geometry: { width: COL_WIDTH, height: ROW_HEIGHT },
                position: { x: xCell, y }
            });
        }
        console.log(`Generated row: ${entityName}`);
    }

    console.log('\nMatrix generated on SIP Database Structure board!');
    console.log(board.viewLink);
}

createMatrixOnDbBoard().catch(console.error);
