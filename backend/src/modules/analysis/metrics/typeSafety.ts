import { Project, SyntaxKind, Node } from 'ts-morph';
import type { MetricResult } from '../../../core/types';
import {CONSTANTS} from "../../../constants/constants";

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
            metricName: CONSTANTS.METRICS.TYPE_SAFETY,
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

            if (node.getKind() === SyntaxKind.AnyKeyword) {
                anyCount++;
            }

            if (node.getKind() === SyntaxKind.UnknownKeyword) {
                unknownCount++;
            }

            if (node.getKind() === SyntaxKind.NonNullExpression) {
                nonNullAssertions++;
            }

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

    const typeCoverage = totalRelevantNodes === 0 ? 1 : wellTypedNodes / totalRelevantNodes * 100;


    return {
        metricName: CONSTANTS.METRICS.TYPE_SAFETY,
        score:  parseFloat(typeCoverage.toFixed(1)),
        description: `Type coverage: ${(typeCoverage).toFixed(1)}%`,
    };
}