
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

async function main() {
    console.log('🧪 Standalone Plugin Verification');
    const baseUrl = 'http://localhost:5000/api/v1';

    try {
        const res = await axios.get(`${baseUrl}/scoring/health`);
        console.log('✅ Scoring Health:', res.data);
    } catch (e: any) {
        console.log('❌ Scoring Health Failed:', e.message);
        if (e.response) console.log('Response Details:', e.response.data);
    }
}

main();
