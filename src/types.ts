export interface FileReport {
  filePath: string;
  typeDebtMetrics: TypeDebtMetrics;
}

export interface TypeDebtMetrics {
  explicitAny: number;
  implicitAny: number;
  asAny: number;
  suppressions: number;
  nonNullAssertions: number;
  validTypes: number;
  score: number;
}
