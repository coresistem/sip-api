import { exec, spawn } from 'child_process';
import path from 'path';

interface CommitInfo {
    hash: string;
    shortHash: string;
    author: string;
    date: string;
    message: string;
    isCurrent: boolean;
}

export class GitService {
    private repoPath: string;

    constructor() {
        // Assume the repo root is the parent directory of the 'server' folder (or where package.json is)
        // Adjust this if the repo root is different
        this.repoPath = path.resolve(process.cwd(), '..');
        console.log('[GitService] Initialized with repoPath:', this.repoPath);
        console.log('[GitService] Current CWD:', process.cwd());
    }

    private executeGitCommand(args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            console.log(`[GitService] Executing: git ${args.join(' ')} in ${this.repoPath}`);
            const process = spawn('git', args, { cwd: this.repoPath });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                if (code !== 0) {
                    console.error(`[GitService] Command failed. Code: ${code}, Stderr: ${stderr}`);
                    reject(new Error(`Git command failed with code ${code}: ${stderr}`));
                } else {
                    resolve(stdout.trim());
                }
            });

            process.on('error', (err) => {
                console.error('[GitService] Spawn error:', err);
                reject(err);
            });
        });
    }

    async getCurrentHash(): Promise<string> {
        try {
            return await this.executeGitCommand(['rev-parse', 'HEAD']);
        } catch (error) {
            console.error('Failed to get current hash:', error);
            return '';
        }
    }

    async getHistory(limit: number = 20): Promise<CommitInfo[]> {
        // Format: %H|%h|%an|%ad|%s (Hash|ShortHash|Author|Date|Message)
        // Using a more unique delimiter to avoid conflicts with commit messages
        const delimiter = '|||||';
        const format = `%H${delimiter}%h${delimiter}%an${delimiter}%ad${delimiter}%s`;
        const args = ['log', `-${limit}`, `--format=${format}`, '--date=iso'];

        try {
            const output = await this.executeGitCommand(args);
            const currentHash = await this.getCurrentHash();

            console.log('[GitService] getHistory raw output length:', output.length);

            if (!output) return [];

            return output.split('\n').filter(Boolean).map(line => {
                const parts = line.split(delimiter);
                if (parts.length < 5) {
                    console.warn('[GitService] Malformed line:', line);
                    return null;
                }

                const [hash, shortHash, author, date, ...messageParts] = parts;
                const message = messageParts.join(delimiter); // Rejoin in case delimiter exists in message (unlikely)

                return {
                    hash,
                    shortHash,
                    author,
                    date,
                    message,
                    isCurrent: hash === currentHash
                };
            }).filter((item): item is CommitInfo => item !== null);
        } catch (error) {
            console.error('[GitService] getHistory failed:', error);
            throw error;
        }
    }

    async checkout(hash: string): Promise<string> {
        // Security check: hash must be alphanumeric
        if (!/^[a-zA-Z0-9]+$/.test(hash)) {
            throw new Error('Invalid commit hash');
        }

        console.log(`[GitService] Checking out commit ${hash}...`);

        // Using spawn for checkout
        return await this.executeGitCommand(['checkout', hash]);
    }
}

export const gitService = new GitService();
