
import axios from 'axios';

async function testLogin() {
    const url = 'http://localhost:5000/api/v1/auth/login';
    const credentials = {
        email: 'admin@sip.id',
        password: 'c0r3@link001'
    };

    console.log('🧪 Testing Login with:', credentials.email);
    try {
        const response = await axios.post(url, credentials);
        console.log('✅ Login Successful!');
        console.log('User:', response.data.data.user.name);
        console.log('Role:', response.data.data.user.role);
    } catch (error: any) {
        console.log('❌ Login Failed:', error.response?.status || error.message);
        if (error.response) {
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testLogin();
