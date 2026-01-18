
import { MiroApi } from '@mirohq/miro-api';

const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y";

const ROLES = [
    {
        name: 'SUPER_ADMIN',
        description: 'Full System Access',
        color: '#ff6b6b',
        features: ['User Management', 'System Config', 'Audit Logs']
    },
    {
        name: 'PERPANI',
        description: 'Regional/National Association',
        color: '#4ecdc4',
        features: ['Club Verification', 'Athlete Verification', 'Event Management']
    },
    {
        name: 'CLUB',
        description: 'Archery Club Owner',
        color: '#ffe66d',
        features: ['Member Management', 'Training Schedule', 'Asset Inventory']
    },
    {
        name: 'SCHOOL',
        description: 'School Admin',
        color: '#da727e',
        features: ['Student Enrollment', 'Extracurricular']
    },
    {
        name: 'ATHLETE',
        description: 'Archer',
        color: '#95e1d3',
        features: ['Scoring', 'Attendance', 'Profile Management']
    },
    {
        name: 'PARENT',
        description: 'Athlete Guardian',
        color: '#f7f4e9',
        features: ['View Athlete Progress', 'Payment History']
    },
    {
        name: 'COACH',
        description: 'Trainer',
        color: '#6c5b7b',
        features: ['Scoring Verification', 'Schedule Management', 'Assessment']
    },
    {
        name: 'JUDGE',
        description: 'Competition Judge',
        color: '#355c7d',
        features: ['Event Scoring', 'Rule Enforcement']
    },
    {
        name: 'EO',
        description: 'Event Organizer',
        color: '#c06c84',
        features: ['Competition Management', 'Participant Reg']
    },
    {
        name: 'SUPPLIER',
        description: 'Equipment Vendor',
        color: '#f8b195',
        features: ['Product Catalog', 'Order Management']
    },
    {
        name: 'WORKER',
        description: 'Supplier Staff',
        color: '#99b898',
        features: ['Production Tasks', 'QC Inspection']
    }
];

async function visualizeRoles() {
    const miro = new MiroApi(ACCESS_TOKEN);

    console.log('Creating "SIP Roles & Workflows" board...');

    const board = await miro.createBoard({
        name: 'SIP Roles & Workflows',
        description: 'Overview of User Roles and Responsibilities',
    });

    console.log(`Board created: ${board.viewLink}`);

    // Visualization Layout Parameters
    const CENTER_X = 0;
    const CENTER_Y = 0;
    const RADIUS = 800;

    // 1. Create Central Node
    const centerNode = await board.createShapeItem({
        data: {
            content: '<p style="text-align:center"><strong>SIP System</strong><br>Core</p>',
            shape: 'circle',
        },
        style: {
            fillColor: '#ffffff',
            borderColor: '#000000',
            fontSize: 24
        },
        geometry: {
            width: 200,
            height: 200
        },
        position: {
            x: CENTER_X,
            y: CENTER_Y
        }
    });

    console.log('Central node created.');

    // 2. Create Role Nodes in a Circle
    const angleStep = (2 * Math.PI) / ROLES.length;

    for (let i = 0; i < ROLES.length; i++) {
        const role = ROLES[i];
        const angle = i * angleStep;

        const x = CENTER_X + RADIUS * Math.cos(angle);
        const y = CENTER_Y + RADIUS * Math.sin(angle);

        let content = `<p style="text-align:center"><strong>${role.name}</strong></p>`;
        content += `<p style="text-align:center; font-size:12px"><em>${role.description}</em></p>`;
        content += `<hr>`;
        content += `<ul style="font-size:10px">`;
        role.features.forEach(f => content += `<li>${f}</li>`);
        content += `</ul>`;

        const roleNode = await board.createShapeItem({
            data: {
                content: content,
                shape: 'round_rectangle',
            },
            style: {
                fillColor: role.color,
                borderColor: '#333333',
            },
            geometry: {
                width: 250,
                height: 180
            },
            position: {
                x: x,
                y: y
            }
        });

        console.log(`Created role: ${role.name}`);

        // Connect to Center
        await board.createConnector({
            startItem: { id: centerNode.id },
            endItem: { id: roleNode.id },
            style: {
                strokeColor: '#888888',
                endStrokeCap: 'arrow'
            }
        });
    }

    console.log('\nVisualization complete! Open the board at:');
    console.log(board.viewLink);
}

visualizeRoles().catch(console.error);
