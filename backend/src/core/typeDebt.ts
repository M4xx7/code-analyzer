import { SourceFile, SyntaxKind } from "ts-morph";
import { TypeDebtMetrics } from "../types";
import { CONSTANTS } from "../constants";


const SUPPRESSION_REGEX = /(?:\/\/|\/\*)\s*@ts-(ignore|expect-error|nocheck)/g;

export function getTypeDebt(sourceFile: SourceFile): TypeDebtMetrics {

  const metrics: TypeDebtMetrics = {
    explicitAny: 0,
    implicitAny: 0,
    asAny: 0,
    suppressions: 0,
    nonNullAssertions: 0,
    validTypes: 0,
    score: 0
  }

  sourceFile.forEachDescendant(node => {

    const kind = node.getKind();

    // explicit any
    if (kind === SyntaxKind.AnyKeyword) {
      const parent = node.getParent();
      if (parent?.getKind() !== SyntaxKind.AsExpression) {
        metrics.explicitAny++;
      }
    }

    // as any
    else if (kind === SyntaxKind.AsExpression) {

      const asExpression = node.asKindOrThrow(SyntaxKind.AsExpression);

      if (asExpression.getTypeNode()?.getKind() === SyntaxKind.AnyKeyword) {
        metrics.asAny++;
      }

    }

    // implicit any 
    if (kind === SyntaxKind.Parameter) {
      const parameter = node.asKindOrThrow(SyntaxKind.Parameter);

      if (!parameter.getTypeNode() && !parameter.getInitializer()) {
        const parentFunction = parameter.getParent();
        const grandParent = parentFunction?.getParent();

        // Ignore parameters in callbacks (e.g., .map(item => ...))
        const isCallback =
          (parentFunction?.getKind() === SyntaxKind.ArrowFunction ||
            parentFunction?.getKind() === SyntaxKind.FunctionExpression) &&
          grandParent?.getKind() === SyntaxKind.CallExpression;

        if (!isCallback) {
          metrics.implicitAny++;
        }
      }
    }

    // not null expression
    if (kind === SyntaxKind.NonNullExpression) {
      metrics.nonNullAssertions++;
    }


    // valid types
    else if (isValidType(kind)) {
      metrics.validTypes++;
    }

  });

  //suppressions
  const text = sourceFile.getFullText();
  const matches = text.match(SUPPRESSION_REGEX);
  metrics.suppressions = matches ? matches.length : 0;

  metrics.score = calculateScore(metrics);

  return metrics;
}

function calculateScore(metrics: TypeDebtMetrics): number {

  const totalDebtInstances =
    metrics.explicitAny +
    metrics.implicitAny +
    metrics.asAny +
    metrics.suppressions +
    metrics.nonNullAssertions;

  const totalTypeNodes = metrics.validTypes + totalDebtInstances;

  if (totalTypeNodes == 0) {
    return 100;
  }

  else {
    const baseScore = (metrics.validTypes / totalTypeNodes) * 100;
    const rawPenalty = calculatePenalty(metrics);
    const scaledPenalty = (rawPenalty / totalTypeNodes) * 100;
    return Math.max(0, Math.round(baseScore - scaledPenalty));
  }

}

function calculatePenalty(metrics: TypeDebtMetrics): number {
  return metrics.explicitAny * CONSTANTS.TYPE_DEBT_METRICS.EXPLICIT_ANY_WEIGHT
    + metrics.implicitAny * CONSTANTS.TYPE_DEBT_METRICS.IMPLICIT_ANY_WEIGHT
    + metrics.asAny * CONSTANTS.TYPE_DEBT_METRICS.AS_ANY_WEIGHT
    + metrics.nonNullAssertions * CONSTANTS.TYPE_DEBT_METRICS.NON_NULL_ASSERTION_WEIGHT
    + metrics.suppressions * CONSTANTS.TYPE_DEBT_METRICS.SUPPRESSION_WEIGHT;
}

function isValidType(kind: SyntaxKind): boolean {
  return (kind === SyntaxKind.TypeReference ||
    kind === SyntaxKind.StringKeyword ||
    kind === SyntaxKind.NumberKeyword ||
    kind === SyntaxKind.BooleanKeyword ||
    kind === SyntaxKind.InterfaceDeclaration ||
    kind === SyntaxKind.TypeAliasDeclaration);
}