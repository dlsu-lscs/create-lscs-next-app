#!/usr/bin/env node

/**
 * ----------------------------------------------------------------------
 *  create-lscs-next-app: Interactive Feature Creation CLI
 * ----------------------------------------------------------------------
 *
 *  Fully cross-platform (Windows/macOS/Linux)
 *  Adds color-coded messages, interactive prompts, and feature scaffolding.
 *
 *  Features:
 *    - Interactive prompts for project and feature names
 *    - Cross-platform-safe file operations
 *    - Prettier + Vitest + GitHub workflows setup
 *    - FSM-aligned folder structure
 *
 *  Usage:
 *    npx create-lscs-next-app
 *    OR
 *    npx create-lscs-next-app feature <feature-name>
 *
 * ----------------------------------------------------------------------
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import chalk from "chalk";

// Templates
import { readmeTemplate } from "./templates/readmeTemplate.js";
import { featureReadme } from "./templates/featureReadme.js";
import { packageJsonTemplate } from "./templates/packageJson.js";

// ────────────────────────────────
// Utility: prompt user for input
// ────────────────────────────────
async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ────────────────────────────────
// CLI Entry for creating a feature directly
// Usage: npx create-lscs-next-app feature <feature-name>
// ────────────────────────────────
const command = process.argv[2];
const featureNameArg = process.argv[3];

if (command === "feature") {
  if (!featureNameArg) {
    console.error(
      chalk.red(
        "❌ Please provide a feature name: npx create-lscs-next-app feature <feature-name>"
      )
    );
    process.exit(1);
  }
  createFeature(featureNameArg);
  process.exit(0);
}

// ────────────────────────────────
// Feature Creation Function
// ────────────────────────────────
function createFeature(featureName) {
  const projectPath = process.cwd();
  const featureBase = path.join(projectPath, "src", "features", featureName);

  const featureFolders = [
    "components",
    "containers",
    "hooks",
    "services",
    "queries",
    "types",
    "data",
  ];

  featureFolders.forEach((folder) =>
    fs.mkdirSync(path.join(featureBase, folder), { recursive: true })
  );

  fs.writeFileSync(
    path.join(featureBase, "README.md"),
    featureReadme(featureName)
  );

  console.log(
    chalk.green(
      `✅ Feature "${featureName}" created successfully in src/features/${featureName}`
    )
  );
}

// ────────────────────────────────
// Main Interactive CLI for project creation
// ────────────────────────────────
async function main() {
  console.log(chalk.blueBright("🚀 LSCS Next.js App & Feature CLI"));

  // Step 0: Check Node.js & npm
  try {
    const nodeVersion = execSync("node -v", { stdio: "pipe", shell: true })
      .toString()
      .trim();
    const npmVersion = execSync("npm -v", { stdio: "pipe", shell: true })
      .toString()
      .trim();
    console.log(chalk.green(`🟢 Node.js ${nodeVersion} detected`));
    console.log(chalk.green(`🟢 npm ${npmVersion} detected`));

    const majorNode = parseInt(nodeVersion.replace("v", "").split(".")[0], 10);
    if (majorNode < 18) {
      console.error(
        chalk.red("❌ Node.js 18 or higher is required for Next.js 14+")
      );
      process.exit(1);
    }
  } catch (err) {
    console.error(
      chalk.red("❌ Node.js and npm must be installed to run this script.")
    );
    process.exit(1);
  }

  // Step 1: Prompt for project name
  let projectName = await askQuestion(
    chalk.yellow("📦 Enter your project name: ")
  );
  if (!projectName) {
    console.error(chalk.red("❌ Project name is required."));
    process.exit(1);
  }
  const projectPath = path.resolve(process.cwd(), projectName);

  // Step 2: Create Next.js app
  try {
    console.log(chalk.blue("⚡ Creating Next.js app..."));
    execSync(
      `npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"`,
      { stdio: "inherit", shell: true } // shell:true ensures Windows compatibility
    );
  } catch (err) {
    console.error(chalk.red("❌ Failed to create Next.js app:", err.message));
    process.exit(1);
  }

  // Step 3: Add custom package.json
  console.log(chalk.blue("📦 Adding package.json..."));
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    packageJsonTemplate(projectName)
  );

  // Step 4: Create base folder structure
  console.log(chalk.blue("📂 Setting up folder structure..."));
  const srcPath = path.join(projectPath, "src");
  const baseFolders = [
    "lib",
    "providers",
    "hooks",
    "types",
    "services",
    "components",
    "queries",
    "store",
    "config",
  ];
  baseFolders.forEach((folder) =>
    fs.mkdirSync(path.join(srcPath, folder), { recursive: true })
  );

  // Step 5: Create placeholder feature folder
  const featureBase = path.join(srcPath, "features", "[feature-name]");
  const featureFolders = [
    "components",
    "containers",
    "hooks",
    "services",
    "queries",
    "types",
    "data",
  ];
  featureFolders.forEach((folder) =>
    fs.mkdirSync(path.join(featureBase, folder), { recursive: true })
  );
  fs.writeFileSync(
    path.join(featureBase, "README.md"),
    featureReadme("[feature-name]")
  );

  // Step 6: Move globals.css safely
  const stylesDir = path.join(srcPath, "styles");
  if (!fs.existsSync(stylesDir)) fs.mkdirSync(stylesDir);
  const globalsSrc = path.join(srcPath, "app", "globals.css");
  const globalsDest = path.join(stylesDir, "globals.css");
  try {
    fs.renameSync(globalsSrc, globalsDest);
  } catch {
    fs.copyFileSync(globalsSrc, globalsDest);
    fs.unlinkSync(globalsSrc);
  }

  // Step 6b: Create page.tsx placeholder
  console.log(chalk.blue("📝 Adding page.tsx placeholder..."));

  const pageTsxPath = path.join(srcPath, "app", "page.tsx");

  // Ensure app folder exists
  const appDir = path.join(srcPath, "app");
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

  const pageTsxContent = `import React from "react";
import "../styles/globals.css";

/**
 * LSCS App Root Page
 *
 * This is the root page of your LSCS app.
 * Serves as a placeholder for future feature development.
 */

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800">Welcome to LSCS App</h1>
      <p className="text-gray-500 mt-2">
        This is a placeholder page. Start building your features inside src/features/
      </p>
    </main>
  );
}
`;

  fs.writeFileSync(pageTsxPath, pageTsxContent, "utf-8");

  // Step 7: Add Prettier configuration
  console.log(chalk.blue("⚙️ Adding Prettier configuration..."));
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const templatesPath = path.join(__dirname, "templates");
  fs.copyFileSync(
    path.join(templatesPath, ".prettierrc"),
    path.join(projectPath, ".prettierrc")
  );
  fs.copyFileSync(
    path.join(templatesPath, ".prettierignore"),
    path.join(projectPath, ".prettierignore")
  );

  // Step 8: Add README.md
  console.log(chalk.blue("📝 Adding README.md..."));
  fs.writeFileSync(
    path.join(projectPath, "README.md"),
    readmeTemplate(projectName)
  );

  // Step 9: Optional GitHub workflows
  const includeGithub = await askQuestion(
    chalk.yellow("📦 Include GitHub workflows? (y/n): ")
  );
  if (includeGithub.toLowerCase() === "y") {
    console.log(chalk.blue("🔧 Adding GitHub workflows..."));
    fs.cpSync(
      path.join(templatesPath, ".github"),
      path.join(projectPath, ".github"),
      { recursive: true }
    );
  }

  // Step 10: Vitest configuration + tests
  console.log(chalk.blue("🧪 Adding Vitest configuration..."));
  fs.copyFileSync(
    path.join(templatesPath, "vitest.config.ts"),
    path.join(projectPath, "vitest.config.ts")
  );

  const testDir = path.join(projectPath, "test");
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
  fs.copyFileSync(
    path.join(templatesPath, "setupTests.ts"),
    path.join(testDir, "setupTests.ts")
  );

  const testsBase = path.join(projectPath, "__tests__");
  ["unit", "e2e"].forEach((folder) =>
    fs.mkdirSync(path.join(testsBase, folder), { recursive: true })
  );

  // Add vitest to npm scripts
  const pkgJsonPath = path.join(projectPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
  pkg.scripts = { ...pkg.scripts, test: "vitest" };
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));

  // Step 11: Completion message
  console.log(chalk.green(`✅ Project "${projectName}" created successfully!`));
  console.log(chalk.blue(`👉 Next steps:`));
  console.log(chalk.blue(`   cd ${projectName}`));
  console.log(chalk.blue(`   npm install`));
  console.log(chalk.blue(`   npm run lint`));
  console.log(chalk.blue(`   npm run test`));
  console.log(chalk.blue(`   npm run dev`));
}

// Execute main with error handling
main().catch((err) => {
  console.error(chalk.red("❌ Unexpected error:"), err);
  process.exit(1);
});
