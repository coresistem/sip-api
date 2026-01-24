
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

async function testEndpoints() {
    console.log('--- Testing Marketplace Endpoints ---');

    // 1. Public: List Products
    try {
        const res = await axios.get(`${API_URL}/marketplace/products`);
        console.log(`✅ Products: ${res.status} OK - ${res.data.data.length} items`);
    } catch (e: any) {
        console.log(`❌ Products Failed: ${e.response?.status} - ${e.response?.data?.message || e.message}`);
    }

    // 2. Protected: Get Cart (Simulation - might fail without invalid token, but checking server liveliness)
    // We expect 401 Unauthorized if not logged in, but 500 is the target.
    try {
        const res = await axios.get(`${API_URL}/marketplace/cart`);
        console.log(`✅ Cart: ${res.status} OK`);
    } catch (e: any) {
        console.log(`ℹ️ Cart Response: ${e.response?.status} - ${e.response?.data?.message || e.message}`);
    }

    // 3. Protected: List Orders
    try {
        const res = await axios.get(`${API_URL}/marketplace/orders`);
        console.log(`✅ Orders: ${res.status} OK`);
    } catch (e: any) {
        console.log(`ℹ️ Orders Response: ${e.response?.status} - ${e.response?.data?.message || e.message}`);
    }
}

testEndpoints();
