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

  // Step 4: Overwrite package.json
  console.log(chalk.blue("📦 Adding custom package.json..."));
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    packageJsonTemplate(projectName)
  );

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

  // Step 8: Create page.tsx placeholder (LSCS-style)
  const appDir = path.join(srcPath, "app");
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

  const pageContent = `import Image from "next/image";
import "../styles/globals.css";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/lscs-logo.svg"
          alt="LSCS logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>.
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://github.com/dlsu-lscs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit LSCS
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js Docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <span className="text-sm text-gray-500">
          © 2025 LSCS App
        </span>
      </footer>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(appDir, "page.tsx"), pageContent);

  // Step 8b: Create layout.tsx
  const layoutContent = `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LSCS App",
  description: "Generated by LSCS Next.js App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}>
        {children}
      </body>
    </html>
  );
}
`;
  fs.writeFileSync(path.join(appDir, "layout.tsx"), layoutContent);

  // Step 9: Prettier config
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
