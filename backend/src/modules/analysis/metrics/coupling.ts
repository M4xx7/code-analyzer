import {Project, ImportDeclaration} from 'ts-morph';
import type {MetricResult} from '../../../core/types';
import {CONSTANTS} from "../../../constants/constants";

export async function calculateCoupling(project: Project): Promise<MetricResult> {

    const issues = [];
    let totalLocalImports = 0;
    let fileCount = 0;
    let maxCoupling = 0;

    for (const sourceFile of project.getSourceFiles()) {

        const localImports = sourceFile.getImportDeclarations().filter(i => {
            const moduleSpecifier = i.getModuleSpecifierValue();
            const isLocal = moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/');
            const isTypeOnly = i.isTypeOnly();
            return isLocal && !isTypeOnly;
        });

        const uniqueLocalModules = new Set(
            localImports.map(i => i.getModuleSpecifierValue())
        );

        const uniqueCount = uniqueLocalModules.size;

        totalLocalImports += uniqueCount;
        fileCount++;
        maxCoupling = Math.max(maxCoupling, uniqueCount);

        if (uniqueCount > CONSTANTS.IMPORTS_THRESHOLD) {
            issues.push({
                file: sourceFile.getBaseName(),
                uniqueDependencies: uniqueCount,
            });
        }
    }

    issues.sort((a, b) => b.uniqueDependencies - a.uniqueDependencies);


    const avgCoupling = fileCount > 0 ? totalLocalImports / fileCount : 0;

    return {
        metricName: CONSTANTS.METRICS.COUPLING,
        score: parseFloat(avgCoupling.toFixed(2)),
        description: `Analyzed ${fileCount} files. Avg local dependencies: ${avgCoupling.toFixed(2)}`,
        issuesFound: issues,
    };
}