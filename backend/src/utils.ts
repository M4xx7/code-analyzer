import { fdir } from "fdir";
import { stat } from "fs/promises";


export function getTargetFiles(directoryPath: string): string[] {
  const crawler = new fdir()
    .withFullPaths()
    .exclude((dirName) =>
      dirName === "node_modules" ||
      dirName === "dist" ||
      dirName === "build" ||
      dirName === ".git"
    )
    .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"))
    .crawl(directoryPath);

  return crawler.sync() as string[];
}


export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}


export async function validateDirectory(path: string) {

  let stats;

  try {
    stats = await stat(path);
  } catch {
    throw new Error(`Directory "${path}" does not exist.`);
  }

  if (!stats.isDirectory()) {
    throw new Error(`"${path}" is not a directory.`);
  }
}