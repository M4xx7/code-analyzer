export interface RepositoryInfo {
    owner: string;
    repoName: string;
    url: string;
}

export interface MetricResult {
    metricName: string;
    score: number;
    description?: string;
    issuesFound?: any[];
}

export interface ComplexityIssue {
    file: string;
    functionName: string;
    complexity: number;
    severity: 'low' | 'medium' | 'high';
}

export interface AnalysisReport {
    repository: RepositoryInfo;
    metrics: {
        complexity: MetricResult;
        duplication: MetricResult;
        typeSafety: MetricResult;
        coupling: MetricResult;
    };
    overallScore: number;
}