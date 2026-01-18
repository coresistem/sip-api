
import { MiroApi } from '@mirohq/miro-api';

const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y";
const BOARD_ID = "uXjVGSGs3PU="; // SIP Roles & Workflows

async function renameHeader() {
    const miro = new MiroApi(ACCESS_TOKEN);
    const board = await miro.getBoard(BOARD_ID);

    console.log(`Accessing Board: ${board.viewLink}`);

    // Fetch items to find the header
    // Note: getItems returns an async iterator or paged response
    const items = await board.getItems({ type: 'shape' });

    let found = false;

    for await (const item of items) {
        if (item.data && item.data.content && item.data.content.includes('Input Data & Responsibility Matrix')) {
            console.log(`Found header item: ${item.id}`);

            await item.update({
                data: {
                    content: '<strong>Modules & Responsibility Matrix</strong>' // Update title
                }
            });

            console.log('Updated header content to "Modules & Responsibility Matrix"');
            found = true;
            break; // Assuming only one header
        }
    }

    if (!found) {
        console.log('Could not find the specific header to rename.');
    }
}

renameHeader().catch(console.error);
