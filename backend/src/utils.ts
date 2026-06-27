import { fdir } from "fdir";

export function getTargetFiles(directoryPath: string): string[] {
  const crawler = new fdir()
    .withFullPaths()
    .exclude((dirName) => 
      dirName === "node_modules" || 
      dirName === "dist" || 
      dirName === "build" || 
      dirName === ".git"
    )
    .filter((path) => path.endsWith(".ts") || path.endsWith(".js"))
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

export const toMB = (bytes: number) => Math.round(bytes / 1024 / 1024);