
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

// Config
const API_URL = 'http://localhost:3000/api/v1'; 

async function verifyImport() {
    console.log("Starting Verification...");
    try {
        console.log("1. Authenticating...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'eo@events.id', 
            password: 'eo123456'
        });

        // Debug response structure
        // console.log("Login Data Keys:", Object.keys(loginRes.data));
        
        const token = loginRes.data?.data?.accessToken;
        console.log("Got Token:", token ? "YES" : "NO");
        if (!token) throw new Error("No Access Token obtained");

        console.log("2. Checking Events...");
        // List Events to find one
        const eventsRes = await axios.get(`${API_URL}/eo/events`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        let eventId = eventsRes.data.data[0]?.id;
        console.log("Existing Event ID:", eventId);
        
        if (!eventId) {
            console.log("3. Creating Event...");
            const createRes = await axios.post(`${API_URL}/eo/events`, {
                name: "IanSEO Import Test Event",
                type: "REGIONAL",
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                registrationDeadline: new Date().toISOString(),
                venue: "Test Venue",
                city: "Test City",
                description: "Automated Test Event",
                status: "DRAFT",
                categories: [] 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Created Event Success:", createRes.data.success);
            eventId = createRes.data.data.id;
        }
        
        console.log("Using Event ID:", eventId);

        console.log("4. Uploading File...");
        const form = new FormData();
        const filePath = 'D:/Antigravity/sip/hdd/TOAC24.ods';
        if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
        
        form.append('file', fs.createReadStream(filePath));

        console.log(`Sending POST to ${API_URL}/eo/events/${eventId}/import/ianseo`);

        const uploadRes = await axios.post(`${API_URL}/eo/events/${eventId}/import/ianseo`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        console.log("Upload Result:", JSON.stringify(uploadRes.data, null, 2));

    } catch (error: any) {
        console.error("Test Failed at step:", error.stack);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
             console.error("Error Message:", error.message);
        }
    }
}

verifyImport();
