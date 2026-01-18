
async function main() {
    const url = 'http://localhost:3001/api/v1/auth/login';
    const payload = {
        email: 'admin@sip.id',
        password: 'superadmin123',
    };

    try {
        console.log(`Sending POST request to ${url}...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Login successful!');
            console.log('User Role:', data.data.user.role);
            const token = data.data.accessToken;
            console.log('Token obtained. Testing /auth/me...');

            const meResponse = await fetch('http://localhost:3001/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('/auth/me status:', meResponse.status);

            if (meResponse.ok) {
                console.log('✅ /auth/me successful');
            } else {
                console.error('❌ /auth/me failed');
                console.log(await meResponse.text());
            }

            console.log('Testing /api/v1/athletes (ClubDashboard call)...');
            const athletesResponse = await fetch('http://localhost:3001/api/v1/athletes?limit=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('/athletes status:', athletesResponse.status);
            if (athletesResponse.ok) {
                console.log('✅ /athletes successful');
            } else {
                console.error('❌ /athletes failed');
                console.log(await athletesResponse.text());
            }

        } else {
            console.error('❌ Login failed!');
            console.error('Data:', data);
        }
    } catch (error: any) {
        console.error('❌ Request failed!');
        console.error('Error:', error.message);
    }
}

main();
