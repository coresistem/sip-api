
import { createClient } from '@supabase/supabase-js';

const url = 'https://bcfqfkhstqfsqiakcony.supabase.co';
const key = 'sb_secret_As7RVCUOMkVZico1ENgb6Q_npvmQatT';

console.log(`Checking connection to: ${url}`);
console.log(`Using Key: ${key}`);

const supabase = createClient(url, key);

async function testConnection() {
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('❌ Connection Failed:', error.message);
            process.exit(1);
        }
        console.log('✅ Connection Successful!');
        console.log('Buckets found:', data.map(b => b.name).join(', '));
    } catch (err: any) {
        console.error('❌ Unexpected Error:', err.message);
        process.exit(1);
    }
}

testConnection();
