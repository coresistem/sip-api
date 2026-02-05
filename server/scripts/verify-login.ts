
const email = 'admin@sip.id';
const password = 'c0r3@link001';

async function testLogin() {
    console.log(`Testing login for ${email}...`);
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error during login:', error);
    }
}

testLogin();
