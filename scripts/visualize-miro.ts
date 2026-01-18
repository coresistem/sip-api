
import { MiroApi } from '@mirohq/miro-api';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// --- Configuration ---
// Note: In a real app, use environment variables. 
// For this script run, we use the values provided by the user.
const MIRO_CONFIG = {
    clientId: '3458764654904166123',
    clientSecret: 'WdvoLS06DUouFzvoCrXEbzIGSWQnUWeQ', // From previous context (first credential provided)
    redirectUrl: 'http://localhost:3000',
};

// If the user provided a second set of credentials in the chat history, 
// I should double check which one to use. 
// The user explicitly pasted:
// clientId: '<3458764654904166123>>' (with extra chars, I'll clean it)
// clientSecret: '<ceepXqWp2KXTsewQgzrHtLNfxO1UD9Cz>' (Use this ONE, it's the latest provided)

const MIRO_CONFIG_LATEST = {
    clientId: '3458764654904166123',
    clientSecret: 'ceepXqWp2KXTsewQgzrHtLNfxO1UD9Cz',
    redirectUrl: 'http://localhost:3000',
};

const SCHEMA_PATH = path.join(__dirname, '../server/prisma/schema.prisma');

// --- Types ---
interface Model {
    name: string;
    fields: Field[];
}

interface Field {
    name: string;
    type: string;
    isRelation: boolean;
    relationType?: string; // e.g., '1-1', '1-n'
    relationTo?: string;
}

// --- Prisma Parser ---
function parsePrismaSchema(schemaPath: string): Model[] {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const models: Model[] = [];

    const lines = schemaContent.split('\n');
    let currentModel: Model | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('model ')) {
            const match = trimmedLine.match(/^model\s+(\w+)\s+\{/);
            if (match) {
                currentModel = { name: match[1], fields: [] };
                models.push(currentModel);
            }
        } else if (trimmedLine === '}') {
            currentModel = null;
        } else if (currentModel) {
            // Parse fields
            // Simple regex to basic field structure: name type modifiers attributes
            // e.g. "id String @id"
            // e.g. "user User @relation(...)"
            // Ignoring empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('@@')) continue;

            const parts = trimmedLine.split(/\s+/);
            if (parts.length >= 2) {
                const name = parts[0];
                const type = parts[1].replace('?', '').replace('[]', ''); // Clean type

                // Very basic relation detection logic
                // If type matches another model name, it's a relation (simplified)
                // We will refine relation detection after knowing all model names
                currentModel.fields.push({
                    name,
                    type: parts[1], // keep original type with modifiers for display
                    isRelation: false, // Will verify later
                    relationTo: type
                });
            }
        }
    }

    // Second pass to identify actual relations
    const modelNames = new Set(models.map(m => m.name));
    for (const model of models) {
        for (const field of model.fields) {
            if (modelNames.has(field.relationTo || '')) {
                field.isRelation = true;
            }
        }
    }

    return models;
}

// --- Miro Logic ---
async function visualizeOnMiro() {
    console.log('Parsing schema...');
    const models = parsePrismaSchema(SCHEMA_PATH);
    console.log(`Found ${models.length} models.`);

    // Use the access token directly provided by the user previously
    // If this token is expired, we will need to ask for a new one or fix the redirect URL.
    const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y";

    const miro = new MiroApi(ACCESS_TOKEN);

    // Token validation removed as it is not supported in MiroApi directly
    console.log('Authenticated! Creating board...');

    const board = await miro.createBoard({
        name: 'SIP Database Structure',
        description: 'Generated from Prisma Schema',
    });

    console.log(`Board created: ${board.viewLink}`);

    // Visualization Parameters
    const START_X = 0;
    const START_Y = 0;
    const CARD_WIDTH = 300;
    const CARD_HEIGHT_BASE = 60;
    const FIELD_HEIGHT = 20;
    const GAP_X = 400;
    const GAP_Y = 300;
    const COLS = 5;

    const modelMap = new Map<string, { id: string, x: number, y: number }>();

    // 1. Create Nodes (Shapes for Models)
    let index = 0;
    for (const model of models) {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const x = START_X + col * GAP_X;
        const y = START_Y + row * GAP_Y;

        // Calculate height based on fields
        const height = CARD_HEIGHT_BASE + (model.fields.length * FIELD_HEIGHT);

        // Build content text
        let content = `<p><strong>${model.name}</strong></p><hr>`;
        content += model.fields.map(f => {
            const color = f.isRelation ? '#4262ff' : '#000000'; // Blue for relation
            return `<p style="font-size:10px; color:${color};">${f.name}: ${f.type}</p>`;
        }).join('');

        // Create App Card or Shape
        const shape = await board.createShapeItem({
            data: {
                content: content,
                shape: 'rectangle',
            },
            style: {
                fillColor: '#ffffff', // white
                borderColor: '#000000',
            },
            geometry: {
                width: CARD_WIDTH,
                height: height
            },
            position: {
                x: x,
                y: y
            }
        });

        modelMap.set(model.name, { id: shape.id, x, y });
        console.log(`Created model: ${model.name}`);
        index++;
    }

    // 2. Create Connectors (Relations)
    console.log('Creating relations...');
    for (const model of models) {
        const sourceNode = modelMap.get(model.name);
        if (!sourceNode) continue;

        for (const field of model.fields) {
            if (field.isRelation && field.relationTo) {
                const targetNode = modelMap.get(field.relationTo);

                // Avoid self-loops and duplicates (simple check: name < relationTo)
                // This is to prevent double arrows if both sides define relation, 
                // passing simpler visualization for now (one way arrow is fine or plain line)
                // Prisma defines relations on both sides usually. We just draw a line.
                if (targetNode && model.name < field.relationTo) {
                    await board.createConnector({
                        startItem: { id: sourceNode.id },
                        endItem: { id: targetNode.id },
                        style: {
                            strokeColor: '#888888',
                            endStrokeCap: 'arrow'
                        }
                        // shape: 'elbowed' // defaults usually fine
                    });
                }
            }
        }
    }

    console.log('\nvisualization complete! Open the board at:');
    console.log(board.viewLink);
}

visualizeOnMiro();
