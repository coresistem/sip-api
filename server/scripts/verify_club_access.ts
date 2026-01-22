
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';
const CLUB_CREDENTIALS = {
    email: 'owner@archeryclub.id',
    password: 'clubowner123'
};

async function verifyClubAccess() {
    try {
        console.log('1. Logging in as Club Owner...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, CLUB_CREDENTIALS);
        const { user, accessToken } = loginRes.data.data;

        console.log(`   Login Success. User: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Club ID: ${user.clubId}`);

        if (user.role !== 'CLUB' && user.role !== 'CLUB_OWNER') {
            console.error('❌ Role Mismatch: Expected CLUB or CLUB_OWNER');
            process.exit(1);
        }

        if (!user.clubId) {
            console.error('❌ Missing Club ID: Dashboard requires a clubId');
            process.exit(1);
        }

        console.log('✅ Club Owner credentials valid. Dashboard data requirements met.');

    } catch (error: any) {
        console.error('❌ Login Failed:', error.response?.data || error.message);
        if (error.response?.data?.message === 'Invalid credentials') {
            console.error('   Possible cause: Seed data not applied or password mismatch.');
        }
        process.exit(1);
    }
}

verifyClubAccess();
