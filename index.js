#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Step 1: Get project name from CLI
const projectName = process.argv[2]
if (!projectName) {
  console.error(
    '❌ Please provide a project name: npx create-rnd-next-app my-app'
  )
  process.exit(1)
}

// Step 2: Run create-next-app
console.log('⚡ Creating Next.js app...')
execSync(
  `npx create-next-app@latest ${projectName} --typescript --eslint --tailwind --app --src-dir`,
  { stdio: 'inherit' }
)

// Step 3: Define your custom structure
const basePath = path.join(process.cwd(), projectName, 'src')

// Global folders to be created inside src/
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
  // Add .gitkeep so Git tracks the folder
  fs.writeFileSync(path.join(fullPath, '.gitkeep'), '')
})

// Step 4: Create placeholder feature folder structure
// This creates a template structure for new features
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

// Step 5: Move globals.css into styles folder
const appGlobals = path.join(basePath, 'app', 'globals.css')
const stylesDir = path.join(basePath, 'styles')
const stylesGlobals = path.join(stylesDir, 'globals.css')

if (fs.existsSync(appGlobals)) {
  fs.renameSync(appGlobals, stylesGlobals)
  console.log('📦 Moved globals.css → styles/globals.css')
}

// Step 6: Add the comprehensive Project Development Guide to README.md
const readmeContent = `... (your same long README guide content here) ...`

// Write the comprehensive development guide to the README.md file
fs.writeFileSync(
  path.join(process.cwd(), projectName, 'README.md'),
  readmeContent
)

console.log(
  '✅ Project scaffolded with RnD architecture + .gitkeep in empty folders + globals.css moved to styles/!'
)
