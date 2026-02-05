
import axios from 'axios';

async function verify() {
    const baseUrl = 'http://localhost:5000/api/v1';
    console.log(`🔍 Checking plugin: ${process.argv[2]}`);
    try {
        const response = await axios.get(`${baseUrl}/${process.argv[2]}/health`);
        console.log(`✅ ${process.argv[2]} is UP: ${response.status}`);
    } catch (error: any) {
        console.log(`❌ ${process.argv[2]} check failed: ${error.response?.status || error.message}`);
        if (error.response?.status === 404) {
            console.log('💡 Tip: ModuleLoader might have failed to register this route.');
        }
    }
}

verify();
