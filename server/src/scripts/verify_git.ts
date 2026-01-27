import { gitService } from '../modules/core/system/git.service.js';

async function verifyGitService() {
    console.log('--- Verifying Git Service ---');
    try {
        console.log('1. Fetching Current Hash...');
        const currentHash = await gitService.getCurrentHash();
        console.log(`PASS: Current Hash = ${currentHash}`);

        console.log('2. Fetching Commit History (limit 5)...');
        const history = await gitService.getHistory(5);
        console.log(`PASS: Retrieved ${history.length} commits.`);
        if (history.length > 0) {
            console.log('Sample Commit:', history[0]);
        }

        console.log('3. Verification Complete.');
    } catch (error) {
        console.error('FAIL: Verification failed', error);
        process.exit(1);
    }
}

verifyGitService();
