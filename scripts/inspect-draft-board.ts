
import { MiroApi } from '@mirohq/miro-api';

const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y"; // Using same token
const BOARD_ID = "uXjVGSQcBno="; // User's new board

async function inspectBoard() {
    try {
        const miro = new MiroApi(ACCESS_TOKEN);
        const board = await miro.getBoard(BOARD_ID);

        console.log(`Accessing Board: ${BOARD_ID}`);

        // Fetch items (shapes, sticky_notes, texts)
        // Note: The SDK returns an async iterator
        const items = await board.getAllItems();

        let count = 0;
        console.log("\n--- BOARD CONTENT ---");

        for await (const item of items) {
            // Debug first item
            if (count === 0 && !('content' in (item.data || {}))) {
                // console.log("First item structure:", JSON.stringify(item, null, 2)); 
            }

            // Check for content/text
            let text = '';
            // Safe access
            if (item && item.data && 'content' in item.data) {
                text = (item.data as any).content;
            }

            // Clean up HTML tags if present
            const cleanText = text.replace(/<[^>]*>?/gm, ' ').trim();

            if (cleanText) {
                console.log(`[${item.type}] ${cleanText}`);
                count++;
            }
        }

        if (count === 0) {
            console.log("Board appears empty or accessible items have no text.");
        } else {
            console.log(`\nFound ${count} text items.`);
        }

    } catch (e: any) {
        console.error("Error accessing board:", e.message);
        if (e.body) console.error(JSON.stringify(e.body, null, 2));
    }
}

inspectBoard();
