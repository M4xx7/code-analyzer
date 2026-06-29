import { getTargetFiles } from "./utils.js";
import { chunkArray, validateDirectory } from "./utils.js";
import { processChunk } from "./core/chunkProcessor.js";
import { FileReport } from "./types.js";
import { CONSTANTS } from "./constants.js";
import { generateMarkdownReport } from "./core/reporter.js";



const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const target = args[0] || ".";

runCLI(target).catch((err) => {
  console.error(`\n\x1b[31m Error: ${err.message}\x1b[0m\n`);
  process.exit(1);
});


async function runCLI(targetDir: string) {

  await validateDirectory(targetDir);

  console.log(`\nScanning directory: ${targetDir}`);
  const allFiles = getTargetFiles(targetDir);

  if (allFiles.length === 0) {
    throw new Error(`No TypeScript files found to process.`);
  }

  const fileChunks = chunkArray(allFiles, CONSTANTS.CHUNK_SIZE);

  let allResults: FileReport[] = [];

  for (const [index, chunk] of fileChunks.entries()) {

    const chunkResults = processChunk(chunk);
    allResults = allResults.concat(chunkResults);
    process.stdout.write(`\rProcessed chunk ${index + 1}/${fileChunks.length}`);
  }

  await generateMarkdownReport(allResults, targetDir);

}

function printHelp() {
  console.log(`
Type Debt Analyzer

Usage: npx tsx index.ts [directory]

Examples:
       npx tsx index.ts .
       npx tsx index.ts ./src
  `);
  process.exit(0);
}


