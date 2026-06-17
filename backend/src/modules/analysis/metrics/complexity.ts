import {Project, Node, SyntaxKind} from 'ts-morph';
import type {MetricResult} from '../../../core/types';
import {CONSTANTS} from '../../../constants/constants';

export async function calculateComplexity(project: Project): Promise<MetricResult> {


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

            fn.forEachDescendant((node) => {
                if (isControlFlowStatement(node)) {
                    complexity++;
                    const ancestors = node.getAncestors();
                    const depth = ancestors.filter(a =>
                        isControlFlowStatement(a)
                    ).length;
                    maxNesting = Math.max(maxNesting, depth + 1);
                }

                if (Node.isBinaryExpression(node)) {

                    const op = node.getOperatorToken().getText();
                    if (isLogicalOperator(op)) {
                        complexity++;
                    }
                }

                if (node.getKind() === SyntaxKind.QuestionDotToken) {
                    complexity++;
                }

            });

            totalComplexity += complexity;
            functionCount++;
            maxComplexity = Math.max(maxComplexity, complexity);

            if (complexity > CONSTANTS.COMPLEXITY_THRESHOLDS.MEDIUM || maxNesting > CONSTANTS.NESTING_THRESHOLDS.MEDIUM) {
                issues.push({
                    file: filePath,
                    functionName: fn.getSymbol()?.getName() || CONSTANTS.ANONYMOUS,
                    complexity,
                    nesting: maxNesting,
                });
            }
        }
    }

    issues.sort((a, b) => b.complexity - a.complexity);

    const avgComplexity = functionCount > 0 ? totalComplexity / functionCount : 0;

    return {
        metricName: CONSTANTS.METRICS.COMPLEXITY,
        score: parseFloat(avgComplexity.toFixed(2)),
        description: `
        Analyzed ${functionCount} functions.\n
        Avg complexity: ${avgComplexity.toFixed(2)}
        `.trim(),
        issuesFound: issues,
    };
}

function isControlFlowStatement(node: Node): boolean {

    return Node.isIfStatement(node) ||
        Node.isForStatement(node) ||
        Node.isWhileStatement(node) ||
        Node.isDoStatement(node) ||
        Node.isSwitchStatement(node) ||
        Node.isCatchClause(node);
}

function isLogicalOperator(operator: string): boolean {
    return operator === '&&' || operator === '||' || operator === '??';
}
