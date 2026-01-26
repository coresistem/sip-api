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
        const format = '%H|%h|%an|%ad|%s';
        const args = ['log', `-${limit}`, `--format=${format}`, '--date=iso'];

        const output = await this.executeGitCommand(args);
        const currentHash = await this.getCurrentHash();

        if (!output) return [];

        return output.split('\n').map(line => {
            const [hash, shortHash, author, date, message] = line.split('|');
            return {
                hash,
                shortHash,
                author,
                date,
                message,
                isCurrent: hash === currentHash
            };
        });
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
