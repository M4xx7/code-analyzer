import { Project } from "ts-morph";
import { getTypeDebt } from "./typeDebt";
import { FileReport } from "../types";


export function processChunk(chunk: string[]): FileReport[] {
  
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  project.addSourceFilesAtPaths(chunk);

  const chunkResults: FileReport[] = [];

  project.forgetNodesCreatedInBlock(() => {
    for (const file of project.getSourceFiles()) {
      chunkResults.push({
        filePath: file.getFilePath(),
        typeDebtMetrics: getTypeDebt(file)
      });
    }
  });

  for (const file of project.getSourceFiles()) {
    project.removeSourceFile(file);
  }

  return chunkResults;
} 