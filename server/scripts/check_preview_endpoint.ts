
import { generateSipId } from '../src/services/sipId.service';
import prisma from '../src/lib/prisma';

async function testPreview() {
    try {
        console.log('Testing SIP ID generation...');
        // Test case: Athlete (04) in Jakarta 
        const role = 'ATHLETE';

        const cityIdDotted = '31.74';
        console.log(`\n--- Test 1: Dotted ID (${cityIdDotted}) ---`);
        const sipId1 = await generateSipId(role, cityIdDotted);
        console.log('Result:', sipId1);

        const cityIdClean = '3174';
        console.log(`\n--- Test 2: Clean ID (${cityIdClean}) ---`);
        const sipId2 = await generateSipId(role, cityIdClean);
        console.log('Result:', sipId2);

        // Check format matches expected pattern 04.XXXX.YYYY
        // If cityIdClean produces something weird, we know the issue.

        if (!sipId) {
            console.error('FAILED: No SIP ID returned');
        } else if (!sipId.startsWith('04.')) {
            console.error('FAILED: SIP ID format incorrect', sipId);
        } else {
            console.log('SUCCESS: SIP ID generated correctly');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPreview();
