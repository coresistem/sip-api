import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';
const LOGIN_CREDENTIALS = {
    email: 'admin@sip.id',
    password: 'c0r3@link001'
};

async function testConsent() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, LOGIN_CREDENTIALS);
        const token = loginRes.data.data.accessToken;
        console.log('Login success.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('Testing Consent Save...');
        const consentData = {
            consentType: 'privacy_policy',
            isAccepted: true,
            version: '2026.1'
        };

        const res = await axios.post(`${API_URL}/profile/consent`, consentData, config);
        console.log('Consent Save Result:', JSON.stringify(res.data, null, 2));

        if (res.data.success) {
            console.log('TEST PASSED');
        } else {
            console.log('TEST FAILED');
        }
    } catch (error: any) {
        console.error('Test error:', error.response?.data || error.message);
    }
}

testConsent();
