import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import { calculatePenalty, calculateScore, getTypeDebt } from "../core/typeDebt";
import { TypeDebtMetrics } from "../types";

describe("Type Debt Analysis", () => {
  it("should correctly identify all forms of type debt", () => {

    const project = new Project({ useInMemoryFileSystem: true });

    const sourceCode = `

      interface ValidUser { id: number; }

      // @ts-ignore
      const id: any = 123;
      
      const user = fetchUser() as any;
      
      function process(payload) {
        console.log(payload!.data);
      }
    `;

    const sourceFile = project.createSourceFile("test.ts", sourceCode);

    const metrics = getTypeDebt(sourceFile);

    expect(metrics.explicitAny).toBe(1);
    expect(metrics.asAny).toBe(1);
    expect(metrics.suppressions).toBe(1);
    expect(metrics.implicitAny).toBe(1);
    expect(metrics.nonNullAssertions).toBe(1);
    expect(metrics.validTypes).toBeGreaterThan(0);

  });

  it("should correctly calculate penalty", () => {

    const metrics: TypeDebtMetrics = {
      explicitAny: 2,
      implicitAny: 3,
      asAny: 2,
      suppressions: 1,
      nonNullAssertions: 1,
      validTypes: 40,
      score: 0
    }

    const penalty = calculatePenalty(metrics);
    expect(penalty).toBe(22);

  });



  it("should correctly calculate score for ordinary data", () => {

    let metrics: TypeDebtMetrics = {
      explicitAny: 2,
      implicitAny: 3,
      asAny: 2,
      suppressions: 1,
      nonNullAssertions: 1,
      validTypes: 40,
      score: 0
    }

    metrics.score = calculateScore(metrics);
    expect(metrics.score).toBe(37);

  });

    it("should correctly calculate score when no type nodes were found in the file", () => {

    let metrics: TypeDebtMetrics = {
      explicitAny: 0,
      implicitAny: 0,
      asAny: 0,
      suppressions: 0,
      nonNullAssertions: 0,
      validTypes: 0,
      score: 0
    }

    metrics.score = calculateScore(metrics);
    expect(metrics.score).toBe(100);

  });


})

