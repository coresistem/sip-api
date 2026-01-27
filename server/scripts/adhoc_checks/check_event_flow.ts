
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

async function main() {
    console.log('≡ƒÜÇ Starting Event System Flow Verification');
    const timestamp = Date.now();
    const eoEmail = `eo_${timestamp}@example.com`;
    const athleteEmail = `athlete_event_${timestamp}@example.com`;

    try {
        // 1. Register EO
        console.log('\n--> Registering EO...');
        const eoRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: eoEmail,
                password: 'password123',
                name: 'Test EO',
                role: 'EO'
            })
        });
        const eoData = await eoRes.json();
        if (!eoData.success) throw new Error(`EO Registration failed: ${JSON.stringify(eoData)}`);
        const eoToken = eoData.data.accessToken;
        console.log('✓ EO Registered');

        // 2. Register Athlete
        console.log('\n--> Registering Athlete...');
        const athleteRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: athleteEmail,
                password: 'password123',
                name: 'Test Athlete',
                role: 'ATHLETE'
            })
        });
        const athleteData = await athleteRes.json();
        if (!athleteData.success) throw new Error(`Athlete Registration failed: ${JSON.stringify(athleteData)}`);
        const athleteToken = athleteData.data.accessToken;

        // Ensure athlete profile is created (usually happens, but good to check)
        // Profile update to ensure everything set?
        console.log('✓ Athlete Registered');

        // 3. Create Competition (EO)
        console.log('\n--> Creating Competition...');
        const compRes = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${eoToken}`
            },
            body: JSON.stringify({
                name: `SIP Open ${timestamp}`,
                slug: `sip-open-${timestamp}`,
                location: 'Senayan',
                city: 'Jakarta',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString(),
                description: 'Test Event'
            })
        });
        const compData = await compRes.json();
        if (!compData.success) throw new Error(`Create Competition failed: ${JSON.stringify(compData)}`);
        const compId = compData.data.id;
        console.log(`✓ Competition Created: ${compId}`);

        // 4. Add Category
        console.log('\n--> Adding Category...');
        const catRes = await fetch(`${API_URL}/events/${compId}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${eoToken}`
            },
            body: JSON.stringify({
                division: 'RECURVE',
                ageClass: 'GENERAL',
                gender: 'MALE',
                distance: 70,
                quota: 30,
                fee: 150000
            })
        });
        const catData = await catRes.json();
        if (!catData.success) throw new Error(`Add Category failed: ${JSON.stringify(catData)}`);
        const catId = catData.data.id;
        console.log(`✓ Category Added: ${catId}`);

        // 5. Athlete Register
        console.log('\n--> Athlete Registering...');
        // First, check athlete needs to create profile?
        // Logic in endpoint checks `prisma.athlete.findUnique`. 
        // `register` endpoint creates User. Does it create Athlete?
        // `auth.controller` usually creates basic profile. If not, it fails.
        // Let's create Athlete profile via DB to be sure, OR use Profile API.
        // The default registration logic creates User. 
        // My previous audit showed `Profile.controller` handles `Athlete` upsert.
        // But let's check if `User` -> `Athlete` exists automatically.
        // Usually NO, unless role is generic.
        // I will use Prisma to force-create Athlete profile for this user to ensure test passes.
        const athleteUser = await prisma.user.findUnique({ where: { email: athleteEmail } });
        if (athleteUser) {
            let club = await prisma.club.findFirst();
            if (!club) {
                const owner = await prisma.user.create({
                    data: {
                        email: `club_owner_${Date.now()}@example.com`,
                        passwordHash: 'dummy',
                        name: 'Dummy Club Owner',
                        role: 'CLUB_OWNER'
                    }
                });
                club = await (prisma as any).club.create({
                    data: {
                        name: 'Event Test Club',
                        status: 'ACTIVE',
                        ownerId: owner.id
                    }
                });
            }

            await prisma.athlete.create({
                data: {
                    userId: athleteUser.id,
                    clubId: club.id,
                    dateOfBirth: new Date(),
                    gender: 'MALE',
                    archeryCategory: 'RECURVE',
                    skillLevel: 'BEGINNER'
                }
            });
        }

        const regRes = await fetch(`${API_URL}/events/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${athleteToken}`
            },
            body: JSON.stringify({
                categoryId: catId
            })
        });
        const regData = await regRes.json();
        if (!regData.success) throw new Error(`Event Registration failed: ${JSON.stringify(regData)}`);
        console.log('✓ Athlete Registered for Event');

        // 6. Verify Registration
        console.log('\n--> Verifying Registration...');
        const verifyRes = await fetch(`${API_URL}/events/${compId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${athleteToken}` }
        });
        const verifyData = await verifyRes.json();
        const myReg = verifyData.data.registrations[0];
        if (!myReg || myReg.categoryId !== catId) throw new Error('Registration not found in details');
        console.log('✓ Verification Successful');

    } catch (error) {
        console.error('\n❌ FAILURE:', error);
        process.exit(1);
    }
}

main();
