import { simpleGit, SimpleGit } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CONSTANTS } from "../../constants/constants";

export class RepoService {
    private git: SimpleGit = simpleGit();

    async fetchRepo(repoInput: string): Promise<string> {
        if (!repoInput?.trim()) {
            throw new Error('Repository input is required');
        }

        const repoUrl = this.normalizeToGitUrl(repoInput);
        const { owner, repoName } = this.parseRepoIdentifier(repoInput);

        const targetDir = path.join(
            CONSTANTS.BASE_TEMP_DIR,
            `${owner}-${repoName}-${Date.now()}`
        );

        try {
            await this.git.clone(repoUrl, targetDir, [
                '--depth',
                String(CONSTANTS.GIT.SHALLOW_CLONE_DEPTH),
            ]);

            return targetDir;
        } catch (error: any) {
            throw new Error(`Failed to clone ${owner}/${repoName}: ${error.message}`);
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

        // owner/repo format
        if (str.includes('/')) {
            const [owner, repo] = str.split('/').map(s => s.trim());
            if (owner && repo) {
                return `https://github.com/${owner}/${repo}.git`;
            }
        }

        throw new Error(`Invalid repository format: "${input}". Use "owner/repo" or full GitHub URL.`);
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
                maxRetries: CONSTANTS.GIT.RETRY_COUNT,
                retryDelay: CONSTANTS.GIT.RETRY_DELAY_MS,
            });
        } catch (error) {
            console.error(`Non-fatal: Failed to clean up directory ${dirPath}:`, error);
        }
    }
}