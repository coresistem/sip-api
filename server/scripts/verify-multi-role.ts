
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Credentials from seed
const ADMIN_EMAIL = 'admin@sip.id';
const ADMIN_PASSWORD = 'superadmin123';
const USER_EMAIL = 'andi@athlete.id';
const USER_PASSWORD = 'athlete123';

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
};

const log = (msg: string, color: keyof typeof colors = 'reset') => {
    console.log(`${colors[color]}${msg}${colors.reset}`);
};

const step = (msg: string) => {
    console.log(`\n${colors.blue}>>> ${msg}${colors.reset}`);
};

async function login(email: string, password: string) {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        return res.data.data;
    } catch (error: any) {
        log(`Login failed for ${email}: ${error.response?.data?.message || error.message}`, 'red');
        throw error;
    }
}

async function main() {
    log('🚀 Starting Multi-Role Verification...', 'magenta');

    // 1. Initial Setup: Login as Admin and User
    step('Authenticating...');
    const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
    log(`✓ Admin logged in: ${admin.user.name}`, 'green');

    const user = await login(USER_EMAIL, USER_PASSWORD);
    log(`✓ User logged in: ${user.user.name} (Current Role: ${user.user.role})`, 'green');

    // 2. Check Email Endpoint
    step('Testing /auth/check-email...');
    try {
        const checkRes = await axios.get(`${API_URL}/auth/check-email?email=${USER_EMAIL}`);
        if (checkRes.data.data.exists) {
            log(`✓ Email check verified existence as expected`, 'green');
            log(`  Current roles: ${JSON.stringify(checkRes.data.data.currentRoles)}`, 'yellow');
        } else {
            log('❌ Email check failed: User should exist', 'red');
        }

        const checkRes2 = await axios.get(`${API_URL}/auth/check-email?email=nonexistent@example.com`);
        if (!checkRes2.data.data.exists) {
            log(`✓ Non-existent email check verified`, 'green');
        } else {
            log('❌ Non-existent email check failed', 'red');
        }
    } catch (error: any) {
        log(`❌ Check email failed: ${error.message}`, 'red');
    }

    // 3. Submit Role Request
    step('Testing Submit Role Request...');
    const NEW_ROLE = 'EO'; // Requesting Event Organizer role
    let requestId: string | null = null;

    try {
        const reqRes = await axios.post(
            `${API_URL}/role-requests`,
            {
                requestedRole: NEW_ROLE,
                nikDocumentUrl: 'http://example.com/ktp.jpg',
                certDocumentUrl: 'http://example.com/cert.jpg'
            },
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
        log(`✓ Role request submitted for ${NEW_ROLE}`, 'green');
        requestId = reqRes.data.data.id;
    } catch (error: any) {
        if (error.response?.data?.message?.includes('already pending')) {
            log('⚠️ Request already pending, finding existing request...', 'yellow');
            // Find the pending request
            const listRes = await axios.get(`${API_URL}/role-requests`, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            const pending = listRes.data.data.find((r: any) => r.requestedRole === NEW_ROLE && r.status === 'PENDING');
            if (pending) {
                requestId = pending.id;
                log(`✓ Found existing pending request: ${requestId}`, 'green');
            } else {
                log('❌ Could not find pending request', 'red');
                return;
            }
        } else if (error.response?.data?.message?.includes('already has this role')) {
            log('⚠️ User already has this role. Skipping request submission.', 'yellow');
            // Proceed to switch role test directly if possible, or verify admin sees nothing?
            // Determine if we should exit or continue.
            // If already has role, we can skip to step 6.
            log('  Skipping approval, moving to role verification...', 'yellow');
        } else {
            log(`❌ Submit request failed: ${error.response?.data?.message || error.message}`, 'red');
            return;
        }
    }

    // 4. Admin List & Approve
    if (requestId) {
        step('Testing Admin Approval...');
        try {
            // List pending
            const pendingRes = await axios.get(`${API_URL}/role-requests/pending`, {
                headers: { Authorization: `Bearer ${admin.accessToken}` }
            });
            const found = pendingRes.data.data.find((r: any) => r.id === requestId);

            if (found) {
                log(`✓ Admin sees pending request ${requestId}`, 'green');

                // Approve
                const approveRes = await axios.patch(
                    `${API_URL}/role-requests/${requestId}/approve`,
                    {},
                    { headers: { Authorization: `Bearer ${admin.accessToken}` } }
                );
                log(`✓ Admin approved request. Generated SIP ID: ${approveRes.data.data.newSipId}`, 'green');
            } else {
                log('❌ Admin did not find the pending request (might be already processed)', 'red');
            }
        } catch (error: any) {
            log(`❌ Admin approval failed: ${error.response?.data?.message || error.message}`, 'red');
        }
    }

    // 5. Verify User Roles
    step('Verifying User Roles Update...');
    try {
        // Need to refresh user data, login again or get profile
        const refreshUser = await login(USER_EMAIL, USER_PASSWORD);
        const roles = JSON.parse(refreshUser.user.roles || '[]');
        if (roles.includes(NEW_ROLE)) {
            log(`✓ User now has roles: ${roles.join(', ')}`, 'green');
        } else {
            // Check if it was "User already has this role" case
            if (refreshUser.user.role === NEW_ROLE || roles.includes(NEW_ROLE)) {
                log(`✓ User has roles: ${roles.join(', ')}`, 'green');
            } else {
                log(`❌ User missing new role ${NEW_ROLE}. Roles: ${roles.join(', ')}`, 'red');
            }
        }
    } catch (error: any) {
        log(`❌ Verification failed: ${error.message}`, 'red');
    }

    // 6. Switch Role
    step('Testing Switch Role...');
    try {
        const switchRes = await axios.patch(
            `${API_URL}/auth/switch-role`,
            { role: NEW_ROLE },
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );

        if (switchRes.data.data.activeRole === NEW_ROLE) {
            log(`✓ Role switched successfully to ${NEW_ROLE}`, 'green');
        } else {
            log(`❌ Switch role failed. Active Role: ${switchRes.data.activeRole}`, 'red');
        }

        // Switch back
        await axios.patch(
            `${API_URL}/auth/switch-role`,
            { role: 'ATHLETE' },
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
        log(`✓ Switched back to ATHLETE`, 'green');

    } catch (error: any) {
        log(`❌ Switch role failed: ${error.response?.data?.message || error.message}`, 'red');
    }

    log('\n🏁 Verification Completed', 'magenta');
}

main().catch(console.error);
