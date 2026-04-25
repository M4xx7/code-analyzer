import {Project, Node, SyntaxKind} from 'ts-morph';
import type {MetricResult} from '../../../core/types';
import {CONSTANTS} from '../../../constants/constants';

export async function calculateComplexity(repoPath: string): Promise<MetricResult> {

    const project = new Project({
        skipAddingFilesFromTsConfig: true,
    });

    project.addSourceFilesAtPaths(`${repoPath}/**/*.{ts,js}`);

    const issues = [];
    let totalComplexity = 0;
    let functionCount = 0;
    let maxComplexity = 0;

    for (const sourceFile of project.getSourceFiles()) {
        const filePath = sourceFile.getBaseName();

        const functions = sourceFile.getDescendants().filter(node =>
            Node.isFunctionDeclaration(node) ||
            Node.isMethodDeclaration(node) ||
            Node.isArrowFunction(node) ||
            Node.isFunctionExpression(node)
        );

        for (const fn of functions) {
            let complexity = CONSTANTS.INIT_COMPLEXITY;
            let maxNesting = 0;
            let currentNesting = 0;

            fn.forEachDescendant((node) => {
                if (
                    Node.isIfStatement(node) ||
                    Node.isForStatement(node) ||
                    Node.isWhileStatement(node) ||
                    Node.isDoStatement(node) ||
                    Node.isSwitchStatement(node) ||
                    Node.isCatchClause(node)
                ) {
                    currentNesting++;
                    maxNesting = Math.max(maxNesting, currentNesting);
                }

                if (node.getKind() === SyntaxKind.Block) {
                    currentNesting = Math.max(0, currentNesting - 1);
                }

                if (
                    Node.isIfStatement(node) ||
                    Node.isForStatement(node) ||
                    Node.isForInStatement(node) ||
                    Node.isForOfStatement(node) ||
                    Node.isWhileStatement(node) ||
                    Node.isDoStatement(node) ||
                    Node.isCatchClause(node) ||
                    Node.isCaseClause(node) ||
                    Node.isConditionalExpression(node) ||
                    Node.isSwitchStatement(node)
                ) {
                    complexity++;
                }

                // ⚡ Logical operators
                if (Node.isBinaryExpression(node)) {
                    const op = node.getOperatorToken().getText();

                    if (op === '&&' || op === '||' || op === '??') {
                        complexity++;
                    }
                }

                // ⚡ Optional chaining (modern complexity)
                if (node.getKind() === SyntaxKind.QuestionDotToken) {
                    complexity++;
                }
            });

            totalComplexity += complexity;
            functionCount++;
            maxComplexity = Math.max(maxComplexity, complexity);

            if (complexity > CONSTANTS.COMPLEXITY_THRESHOLDS.MEDIUM || maxNesting > 4) {
                issues.push({
                    file: filePath,
                    functionName: fn.getSymbol()?.getName() || 'anonymous',
                    complexity,
                    nesting: maxNesting,
                    severity:
                        complexity > CONSTANTS.COMPLEXITY_THRESHOLDS.HIGH || maxNesting > 6
                            ? 'high'
                            : 'medium',
                });
            }
        }
    }

    const avgComplexity =
        functionCount > 0 ? totalComplexity / functionCount : 0;

    return {
        metricName: 'Cyclomatic Complexity',
        score: parseFloat(avgComplexity.toFixed(2)),
        description: `
Analyzed ${functionCount} functions
Avg complexity: ${avgComplexity.toFixed(2)}
Max complexity: ${maxComplexity}
        `.trim(),
        issuesFound: issues,
    };
}