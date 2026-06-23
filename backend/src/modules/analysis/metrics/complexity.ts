import { Project, SyntaxKind } from 'ts-morph';

export async function calculateComplexity(project: Project): Promise<any> {
    let totalSystemComplexity = 0;
    const issuesFound: string[] = [];

    const files = project.getSourceFiles();

    for (const file of files) {
        let fileComplexity = 0;

        // .forEachDescendant is the fastest native traversal method in TS.
        // It walks top-down in a single pass. No looking up the tree!
        file.forEachDescendant((node) => {
            const kind = node.getKind();

            // 1. Base complexity: Every function/method starts with a complexity of 1
            if (
                kind === SyntaxKind.FunctionDeclaration ||
                kind === SyntaxKind.MethodDeclaration ||
                kind === SyntaxKind.ArrowFunction ||
                kind === SyntaxKind.FunctionExpression
            ) {
                fileComplexity++;
            }

            // 2. Control flow: Every branch adds 1 to the complexity
            if (
                kind === SyntaxKind.IfStatement ||
                kind === SyntaxKind.WhileStatement ||
                kind === SyntaxKind.DoStatement ||
                kind === SyntaxKind.ForStatement ||
                kind === SyntaxKind.ForInStatement ||
                kind === SyntaxKind.ForOfStatement ||
                kind === SyntaxKind.CaseClause ||
                kind === SyntaxKind.CatchClause ||
                kind === SyntaxKind.ConditionalExpression || // The ternary operator (? :)
                kind === SyntaxKind.AmpersandAmpersandToken || // &&
                kind === SyntaxKind.BarBarToken // ||
            ) {
                fileComplexity++;
            }
        });

        totalSystemComplexity += fileComplexity;

        // Flag files that are absolute spaghetti code
        if (fileComplexity > 50) {
            issuesFound.push(`${file.getBaseName()} has extreme complexity (${fileComplexity} branches).`);
        }
    }

    // Calculate a rough health score out of 100 based on average complexity per file
    const avgComplexity = files.length > 0 ? totalSystemComplexity / files.length : 0;
    
    // If average complexity per file is 10, score is 80. If it's 50, score is 0.
    const score = Math.max(0, Math.min(100, 100 - (avgComplexity * 2)));

    return {
        metricName: 'Cyclomatic Complexity',
        score: Math.round(score),
        description: `Total branches: ${totalSystemComplexity} (Avg: ${avgComplexity.toFixed(1)} per file)`,
        issuesFound: issuesFound.slice(0, 5) // Keep terminal output clean
    };
}