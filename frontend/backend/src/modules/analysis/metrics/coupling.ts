import {Project} from 'ts-morph';
import type {MetricResult} from '../../../core/types';
import {CONSTANTS} from "../../../constants/constants";

export async function calculateCoupling(repoPath: string): Promise<MetricResult> {
    const project = new Project({
        skipAddingFilesFromTsConfig: true,
    });

    project.addSourceFilesAtPaths(`${repoPath}/**/*.{ts,js}`);

    const issues = [];
    let totalImports = 0;
    let fileCount = 0;
    let maxCoupling = 0;

    for (const sourceFile of project.getSourceFiles()) {
        const filePath = sourceFile.getBaseName();

        const imports = sourceFile.getImportDeclarations();
        const uniqueModules = new Set(
            imports.map(i => i.getModuleSpecifierValue())
        );

        const importCount = imports.length;
        const uniqueCount = uniqueModules.size;

        totalImports += importCount;
        fileCount++;

        maxCoupling = Math.max(maxCoupling, uniqueCount);

        if (uniqueCount > CONSTANTS.IMPORTS_THRESHOLD) {
            issues.push({
                file: filePath,
                imports: importCount,
                uniqueDependencies: uniqueCount,
            });
        }
    }

    const avgCoupling = fileCount > 0 ? totalImports / fileCount : 0;

    return {
        metricName: CONSTANTS.METRICS.COUPLING,
        score: parseFloat(avgCoupling.toFixed(2)),
        description: `
        Analyzed ${fileCount} files
        Avg imports per file: ${avgCoupling.toFixed(1)}
        Max unique dependencies in a file: ${maxCoupling}
        `.trim(),
        issuesFound: issues,
    };
}