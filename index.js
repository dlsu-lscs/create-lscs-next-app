#!/usr/bin/env node

/**
 * ----------------------------------------------------------------------
 *  create-lscs-next-app: Full Project & Feature CLI
 * ----------------------------------------------------------------------
 *
 *  Combines project creation and feature scaffolding.
 *
 *  Usage:
 *    npx create-lscs-next-app my-project
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
const templatesPath = path.join(__dirname, "templates");

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
  const argProject = process.argv[2];
  if (argProject && !argProject.startsWith("feature")) return argProject;

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

  // Step 0: Node.js check
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

  // Step 1: Feature command
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

  // Step 2: Project name
  const projectName = await getProjectName();
  const projectPath = path.resolve(process.cwd(), projectName);

  // Step 3: Create Next.js app
  console.log(
    chalk.blue(`⚡ Creating Next.js app "${projectName}" with Turbopack...`)
  );
  execSync(
    `npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --turbopack`,
    { stdio: "inherit", shell: true }
  );

  // Step 4: Add LSCS logo
  const publicDir = path.join(projectPath, "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  const logoSrc = path.join(templatesPath, "lscs-logo.png");
  const logoDest = path.join(publicDir, "lscs-logo.png");
  fs.copyFileSync(logoSrc, logoDest);
  console.log(chalk.green("🖼️ LSCS logo added to public folder"));

  // Step 5: Overwrite package.json
  console.log(chalk.blue("📦 Adding custom package.json..."));
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    packageJsonTemplate(projectName)
  );

  // Step 6: Install Prettier + script
  console.log(chalk.blue("📦 Installing Prettier..."));
  execSync(
    "npm install --save-dev prettier prettier-plugin-tailwindcss vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom",
    {
      cwd: projectPath,
      stdio: "inherit",
    }
  );
  const pkgJsonPath = path.join(projectPath, "package.json");
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
  pkgJson.scripts = pkgJson.scripts || {};
  pkgJson.scripts.format = "prettier --write .";
  pkgJson.scripts.test = "vitest";
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  console.log(chalk.green("🖌️ Prettier & Vitest installed"));

  // Step 7: Base folder structure
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

  // Step 8: Placeholder feature folder
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

  // Step 9: Move globals.css
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

  // Step 10: Copy page.tsx & layout.tsx
  const appDir = path.join(srcPath, "app");
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
  fs.copyFileSync(
    path.join(templatesPath, "page.tsx"),
    path.join(appDir, "page.tsx")
  );
  fs.copyFileSync(
    path.join(templatesPath, "layout.tsx"),
    path.join(appDir, "layout.tsx")
  );

  // Step 11: Prettier config
  fs.copyFileSync(
    path.join(templatesPath, ".prettierrc"),
    path.join(projectPath, ".prettierrc")
  );
  fs.copyFileSync(
    path.join(templatesPath, ".prettierignore"),
    path.join(projectPath, ".prettierignore")
  );

  // Step 12: README
  fs.writeFileSync(
    path.join(projectPath, "README.md"),
    readmeTemplate(projectName)
  );

  // Step 13: Vitest setup
  const testDir = path.join(projectPath, "test");
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
  fs.copyFileSync(
    path.join(templatesPath, "setupTests.ts"),
    path.join(testDir, "setupTests.ts")
  );
  ["unit", "e2e"].forEach((folder) =>
    fs.mkdirSync(path.join(projectPath, "__tests__", folder), {
      recursive: true,
    })
  );

  // Step 14: GitHub workflows (optional)
  const includeGithub = await askQuestion(
    "📦 Include GitHub workflows? (y/n): "
  );
  if (includeGithub.toLowerCase() === "y") {
    fs.cpSync(
      path.join(templatesPath, ".github"),
      path.join(projectPath, ".github"),
      { recursive: true }
    );
    console.log(chalk.green("🔧 GitHub workflows added"));
  }

  // Step 15: Completion
  console.log(chalk.green(`✅ Project "${projectName}" created successfully!`));
  console.log(chalk.blue(`👉 Next steps:`));
  console.log(chalk.blue(`   cd ${projectName}`));
  console.log(chalk.blue(`   npm install`));
  console.log(chalk.blue(`   npm run lint`));
  console.log(chalk.blue(`   npm run test`));
  console.log(chalk.blue(`   npm run format`));
  console.log(chalk.blue(`   npm run dev`));
}

// Execute main
main().catch((err) => {
  console.error(chalk.red("❌ Unexpected error:"), err);
  process.exit(1);
});
