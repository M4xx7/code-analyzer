import { Project, SyntaxKind, Node } from 'ts-morph';
import type { MetricResult } from '../../../core/types';

export async function calculateTypeSafety(repoPath: string): Promise<MetricResult> {
    const project = new Project({
        skipAddingFilesFromTsConfig: true,
        compilerOptions: {
            skipLibCheck: true,
            noResolve: true,
        },
    });

    project.addSourceFilesAtPaths(`${repoPath}/**/*.{ts,tsx}`);

    const sourceFiles = project.getSourceFiles();

    if (sourceFiles.length === 0) {
        return {
            metricName: 'Type Safety',
            score: 0,
            description: 'No TypeScript files found to analyze.',
        };
    }

    let anyCount = 0;
    let unknownCount = 0;
    let nonNullAssertions = 0;
    let totalRelevantNodes = 0;
    let wellTypedNodes = 0;

    for (const sourceFile of sourceFiles) {
        for (const node of sourceFile.getDescendants()) {
            // Count explicit 'any'
            if (node.getKind() === SyntaxKind.AnyKeyword) {
                anyCount++;
            }

            // Count 'unknown'
            if (node.getKind() === SyntaxKind.UnknownKeyword) {
                unknownCount++;
            }

            // Count non-null assertions (!)
            if (node.getKind() === SyntaxKind.NonNullExpression) {
                nonNullAssertions++;
            }

            // === Type coverage analysis ===
            // Only analyze nodes that can meaningfully have type information
            if (
                Node.isVariableDeclaration(node) ||
                Node.isPropertyDeclaration(node) ||
                Node.isPropertySignature(node) ||
                Node.isFunctionDeclaration(node) ||
                Node.isArrowFunction(node) ||
                Node.isMethodDeclaration(node) ||
                Node.isTypeAliasDeclaration(node) ||
                Node.isInterfaceDeclaration(node)
            ) {
                totalRelevantNodes++;

                let hasGoodType = false;

                if (Node.isVariableDeclaration(node) ||
                    Node.isPropertyDeclaration(node) ||
                    Node.isPropertySignature(node)) {
                    const typeNode = node.getTypeNode();
                    if (typeNode) {
                        hasGoodType = true;
                    }
                }

                try {
                    const inferredTypeText = node.getType().getText();
                    const isAnyType = inferredTypeText.includes('any') &&
                        !inferredTypeText.includes('unknown');

                    if (!isAnyType) {
                        hasGoodType = true;
                    }
                } catch {
                    // Some nodes may throw when calling getType() - ignore
                }

                if (hasGoodType) {
                    wellTypedNodes++;
                }
            }
        }
    }

    const typeCoverage = totalRelevantNodes === 0 ? 1 : wellTypedNodes / totalRelevantNodes;

    // Penalty for bad practices
    const penalty = anyCount * 3 + unknownCount * 0.8 + nonNullAssertions * 1.2;
    const normalizedPenalty = Math.min(penalty / Math.max(sourceFiles.length, 1), 40);

    let score = Math.max(0, Math.min(100, typeCoverage * 100 - normalizedPenalty));
    score = parseFloat(score.toFixed(1));

    return {
        metricName: 'Type Safety',
        score,
        description: `Type coverage: ${(typeCoverage * 100).toFixed(1)}%\n` +
            `any usages: ${anyCount}\n` +
            `unknown usages: ${unknownCount}\n` +
            `non-null assertions (!): ${nonNullAssertions}`,
    };
}