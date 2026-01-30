
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkApiResponse() {
    try {
        console.log('Connecting to database...');
        const user = await prisma.user.findUnique({
            where: { email: 'andi@athlete.id' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                coreId: true,
                avatarUrl: true
            }
        });

        if (!user) {
            console.error('User not found!');
            return;
        }

        console.log('--- DATABASE RECORD ---');
        console.log(JSON.stringify(user, null, 2));

        console.log('\n--- VERIFYING CONTROLLER LOGIC ---');

        // Simulating the EXACT query the controller would run
        // We only include fields that ACTUALLY exist in the schema for 'select'
        const controllerUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                avatarUrl: true,
                isActive: true,
                clubId: true,
                coreId: true,
                createdAt: true,
                lastLogin: true,
                athlete: {
                    select: {
                        id: true,
                        archeryCategory: true,
                        skillLevel: true,
                        division: true,
                    }
                },
                club: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true
                    }
                }
            }
        });

        console.log('--- CONTROLLER QUERY RESULT ---');
        console.log(JSON.stringify(controllerUser, null, 2));

        if (controllerUser && controllerUser.coreId) {
            console.log('\nSUCCESS: coreId IS returned by the Prisma query used in Controller.');
        } else {
            console.error('\nFAILURE: coreId is MISSING in Controller query result.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkApiResponse();
