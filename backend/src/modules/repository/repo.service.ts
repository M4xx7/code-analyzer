import { simpleGit, SimpleGit, SimpleGitOptions, } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CONSTANTS } from "../../constants/constants";
import { ValidationError } from '../../errors/validation.error';
import { CloneError } from '../../errors/clone.error';

export class RepoService {
    private git: SimpleGit = simpleGit({
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    } as Partial<SimpleGitOptions>);

    async fetchRepo(repoInput: string): Promise<string> {
        if (!repoInput?.trim()) {
            throw new ValidationError('Repository input is required');
        }

        const repoUrl = this.normalizeToGitUrl(repoInput);
        const { owner, repoName } = this.parseRepoIdentifier(repoInput);

        const targetDir = path.join(
            CONSTANTS.BASE_TEMP_DIR,
            `${owner}-${repoName}`
        );

        try {

            await this.git.clone(repoUrl, targetDir, [
                '--depth',
                String(CONSTANTS.GIT.SHALLOW_CLONE_DEPTH),
            ]);

            return targetDir;
        } catch (error: any) {
            throw new CloneError(`Failed to clone. Repository wasn't found.`);
        }
    }

    private normalizeToGitUrl(input: string): string {
        let str = input.trim();

        if (str.endsWith('.git')) return str;
        if (str.startsWith('https://github.com/')) {
            return str.endsWith('.git') ? str : `${str}.git`;
        }
        if (str.startsWith('git@github.com:')) {
            return str;
        }

        if (str.includes('/')) {
            const [owner, repo] = str.split('/').map(s => s.trim());
            if (owner && repo) {
                return `https://github.com/${owner}/${repo}.git`;
            }
        }

        throw new ValidationError(`Invalid repository format. Use "owner/repo" or full GitHub URL.`);
    }

    public parseRepoIdentifier(input: string): { owner: string; repoName: string } {
        let str = input.trim();

        const urlMatch = str.match(/github\.com[\/:]([^\/]+)\/([^\/\.#]+)/i);
        if (urlMatch) {
            return {
                owner: urlMatch[1]!,
                repoName: urlMatch[2]!,
            };
        }

        const parts = str.split('/').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
            return {
                owner: parts[0]!,
                repoName: parts[1]!,
            };
        }

        throw new Error(`Could not parse repository identifier: "${input}"`);
    }


    async cleanup(dirPath: string): Promise<void> {
        try {
            await fs.rm(dirPath, { 
                recursive: true, 
                force: true,
                maxRetries: 3,
                retryDelay: 100 
            });
        } catch (error: any) {
            console.error(`Non-fatal: Failed to clean up directory ${dirPath}:`, error.message);
        }
    }
}
