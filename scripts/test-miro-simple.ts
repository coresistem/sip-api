
import { MiroApi } from '@mirohq/miro-api';

const ACCESS_TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_rr_IepgNvmd-PHTRVmmE48m614Y";
const BOARD_ID = "uXjVGSGyPCY=";

async function testShape() {
    const miro = new MiroApi(ACCESS_TOKEN);
    const board = await miro.getBoard(BOARD_ID);

    console.log(`Testing Creator Matrix Header...`);

    try {
        const payload = {
            data: { content: '<strong>User</strong> Original Data Source', shape: 'rectangle' },
            style: {
                fillColor: '#b2dfdb', // Teal
                fontSize: '24',
                textAlign: 'center'
            },
            geometry: { width: 1300, height: 50 },
            position: { x: 18000, y: 0 }
        };

        console.log("Sending:", JSON.stringify(payload));
        await board.createShapeItem(payload as any);
        console.log("Success Teal Header");

    } catch (e: any) {
        console.log("Failed");
        if (e.body) console.log(JSON.stringify(e.body, null, 2));
        else console.log(e.message);
    }
}

testShape();
