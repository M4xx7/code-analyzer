import { RepoService } from '../repository/repo.service';
import { calculateComplexity } from './metrics/complexity';
import { calculateDuplication } from './metrics/duplication';
import { calculateTypeSafety } from './metrics/typeSafety';
import type { AnalysisReport, MetricResult } from '../../core/types';
import { calculateCoupling } from "./metrics/coupling";
import { Project } from 'ts-morph';

export class AnalysisService {

    constructor(private repoService: RepoService) {
    }

    async analyze(repoInput: string): Promise<AnalysisReport> {
        if (!repoInput?.trim()) {
            throw new Error('Repository input is required');
        }

        const repoPath = await this.repoService.fetchRepo(repoInput);

        try {


            const project = new Project({
                skipAddingFilesFromTsConfig: true,
                compilerOptions: {
                    skipLibCheck: true,
                    noResolve: true,
                },
            });

            project.addSourceFilesAtPaths([
                `${repoPath}/**/*.{ts,js,tsx,jsx}`,
                `!${repoPath}/**/*.test.{ts,js,tsx,jsx}`,
                `!${repoPath}/**/*.spec.{ts,js,tsx,jsx}`,
                `!${repoPath}/**/node_modules/**`,
                `!${repoPath}/**/dist/**`
            ]);


            console.log('starting caclulating...');

            const [complexityRaw, couplingRaw, typeSafetyRaw, duplicationRaw] = await Promise.all([
                calculateComplexity(project),
                calculateCoupling(project),
                calculateTypeSafety(project),
                calculateDuplication(project)
            ]);

            console.log('finished calculating.');

            const { owner, repoName } = this.repoService.parseRepoIdentifier(repoInput);

            return {
                repository: {
                    owner,
                    repoName
                },
                metrics: {
                    complexity: this.toMetricResult(complexityRaw, 'Complexity'),
                    duplication: this.toMetricResult(duplicationRaw, 'Duplication'),
                    typeSafety: this.toMetricResult(typeSafetyRaw, 'Type Safety'),
                    coupling: this.toMetricResult(couplingRaw, 'Coupling')
                },
            };
        } finally {

        }
    }

    private toMetricResult(result: any, defaultName: string): MetricResult {
        if (result && typeof result.score === 'number') {
            return {
                metricName: result.metricName || defaultName,
                score: result.score,
                description: result.description,
                issuesFound: result.issuesFound,
            };
        }

        return {
            metricName: defaultName,
            score: typeof result === 'number' ? result : 0,
        };
    }

}