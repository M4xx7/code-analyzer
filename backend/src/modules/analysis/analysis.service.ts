import {RepoService} from '../repository/repo.service';
import {calculateComplexity} from './metrics/complexity';
import {calculateDuplication} from './metrics/duplication';
import {calculateTypeSafety} from './metrics/typeSafety';
import type {AnalysisReport, MetricResult} from '../../core/types';
import {calculateCoupling} from "./metrics/coupling";

export class AnalysisService {
    constructor(private repoService: RepoService) {
    }

    async analyze(repoInput: string): Promise<AnalysisReport> {
        if (!repoInput?.trim()) {
            throw new Error('Repository input is required');
        }

        const repoPath = await this.repoService.fetchRepo(repoInput);

        try {

            const complexityRaw = await calculateComplexity(repoPath);
            const couplingRaw = await calculateCoupling(repoPath);
            const typeSafetyRaw = await calculateTypeSafety(repoPath);
            const duplicationRaw = await calculateDuplication(repoPath);

            const {owner, repoName} = this.repoService.parseRepoIdentifier(repoInput);

            return {
                repository: {
                    owner,
                    repoName,
                    url: `https://github.com/${owner}/${repoName}`,
                },
                metrics: {
                    complexity: this.toMetricResult(complexityRaw, 'Complexity'),
                    duplication: this.toMetricResult(duplicationRaw, 'Duplication'),
                    typeSafety: this.toMetricResult(typeSafetyRaw, 'Type Safety'),
                    coupling: this.toMetricResult(couplingRaw, 'Coupling')
                },
                overallScore: this.calculateOverall(
                    this.getScore(complexityRaw),
                    this.getScore(duplicationRaw)
                ),
            };
        } finally {
            await this.repoService.cleanup(repoPath);
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

    private getScore(result: any): number {
        return typeof result?.score === 'number' ? result.score : (typeof result === 'number' ? result : 0);
    }

    private calculateOverall(complexityScore: number, duplicationScore: number): number {
        return Math.round(((complexityScore + duplicationScore) / 2) * 100) / 100;
    }
}