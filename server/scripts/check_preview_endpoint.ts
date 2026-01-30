
import { generateCoreId } from '../src/services/coreId.service';
import prisma from '../src/lib/prisma';

async function testPreview() {
    try {
        console.log('Testing CORE ID generation...');
        // Test case: Athlete (04) in Jakarta 
        const role = 'ATHLETE';

        const cityIdDotted = '31.74';
        console.log(`\n--- Test 1: Dotted ID (${cityIdDotted}) ---`);
        const coreId1 = await generateCoreId(role, cityIdDotted);
        console.log('Result:', coreId1);

        const cityIdClean = '3174';
        console.log(`\n--- Test 2: Clean ID (${cityIdClean}) ---`);
        const coreId2 = await generateCoreId(role, cityIdClean);
        console.log('Result:', coreId2);

        // Check format matches expected pattern 04.XXXX.YYYY
        // If cityIdClean produces something weird, we know the issue.

        if (!coreId) {
            console.error('FAILED: No CORE ID returned');
        } else if (!coreId.startsWith('04.')) {
            console.error('FAILED: CORE ID format incorrect', coreId);
        } else {
            console.log('SUCCESS: CORE ID generated correctly');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPreview();
