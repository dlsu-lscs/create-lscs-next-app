#!/usr/bin/env node

/**
 * ----------------------------------------------------------------------
 *  create-lscs-next-app: Interactive Project & Feature Creation CLI
 * ----------------------------------------------------------------------
 *
 *  Fully cross-platform (Windows/macOS/Linux)
 *  Adds color-coded messages, interactive prompts, and feature scaffolding.
 *
 *  Features:
 *    - Accepts project name directly via CLI or prompts user
 *    - Always uses Turbopack for Next.js
 *    - Creates base folder structure, placeholder features, and pages
 *    - Sets up Prettier, Vitest, optional GitHub workflows
 *
 *  Usage:
 *    npx create-lscs-next-app my-project
 *    npx create-lscs-app my-project
 *    OR
 *    npx create-lscs-next-app          # prompts for project name
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesPath = path.join(__dirname, "templates"); // keep a single declaration

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
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
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
      `✅ Feature "${featureName}" created in src/features/${featureName}`
    )
  );
}

// ────────────────────────────────
// Determine Project Name
// ────────────────────────────────
async function getProjectName() {
  // First, check if called with CLI argument (npx create-lscs-next-app my-project)
  const argProject = process.argv[2];
  if (argProject && !argProject.startsWith("feature")) return argProject;

  // Otherwise, prompt user
  const name = await askQuestion(chalk.yellow("📦 Enter your project name: "));
  if (!name) {
    console.error(chalk.red("❌ Project name is required."));
    process.exit(1);
  }
  return name;
}

// ────────────────────────────────
// Main CLI Function
// ────────────────────────────────
async function main() {
  console.log(chalk.blueBright("🚀 LSCS Next.js App & Feature CLI"));

  // Step 0: Check Node.js
  try {
    const nodeVersion = execSync("node -v", { stdio: "pipe", shell: true })
      .toString()
      .trim();
    const majorNode = parseInt(nodeVersion.replace("v", "").split(".")[0], 10);
    if (majorNode < 18) {
      console.error(chalk.red("❌ Node.js 18+ required"));
      process.exit(1);
    }
    console.log(chalk.green(`🟢 Node.js ${nodeVersion} detected`));
  } catch {
    console.error(chalk.red("❌ Node.js must be installed."));
    process.exit(1);
  }

  // Step 1: Check for feature command
  const command = process.argv[2];
  const featureNameArg = process.argv[3];

  if (command === "feature") {
    if (!featureNameArg) {
      console.error(
        chalk.red(
          "❌ Provide feature name: npx create-lscs-next-app feature <feature-name>"
        )
      );
      process.exit(1);
    }
    createFeature(featureNameArg);
    return;
  }

  // Step 2: Determine project name
  const projectName = await getProjectName();
  const projectPath = path.resolve(process.cwd(), projectName);

  // Step 3: Create Next.js app with Turbopack
  console.log(
    chalk.blue(`⚡ Creating Next.js app "${projectName}" with Turbopack...`)
  );
  execSync(
    `npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --turbopack`,
    { stdio: "inherit", shell: true }
  );

  // Step 3b: Add LSCS logo to public folder
  const publicDir = path.join(projectPath, "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const logoSrc = path.join(__dirname, "templates", "lscs-logo.png");
  const logoDest = path.join(publicDir, "lscs-logo.png");
  fs.copyFileSync(logoSrc, logoDest);
  console.log(chalk.green("🖼️ LSCS logo added to public folder"));

  // Step 4: Overwrite package.json
  console.log(chalk.blue("📦 Adding custom package.json..."));
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    packageJsonTemplate(projectName)
  );

  // Step 4b: Install Prettier and add format script
  console.log(chalk.blue("📦 Installing Prettier..."));
  execSync("npm install --save-dev prettier", {
    cwd: projectPath,
    stdio: "inherit",
  });

  const pkgJsonPath = path.join(projectPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
  pkgJson.scripts = pkgJson.scripts || {};
  pkgJson.scripts.format = "prettier --write .";
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  console.log(chalk.green("🖌️ Prettier installed and format script added"));

  // Step 5: Create base folder structure
  console.log(chalk.blue("📂 Setting up folder structure..."));
  const srcPath = path.join(projectPath, "src");
  [
    "lib",
    "providers",
    "hooks",
    "types",
    "services",
    "components",
    "queries",
    "store",
    "config",
  ].forEach((f) => fs.mkdirSync(path.join(srcPath, f), { recursive: true }));

  // Step 6: Placeholder feature folder
  const featureBase = path.join(srcPath, "features", "[feature-name]");
  [
    "components",
    "containers",
    "hooks",
    "services",
    "queries",
    "types",
    "data",
  ].forEach((f) =>
    fs.mkdirSync(path.join(featureBase, f), { recursive: true })
  );
  fs.writeFileSync(
    path.join(featureBase, "README.md"),
    featureReadme("[feature-name]")
  );

  // Step 7: Move globals.css
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

  // Step 8: Copy page.tsx (or app.tsx) placeholder
  const appDir = path.join(srcPath, "app");
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

  const pageSrc = path.join(templatesPath, "page.tsx");
  const pageDest = path.join(appDir, "page.tsx");
  fs.copyFileSync(pageSrc, pageDest);

  // Step 8b: Copy layout.tsx
  const layoutSrc = path.join(templatesPath, "layout.tsx");
  const layoutDest = path.join(appDir, "layout.tsx");
  fs.copyFileSync(layoutSrc, layoutDest);

  // Step 9: Prettier config (reuse templatesPath)
  fs.copyFileSync(
    path.join(templatesPath, ".prettierrc"),
    path.join(projectPath, ".prettierrc")
  );
  fs.copyFileSync(
    path.join(templatesPath, ".prettierignore"),
    path.join(projectPath, ".prettierignore")
  );

  // Step 10: README
  fs.writeFileSync(
    path.join(projectPath, "README.md"),
    readmeTemplate(projectName)
  );

  // Step 11: Completion message
  console.log(chalk.green(`✅ Project "${projectName}" created successfully!`));
  console.log(chalk.blue(`👉 Next steps:`));
  console.log(chalk.blue(`   cd ${projectName}`));
  console.log(chalk.blue(`   npm install`));
  console.log(chalk.blue(`   npm run lint`));
  console.log(chalk.blue(`   npm run test`));
  console.log(chalk.blue(`   npm run dev`));
}

// Execute main
main().catch((err) => {
  console.error(chalk.red("❌ Unexpected error:"), err);
  process.exit(1);
});
