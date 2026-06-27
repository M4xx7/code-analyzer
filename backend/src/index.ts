import { performance } from "perf_hooks";
import { getTargetFiles } from "./utils.js";
import { chunkArray, toMB } from "./utils.js";
import { processChunk } from "./core/engine.js";
import { FileReport } from "./types.js";
import { CONSTANTS } from "./constants.js";
import { promises as fs } from "fs";
import path from "path";

function runCLI(targetDir: string) {
  const startTime = performance.now();

  console.log(`\nScanning directory: ${targetDir}`);
  const allFiles = getTargetFiles(targetDir);

  const fileChunks = chunkArray(allFiles, CONSTANTS.CHUNK_SIZE);


  let allResults: FileReport[] = [];

  for (const [index, chunk] of fileChunks.entries()) {

    const chunkResults = processChunk(chunk);
    allResults = allResults.concat(chunkResults);

    if (global.gc) {
      global.gc();
    } else {
      console.warn("Garbage collection not exposed. Run with --node-options='--expose-gc'");
    }

    process.stdout.write(`\rProcessed chunk ${index + 1}/${fileChunks.length}`);
  }


  generateMarkdownReport(allResults, targetDir);


  const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`\n\n Analysis complete in ${totalTime}s`);

}

const target = process.argv[2] || ".";
runCLI(target);



async function generateMarkdownReport(results: FileReport[], targetDir: string, outputPath = "type-debt-report.md") {
  if (results.length === 0) return;

  const totalFiles = results.length;
  const totalScore = results.reduce((acc, curr) => acc + curr.typeDebtMetrics.score, 0);
  const averageScore = Math.round(totalScore / totalFiles);

  const sortedResults = [...results].sort((a, b) =>
    a.typeDebtMetrics.score - b.typeDebtMetrics.score
  );

  let md = `Type Debt Report\n\n`;
  md += `> Generated on: ${new Date().toUTCString()}\n\n`;

  md += `## Global Summary\n`;
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
    console.log(`\n📄 Markdown report successfully generated at: ${outputPath}`);
  } catch (error) {
    console.error(`\n❌ Failed to write Markdown report:`, error);
  }
}