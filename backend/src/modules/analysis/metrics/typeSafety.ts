import { Project, SyntaxKind, Node } from 'ts-morph';
import type { MetricResult } from '../../../core/types';
import { CONSTANTS } from '../../../constants/constants';

export async function calculateTypeSafety(
    project: Project
): Promise<MetricResult> {
    const sourceFiles = project.getSourceFiles();

    if (sourceFiles.length === 0) {
        return {
            metricName: CONSTANTS.METRICS.TYPE_SAFETY,
            score: 0,
            description: 'No TypeScript files found to analyze.',
        };
    }

    let declarationCount = 0;

    let anyCount = 0;
    let asAnyCount = 0;
    let nonNullAssertionCount = 0;
    let tsIgnoreCount = 0;
    let tsNoCheckCount = 0;

    for (const sourceFile of sourceFiles) {
        const text = sourceFile.getFullText();

        tsIgnoreCount += (text.match(/@ts-ignore/g) ?? []).length;
        tsNoCheckCount += (text.match(/@ts-nocheck/g) ?? []).length;

        for (const node of sourceFile.getDescendants()) {
            // Count declarations to normalize project size
            if (
                Node.isVariableDeclaration(node) ||
                Node.isPropertyDeclaration(node) ||
                Node.isPropertySignature(node) ||
                Node.isParameterDeclaration(node) ||
                Node.isFunctionDeclaration(node) ||
                Node.isMethodDeclaration(node) ||
                Node.isArrowFunction(node)
            ) {
                declarationCount++;
            }

            if (node.getKind() === SyntaxKind.AnyKeyword) {
                anyCount++;
            }

            if (node.getKind() === SyntaxKind.NonNullExpression) {
                nonNullAssertionCount++;
            }

            if (Node.isAsExpression(node)) {
                const typeNode = node.getTypeNode();

                if (typeNode?.getKind() === SyntaxKind.AnyKeyword) {
                    asAnyCount++;
                }

            }
        }
    }

    const unsafePoints =
        anyCount +
        asAnyCount +
        nonNullAssertionCount +
        tsIgnoreCount +
        tsNoCheckCount;

    const score =
        declarationCount === 0
            ? 100
            : Math.max(
                  0,
                  100 - (unsafePoints / declarationCount) * 100
              );

    return {
        metricName: CONSTANTS.METRICS.TYPE_SAFETY,
        score: Number(score.toFixed(1)),
        description:
            `Type safety score: ${score.toFixed(1)}%. ` +
            `Found ${anyCount} any, ${asAnyCount} as any, ` +
            `${nonNullAssertionCount} non-null assertions, ` +
            `${tsIgnoreCount} @ts-ignore, ` +
            `${tsNoCheckCount} @ts-nocheck.`,
    };
}