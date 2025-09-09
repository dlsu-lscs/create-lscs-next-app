#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { readmeTemplate } from './templates/readmeTemplate.js'
import { featureReadme } from './templates/featureReadme.js'

// ────────────────────────────────
// Utility: prompt user for input
// ────────────────────────────────
async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  // ────────────────────────────────
  // Step 0: Prerequisite checks
  // ────────────────────────────────
  try {
    const nodeVersion = execSync('node -v').toString().trim()
    const npmVersion = execSync('npm -v').toString().trim()
    console.log(`🟢 Node.js ${nodeVersion} detected`)
    console.log(`🟢 npm ${npmVersion} detected`)

    const majorNode = parseInt(nodeVersion.replace('v', '').split('.')[0], 10)
    if (majorNode < 18) {
      console.error('❌ Node.js 18 or higher is required for Next.js 14+')
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ Node.js and npm must be installed to run this script.')
    process.exit(1)
  }

  // ────────────────────────────────
  // Step 0.5: Get project name
  // ────────────────────────────────
  let projectName = process.argv[2]
  if (!projectName) {
    projectName = await askQuestion('📦 Enter your project name: ')
    if (!projectName) {
      console.error('❌ Project name is required.')
      process.exit(1)
    }
  }
  const projectPath = path.resolve(process.cwd(), projectName)

  // ────────────────────────────────
  // Step 1: Create a new Next.js app
  // ────────────────────────────────
  try {
    console.log('🚀 Creating Next.js app...')
    execSync(
      `npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"`,
      { stdio: 'inherit' }
    )
  } catch (err) {
    console.error('❌ Failed to create Next.js app:', err.message)
    process.exit(1)
  }

  // ────────────────────────────────
  // Step 2: Install additional dependencies
  // ────────────────────────────────
  try {
    console.log('📦 Installing Prettier, Prettier plugins, and Vitest...')
    execSync(
      `cd ${projectName} && npm install -D prettier prettier-plugin-tailwindcss vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`,
      { stdio: 'inherit' }
    )
  } catch (err) {
    console.error('❌ Failed to install dependencies:', err.message)
    process.exit(1)
  }

  // ────────────────────────────────
  // Step 3: Create base folder structure (FSM-aligned)
  // ────────────────────────────────
  console.log('📂 Setting up folder structure...')
  const srcPath = path.join(projectPath, 'src')

  const baseFolders = [
    'lib',
    'providers',
    'hooks',
    'types',
    'services',
    'components',
    'queries',
    'store',
    'config',
  ]
  baseFolders.forEach((folder) =>
    fs.mkdirSync(path.join(srcPath, folder), { recursive: true })
  )

  // ────────────────────────────────
  // Step 4: Create placeholder feature folder structure
  // ────────────────────────────────

  const featureBase = path.join(srcPath, 'features', '[feature-name]')
  const featureFolders = [
    'components',
    'containers',
    'hooks',
    'services',
    'queries',
    'types',
    'data',
  ]

  featureFolders.forEach((folder) =>
    fs.mkdirSync(path.join(featureBase, folder), { recursive: true })
  )

  // Add a README.md to explain feature folder usage
  fs.writeFileSync(
    path.join(featureBase, 'README.md'),
    featureReadme('[feature-name]')
  )

  // ────────────────────────────────
  // Step 5: Move globals.css → src/styles
  // ────────────────────────────────
  const stylesDir = path.join(srcPath, 'styles')
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir)
  }
  fs.renameSync(
    path.join(srcPath, 'app', 'globals.css'),
    path.join(stylesDir, 'globals.css')
  )

  // ────────────────────────────────
  // Step 6: Add Prettier config + ignore
  // ────────────────────────────────
  console.log('⚙️ Adding Prettier configuration...')
  const templatesPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    'templates'
  )

  fs.copyFileSync(
    path.join(templatesPath, '.prettierrc'),
    path.join(projectPath, '.prettierrc')
  )
  fs.copyFileSync(
    path.join(templatesPath, '.prettierignore'),
    path.join(projectPath, '.prettierignore')
  )

  // ────────────────────────────────
  // Step 7: Create README.md
  // ────────────────────────────────
  console.log('📝 Adding README.md...')
  fs.writeFileSync(
    path.join(projectPath, 'README.md'),
    readmeTemplate(projectName)
  )

  // ────────────────────────────────
  // Step 8: (Optional) GitHub workflows
  // ────────────────────────────────
  const includeGithub = await askQuestion(
    '📦 Do you want to include GitHub workflow files? (y/n): '
  )
  if (includeGithub.toLowerCase() === 'y') {
    console.log('🔧 Adding GitHub workflows...')
    fs.cpSync(
      path.join(templatesPath, '.github'),
      path.join(projectPath, '.github'),
      { recursive: true }
    )
  }

  // ────────────────────────────────
  // Step 9: Add Vitest config + setupTests.ts + FSM testing dirs
  // ────────────────────────────────
  console.log('🧪 Adding Vitest configuration...')

  fs.copyFileSync(
    path.join(templatesPath, 'vitest.config.ts'),
    path.join(projectPath, 'vitest.config.ts')
  )

  const testDir = path.join(projectPath, 'test')
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir)
  }
  fs.copyFileSync(
    path.join(templatesPath, 'setupTests.ts'),
    path.join(testDir, 'setupTests.ts')
  )

  // FSM: Add __tests__/unit and __tests__/e2e folders
  const testsBase = path.join(projectPath, '__tests__')
  ;['unit', 'e2e'].forEach((folder) =>
    fs.mkdirSync(path.join(testsBase, folder), { recursive: true })
  )

  // Add npm test script
  const pkgJsonPath = path.join(projectPath, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
  pkg.scripts = {
    ...pkg.scripts,
    test: 'vitest',
  }
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2))

  console.log(`✅ Project ${projectName} created successfully!`)
  console.log(`👉 Next steps:`)
  console.log(`   cd ${projectName}`)
  console.log(`   npm run lint`)
  console.log(`   npm run test`)
  console.log(`   npm run dev`)
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
