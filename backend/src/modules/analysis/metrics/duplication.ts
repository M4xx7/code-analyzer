import {Project, Node} from 'ts-morph';
import type {MetricResult} from '../../../core/types';
import {CONSTANTS} from "../../../constants/constants";


export async function calculateDuplication(repoPath: string): Promise<MetricResult> {
    const project = new Project({
        skipAddingFilesFromTsConfig: true,
    });

    project.addSourceFilesAtPaths(`${repoPath}/**/*.{ts,js}`);

    const map = new Map<string, { file: string; name: string }[]>();
    let functionCount = 0;

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

            functionCount++;

            const normalizedBody = normalizeNode(body);

            if (!map.has(normalizedBody)) {
                map.set(normalizedBody, []);
            }

            map.get(normalizedBody)!.push({
                file: filePath,
                name: fn.getSymbol()?.getName() || CONSTANTS.ANONYMOUS,
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


    return {
        metricName:  CONSTANTS.METRICS.DUPLICATION,
        score: duplicates.length,
        description: `Found ${duplicates.length} duplicated code blocks across ${functionCount} functions.`,
        issuesFound: duplicates,
    };
}

export function normalizeNode(node: Node): string {
    return normalize(node);
}

function normalize(node: Node): string {
    const kind = node.getKind();

    if (Node.isIdentifier(node)) {
        return 'VAR';
    }

    if (
        Node.isNumericLiteral(node) ||
        Node.isStringLiteral(node) ||
        Node.isNoSubstitutionTemplateLiteral(node)
    ) {
        return 'LIT';
    }

    if (Node.isBinaryExpression(node)) {
        return `(${normalize(node.getLeft())} ${node.getOperatorToken().getText()} ${normalize(node.getRight())})`;
    }

    if (Node.isConditionalExpression(node)) {
        return `(${normalize(node.getCondition())} ? ${normalize(node.getWhenTrue())} : ${normalize(node.getWhenFalse())})`;
    }

    if (Node.isCallExpression(node)) {
        const args = node.getArguments().map(arg => normalize(arg)).join(', ');
        return `CALL(${args})`;
    }

    if (Node.isBlock(node)) {
        return `{ ${node.getStatements().map(stmt => normalize(stmt)).join('; ')} }`;
    }

    if (Node.isIfStatement(node)) {
        return `IF(${normalize(node.getExpression())}) ${normalize(node.getThenStatement())}`;
    }

    if (Node.isReturnStatement(node)) {
        return `RETURN ${node.getExpression() ? normalize(node.getExpression()!) : ''}`;
    }

    return node.getChildren().map(child => normalize(child)).join(' ');
}