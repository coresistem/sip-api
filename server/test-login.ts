import axios from 'axios';

async function testLogin() {
    console.log('Testing login for admin@sip.id...');
    try {
        const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'admin@sip.id',
            password: 'c0r3@link001'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log('Login Success:', JSON.stringify(response.data, null, 2));

        const { accessToken } = response.data.data;
        console.log('Testing /auth/me...');
        const meResponse = await axios.get('http://localhost:5000/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Origin': 'http://localhost:5173'
            }
        });
        console.log('/auth/me Success:', JSON.stringify(meResponse.data, null, 2));
    } catch (error: any) {
        if (error.response) {
            console.error(`Login Failed (${error.response.status}):`, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Login Error:', error.message);
        }
    }
}

testLogin();
