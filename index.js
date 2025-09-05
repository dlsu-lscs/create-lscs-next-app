#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Step 1: Get project name from CLI
const projectName = process.argv[2];
if (!projectName) {
  console.error(
    "❌ Please provide a project name: npx create-rnd-next-app my-app"
  );
  process.exit(1);
}

// Step 2: Run create-next-app
console.log("⚡ Creating Next.js app...");
execSync(
  `npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir`,
  { stdio: "inherit" }
);

// Step 3: Define your custom structure
const basePath = path.join(process.cwd(), projectName, "src");

// Global folders to be created inside src/
const folders = [
  "components",
  "features/shared",
  "lib",
  "queries",
  "store",
  "providers",
  "config",
  "styles",
  "types",
  "__tests__/unit",
  "__tests__/e2e",
];

// Create base folders
folders.forEach((folder) => {
  const fullPath = path.join(basePath, folder);
  fs.mkdirSync(fullPath, { recursive: true });
  fs.writeFileSync(path.join(fullPath, ".gitkeep"), "");
});

// Step 4: Create placeholder feature folder structure
const featureBase = path.join(basePath, "features", "[feature-name]");
const featureFolders = [
  "components",
  "containers",
  "hooks",
  "services",
  "queries",
  "types",
  "data",
];

featureFolders.forEach((folder) => {
  const fullPath = path.join(featureBase, folder);
  fs.mkdirSync(fullPath, { recursive: true });
  fs.writeFileSync(path.join(fullPath, ".gitkeep"), "");
});

// Step 5: Move globals.css into styles folder
const appGlobals = path.join(basePath, "app", "globals.css");
const stylesDir = path.join(basePath, "styles");
const stylesGlobals = path.join(stylesDir, "globals.css");

if (fs.existsSync(appGlobals)) {
  fs.renameSync(appGlobals, stylesGlobals);
  console.log("📦 Moved globals.css → styles/globals.css");
}

// Step 6: Install Prettier + Vitest
console.log("📦 Installing Prettier + Vitest...");
execSync(
  `cd ${projectName} && npm install -D prettier eslint-config-prettier eslint-plugin-prettier vitest @testing-library/react @testing-library/jest-dom jsdom`,
  { stdio: "inherit" }
);

// Step 7: Create Prettier config
const prettierConfig = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  trailingComma: "es5",
};
fs.writeFileSync(
  path.join(process.cwd(), projectName, ".prettierrc"),
  JSON.stringify(prettierConfig, null, 2)
);

// Step 8: Update ESLint config to include Prettier
const eslintPath = path.join(process.cwd(), projectName, ".eslintrc.json");
if (fs.existsSync(eslintPath)) {
  const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, "utf-8"));
  eslintConfig.extends = Array.isArray(eslintConfig.extends)
    ? [...eslintConfig.extends, "plugin:prettier/recommended"]
    : ["next/core-web-vitals", "plugin:prettier/recommended"];

  fs.writeFileSync(eslintPath, JSON.stringify(eslintConfig, null, 2));
  console.log("✅ Updated .eslintrc.json to extend Prettier");
}

// Step 9: Create Vitest config
const vitestConfig = `import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.ts',
  },
})
`;
fs.writeFileSync(
  path.join(process.cwd(), projectName, "vitest.config.ts"),
  vitestConfig
);

// Step 10: Create test/setupTests.ts
const testDir = path.join(process.cwd(), projectName, "test");
fs.mkdirSync(testDir, { recursive: true });
const setupTests = `import '@testing-library/jest-dom'`;
fs.writeFileSync(path.join(testDir, "setupTests.ts"), setupTests);

// Step 11: Inject "test" script into package.json
const pkgPath = path.join(process.cwd(), projectName, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
pkg.scripts = { ...pkg.scripts, test: "vitest" };
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Step 12: Add the comprehensive Project Development Guide to README.md
const readmeContent = `# ${projectName}

This project was bootstrapped with create-rnd-next-app.

## Development
- Organized folder structure
- Prettier + ESLint (with Prettier rules)
- Vitest + React Testing Library
- Global styles moved into \`src/styles/globals.css\`

## Scripts
- \`npm run dev\` → Start dev server
- \`npm run build\` → Build production bundle
- \`npm run start\` → Run production build
- \`npm run lint\` → Run ESLint
- \`npm run test\` → Run Vitest

## Folder Structure
\`\`\`
src/
  app/
  components/
  config/
  features/
  lib/
  providers/
  queries/
  store/
  styles/
  types/
  __tests__/
  test/
\`\`\`
`;
fs.writeFileSync(
  path.join(process.cwd(), projectName, "README.md"),
  readmeContent
);

console.log(
  "✅ Project scaffolded with RnD architecture + Prettier + ESLint(Prettier) + Vitest + test/setupTests.ts + .gitkeep in empty folders + globals.css moved to styles/!"
);
