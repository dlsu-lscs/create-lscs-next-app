#!/usr/bin/env node
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

// ────────────────────────────────
// Utility: ask a yes/no question
// ────────────────────────────────
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans.toLowerCase())
    })
  )
}

// ────────────────────────────────
// Utility: recursively copy a folder
// ────────────────────────────────
function copyFolderSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// ────────────────────────────────
// Step 1: Get project name
// ────────────────────────────────
const projectName = process.argv[2]
if (!projectName) {
  console.error(
    '❌ Please provide a project name: npx create-lscs-next-app my-app'
  )
  process.exit(1)
}

// ────────────────────────────────
// Step 2: Run create-next-app
// ────────────────────────────────
console.log('⚡ Creating Next.js app...')
execSync(
  `npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir`,
  { stdio: 'inherit' }
)

// ────────────────────────────────
// Step 3: Define custom structure
// ────────────────────────────────
const basePath = path.join(process.cwd(), projectName, 'src')

const folders = [
  'components',
  'features/shared',
  'lib',
  'queries',
  'store',
  'providers',
  'config',
  'styles',
  'types',
  '__tests__/unit',
  '__tests__/e2e',
]

// Create base folders
folders.forEach((folder) => {
  const fullPath = path.join(basePath, folder)
  fs.mkdirSync(fullPath, { recursive: true })
  fs.writeFileSync(path.join(fullPath, '.gitkeep'), '')
})

// Step 4: Create placeholder feature folder structure
const featureBase = path.join(basePath, 'features', '[feature-name]')
const featureFolders = [
  'components',
  'containers',
  'hooks',
  'services',
  'queries',
  'types',
  'data',
]

featureFolders.forEach((folder) => {
  const fullPath = path.join(featureBase, folder)
  fs.mkdirSync(fullPath, { recursive: true })
  fs.writeFileSync(path.join(fullPath, '.gitkeep'), '')
})

// ────────────────────────────────
// Step 5: Move globals.css → styles/
// ────────────────────────────────
const appGlobals = path.join(basePath, 'app', 'globals.css')
const stylesDir = path.join(basePath, 'styles')
const stylesGlobals = path.join(stylesDir, 'globals.css')

if (fs.existsSync(appGlobals)) {
  fs.renameSync(appGlobals, stylesGlobals)
  console.log('📦 Moved globals.css → styles/globals.css')
}

// ────────────────────────────────
// Step 6: Install Prettier + Vitest
// ────────────────────────────────
console.log('📦 Installing Prettier + Vitest...')
execSync(
  `cd ${projectName} && npm install -D prettier eslint-config-prettier eslint-plugin-prettier vitest @testing-library/react @testing-library/jest-dom jsdom`,
  { stdio: 'inherit' }
)

// ────────────────────────────────
// Step 7: Create Prettier config
// ────────────────────────────────
const prettierConfig = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'es5',
}
fs.writeFileSync(
  path.join(process.cwd(), projectName, '.prettierrc'),
  JSON.stringify(prettierConfig, null, 2)
)

// Prettier ignore
fs.writeFileSync(
  path.join(process.cwd(), projectName, '.prettierignore'),
  'node_modules\n.next\ndist\n'
)

// ────────────────────────────────
// Step 8: Update ESLint config
// ────────────────────────────────
const eslintPath = path.join(process.cwd(), projectName, '.eslintrc.json')
if (fs.existsSync(eslintPath)) {
  const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, 'utf-8'))
  eslintConfig.extends = Array.isArray(eslintConfig.extends)
    ? [...eslintConfig.extends, 'plugin:prettier/recommended']
    : ['next/core-web-vitals', 'plugin:prettier/recommended']
  fs.writeFileSync(eslintPath, JSON.stringify(eslintConfig, null, 2))
  console.log('✅ Updated .eslintrc.json to extend Prettier')
}

// ────────────────────────────────
// Step 9: Create Vitest config
// ────────────────────────────────
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
`
fs.writeFileSync(
  path.join(process.cwd(), projectName, 'vitest.config.ts'),
  vitestConfig
)

// ────────────────────────────────
// Step 10: Create test/setupTests.ts
// ────────────────────────────────
const testDir = path.join(process.cwd(), projectName, 'test')
fs.mkdirSync(testDir, { recursive: true })
fs.writeFileSync(
  path.join(testDir, 'setupTests.ts'),
  `import '@testing-library/jest-dom'`
)

// ────────────────────────────────
// Step 11: Add "test" script to package.json
// ────────────────────────────────
const pkgPath = path.join(process.cwd(), projectName, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
pkg.scripts = { ...pkg.scripts, test: 'vitest' }
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

// ────────────────────────────────
// Step 12: Add README (template or fallback)
// ────────────────────────────────
const readmeTemplatePath = path.join(
  process.cwd(),
  'templates',
  'README.template.md'
)

if (fs.existsSync(readmeTemplatePath)) {
  let readmeContent = fs.readFileSync(readmeTemplatePath, 'utf-8')

  // Replace placeholder with project name
  readmeContent = readmeContent.replace(/\$\{projectName\}/g, projectName)

  fs.writeFileSync(
    path.join(process.cwd(), projectName, 'README.md'),
    readmeContent
  )

  console.log('📄 README.md created from template')
}

// ────────────────────────────────
// Step 13: Optionally copy GitHub Actions workflows
// ────────────────────────────────
const projectRoot = path.join(process.cwd(), projectName)
const templatesGithub = path.join(process.cwd(), 'templates', '.github')

if (fs.existsSync(templatesGithub)) {
  const answer = await askQuestion(
    '🤖 Do you want to include GitHub Actions workflows? (y/n): '
  )
  if (answer === 'y' || answer === 'yes') {
    const destGithub = path.join(projectRoot, '.github')
    copyFolderSync(templatesGithub, destGithub)
    console.log('✅ .github folder with workflows copied!')
  } else {
    console.log('⏩ Skipped GitHub Actions workflows.')
  }
}

// ────────────────────────────────
// Done
// ────────────────────────────────
console.log(
  '✅ Project scaffolded with RnD architecture + Prettier + ESLint(Prettier) + Vitest + test/setupTests.ts + optional GitHub Actions + .gitkeep in empty folders + globals.css moved to styles/!'
)
