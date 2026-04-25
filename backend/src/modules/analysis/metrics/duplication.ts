import { Project, Node } from 'ts-morph';
import type { MetricResult } from '../../../core/types';

function normalizeNode(node: Node): string {
    // Clone text and normalize identifiers/literals
    let text = node.getText();

    // Replace variable names
    text = text.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, 'VAR');

    // Replace numbers
    text = text.replace(/\b\d+\b/g, 'NUM');

    // Replace strings
    text = text.replace(/(['"`]).*?\1/g, 'STR');

    return text;
}

export async function calculateDuplication(repoPath: string): Promise<MetricResult> {
    const project = new Project({
        skipAddingFilesFromTsConfig: true,
    });

    project.addSourceFilesAtPaths(`${repoPath}/**/*.{ts,js}`);

    const map = new Map<string, { file: string; name: string }[]>();

    for (const sourceFile of project.getSourceFiles()) {
        const filePath = sourceFile.getBaseName();

        const functions = sourceFile.getDescendants().filter(node =>
            Node.isFunctionDeclaration(node) ||
            Node.isMethodDeclaration(node) ||
            Node.isArrowFunction(node) ||
            Node.isFunctionExpression(node)
        );

        for (const fn of functions) {
            const body = fn.getBody();
            if (!body) continue;

            const normalized = normalizeNode(body);

            if (!map.has(normalized)) {
                map.set(normalized, []);
            }

            map.get(normalized)!.push({
                file: filePath,
                name: fn.getSymbol()?.getName() || 'anonymous',
            });
        }
    }

    const duplicates = [];
    let duplicatedBlocks = 0;

    for (const [_, occurrences] of map.entries()) {
        if (occurrences.length > 1) {
            duplicatedBlocks += occurrences.length;

            duplicates.push({
                count: occurrences.length,
                locations: occurrences,
            });
        }
    }

    const score = duplicatedBlocks;

    return {
        metricName: 'Code Duplication',
        score,
        description: `Found ${duplicates.length} duplicated code blocks across functions.`,
        issuesFound: duplicates,
    };
}