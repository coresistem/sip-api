import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api/v1';
const EMAIL = 'admin@sip.id';
const PASSWORD = 'superadmin123';

async function verify() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.data.accessToken;
        console.log('Login successful');

        // 2. Create dummy file
        const filePath = path.join(__dirname, 'test_avatar.png');
        // Minimal PNG
        const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082', 'hex');
        fs.writeFileSync(filePath, pngBuffer);

        // 3. Upload
        console.log('Uploading file...');
        const formData = new FormData();
        formData.append('image', fs.createReadStream(filePath));

        const uploadRes = await axios.post(`${API_URL}/upload/image`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Upload response:', uploadRes.data);

        // 4. Verify URL
        const uploadedUrl = uploadRes.data.data.url;
        if (!uploadedUrl || !uploadedUrl.startsWith('http')) {
            throw new Error(`Invalid URL returned: ${uploadedUrl}. Expected absolute URL starting with http.`);
        }

        console.log('✅ SUCCESS: Full URL returned:', uploadedUrl);

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (error: any) {
        console.error('❌ Verification failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

verify();
