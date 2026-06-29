import { promises as fs } from "fs";
import path from "path";
import { FileReport } from "../types"


export async function generateMarkdownReport(results: FileReport[], targetDir: string, outputPath = "type-debt-report.md") {
  if (results.length === 0) return;

  const totalFiles = results.length;
  const totalScore = results.reduce((acc, curr) => acc + curr.typeDebtMetrics.score, 0);
  const averageScore = Math.round(totalScore / totalFiles);

  const sortedResults = [...results].sort((a, b) =>
    a.typeDebtMetrics.score - b.typeDebtMetrics.score
  );

  let md = `Type Debt Report\n\n`;
  md += `> Generated on: ${new Date().toUTCString()}\n\n`;

  md += `## Summary\n`;
  md += `- Total Files Scanned: ${totalFiles}\n`;
  md += `- Average Score: ${averageScore}/100\n\n`;

  md += `## Top 10 Worst Offenders\n\n`;

  md += `| Score | File Path | Suppressions | Implicit \`any\` | Explicit \`any\` | \`as any\` | Non-Null (\`!\`) |\n`;

  md += `| :---: | :--- | :---: | :---: | :---: | :---: | :---: |\n`;

  const worstOffenders = sortedResults.slice(0, 10);

  const absoluteTargetDir = path.resolve(targetDir);

  for (const result of worstOffenders) {
    const metrics = result.typeDebtMetrics;
    const cleanPath = path.relative(absoluteTargetDir, result.filePath);
    md += `| ${metrics.score} | \`${cleanPath}\` | ${metrics.suppressions} | ${metrics.implicitAny} | ${metrics.explicitAny} | ${metrics.asAny} | ${metrics.nonNullAssertions} |\n`;
  }

  try {
    await fs.writeFile(outputPath, md, "utf-8");
    console.log(`\nMarkdown report successfully generated at: ${outputPath}`);
  } catch (error) {
    console.error(`\nFailed to write Markdown report:`, error);
  }
}