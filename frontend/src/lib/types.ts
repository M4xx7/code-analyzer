export interface Repository {
    owner: string;
    repoName: string;
}

export interface ComplexityIssue {
    file: string;
    functionName: string;
    complexity: number;
    nesting: number;
}

export interface CouplingIssue {
    file: string;
    uniqueDependencies: number;
}

export interface ComplexityMetric {
    metricName: string;
    score: number;
    description: string;
    issuesFound: ComplexityIssue[];
}

export interface DuplicationMetric {
    metricName: string;
    score: number;
    description: string;
}

export interface TypeSafetyMetric {
    metricName: string;
    score: number;
    description: string;
}

export interface CouplingMetric {
    metricName: string;
    score: number;
    description: string;
    issuesFound: CouplingIssue[];
}


export interface Metrics {
    complexity: ComplexityMetric;
    duplication: DuplicationMetric;
    typeSafety: TypeSafetyMetric;
    coupling: CouplingMetric;
}

export interface AnalysisResponse {
    repository: Repository;
    timestamp: string;
    metrics: Metrics;
    overallScore: number;
}

export type MetricType = 'complexity' | 'duplication' | 'typeSafety' | 'coupling';