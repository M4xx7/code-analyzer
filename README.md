# Type Debt

> A high-performance TypeScript static analyzer that calculates Type Debt and generates reports.

![Type Debt Output]([INSERT_SCREENSHOT_HERE_OR_LINK_TO_IMAGE])

## Overview

Type Debt is a fast CLI tool designed to traverse massive TypeScript codebases, analyze the Abstract Syntax Tree (AST), and evaluate how well the code is typed. It finds the "shortcuts" developers take to speed up the development process and grades every file on a 0-100 scale using a scaled density algorithm.

**It detects the occurrences of:**
- Explicit `any`
- Implicit `any`
- Type assertions (`as any`)
- Non-null assertions (`!`)
- Compiler suppressions (`@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`)

## Installation

You can install Type Debt globally on your machine to use it anywhere:

\`\`\`bash
npm install -g type-debt
\`\`\`

*(Alternatively, run it locally in your project using `npx type-debt .`)*

## Usage

Navigate to any directory containing TypeScript files and run the CLI:

\`\`\`bash
# Scan the current directory
type-debt .

# Scan a specific directory
type-debt ./src/backend
\`\`\`

The tool will process your files and generate a `type-debt-report.md` featuring an aggregated score and a ranked table of the top 10 worst offenders.

## Architecture

- **Parallel DFS Crawling:** Utilizes `fdir` to recursively map the file tree, isolating `.ts` and `.tsx` files while ignoring dependency folders.
- **Syntactic AST Analysis:** Uses `ts-morph` for structural parsing, entirely bypassing the slow semantic TypeScript TypeChecker.
- **Density-Scaled Scoring:** Density-based algorithm, ensuring fair grading for files of different sizes.

## Tech Stack
- **TypeScript** (Core language)
- **ts-morph** (AST parsing engine)
- **fdir** (High-speed file system crawler)
- **Vitest** (Testing framework)
- **tsup** (ESBuild bundler for the final CLI executable)