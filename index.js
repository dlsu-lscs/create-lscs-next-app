#!/usr/bin/env node

/**
 * ----------------------------------------------------------------------
 *  create-lscs-next-app: Lightweight Next.js + LSCS Architecture CLI
 * ----------------------------------------------------------------------
 *
 *  Creates a Next.js app with TypeScript, Tailwind, and App Router,
 *  then sets up the LSCS frontend architecture folders and base templates.
 *
 *  This CLI does NOT install the full LSCS stack — instead, the recommended
 *  stack will be listed in the generated README for future setup.
 *
 *  Usage:
 *    npx create-lscs-next-app my-project
 *    npx create-lscs-next-app feature <feature-name>
 *
 * ----------------------------------------------------------------------
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

// Paths
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatesPath = path.join(__dirname, 'templates')

// Templates
import { readmeTemplate } from './templates/readmeTemplate.js'
import { featureReadme } from './templates/featureReadme.js'

// ────────────────────────────────
// Utility: prompts
// ────────────────────────────────
async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  )
}

async function confirm(question, defaultYes = false) {
  const suffix = defaultYes ? 'Y/n' : 'y/N'
  const answer = await askQuestion(`${question} (${suffix}): `)
  if (!answer) return defaultYes
  return ['y', 'yes'].includes(answer.toLowerCase())
}

// ────────────────────────────────
// Feature Creation Function
// ────────────────────────────────
function createFeature(featureName) {
  const projectPath = process.cwd()
  const featureBase = path.join(projectPath, 'src', 'features', featureName)
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
  fs.writeFileSync(
    path.join(featureBase, 'README.md'),
    featureReadme(featureName)
  )

  console.log(
    chalk.green(
      `✅ Feature "${featureName}" created in src/features/${featureName}`
    )
  )
}

// ────────────────────────────────
// Determine Project Name
// ────────────────────────────────
async function getProjectName() {
  const argProject = process.argv[2]
  if (argProject && !argProject.startsWith('feature')) return argProject

  const name = await askQuestion(chalk.yellow('📦 Enter your project name: '))
  if (!name) {
    console.error(chalk.red('❌ Project name is required.'))
    process.exit(1)
  }
  return name
}

// ────────────────────────────────
// Main CLI Function
// ────────────────────────────────
async function main() {
  console.log(chalk.blueBright('🚀 LSCS Next.js App & Feature CLI'))

  // Step 0: Node.js check
  try {
    const nodeVersion = execSync('node -v', { stdio: 'pipe', shell: true })
      .toString()
      .trim()
    const majorNode = parseInt(nodeVersion.replace('v', '').split('.')[0], 10)
    if (majorNode < 18) {
      console.error(chalk.red('❌ Node.js 18+ required'))
      process.exit(1)
    }
    console.log(chalk.green(`🟢 Node.js ${nodeVersion} detected`))
  } catch {
    console.error(chalk.red('❌ Node.js must be installed.'))
    process.exit(1)
  }

  // Step 1: Feature command
  const command = process.argv[2]
  const featureNameArg = process.argv[3]
  if (command === 'feature') {
    if (!featureNameArg) {
      console.error(
        chalk.red(
          '❌ Provide feature name: npx create-lscs-next-app feature <feature-name>'
        )
      )
      process.exit(1)
    }
    createFeature(featureNameArg)
    return
  }

  // Step 2: Project name
  const projectName = await getProjectName()
  const projectPath = path.resolve(process.cwd(), projectName)

  // Step 3: Create Next.js app
  console.log(
    chalk.blue(`⚡ Creating Next.js app "${projectName}" with Turbopack...`)
  )
  execSync(
    `npx create-next-app@latest ${projectName} --ts --eslint --tailwind --app --src-dir --import-alias "@/*" --turbopack`,
    { stdio: 'inherit', shell: true }
  )

  // Step 4: Add LSCS logo
  const publicDir = path.join(projectPath, 'public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
  const logoSrc = path.join(templatesPath, 'lscs-logo.png')
  const logoDest = path.join(publicDir, 'lscs-logo.png')
  if (fs.existsSync(logoSrc)) {
    fs.copyFileSync(logoSrc, logoDest)
    console.log(chalk.green('🖼️ LSCS logo added to public folder'))
  } else {
    console.log(chalk.yellow('⚠️ LSCS logo not found in templates, skipped.'))
  }

  // Step 5: Skip package.json replacement
  console.log(chalk.yellow('⚠️ Keeping default package.json from Next.js'))

  // Step 6: Base folder structure
  console.log(chalk.blue('📂 Setting up folder structure...'))
  const srcPath = path.join(projectPath, 'src')
  ;[
    'lib',
    'providers',
    'hooks',
    'types',
    'services',
    'components',
    'queries',
    'store',
    'config',
  ].forEach((f) => fs.mkdirSync(path.join(srcPath, f), { recursive: true }))

  // Step 7: Placeholder feature folder
  const featureBase = path.join(srcPath, 'features', '[feature-name]')
  ;[
    'components',
    'containers',
    'hooks',
    'services',
    'queries',
    'types',
    'data',
  ].forEach((f) => fs.mkdirSync(path.join(featureBase, f), { recursive: true }))
  fs.writeFileSync(
    path.join(featureBase, 'README.md'),
    featureReadme('[feature-name]')
  )

  // Step 8: Move globals.css
  const stylesDir = path.join(srcPath, 'styles')
  if (!fs.existsSync(stylesDir)) fs.mkdirSync(stylesDir)
  const globalsSrc = path.join(srcPath, 'app', 'globals.css')
  const globalsDest = path.join(stylesDir, 'globals.css')
  if (fs.existsSync(globalsSrc)) {
    try {
      fs.renameSync(globalsSrc, globalsDest)
    } catch {
      fs.copyFileSync(globalsSrc, globalsDest)
      fs.unlinkSync(globalsSrc)
    }
  }

  // Step 9: Copy page.tsx & layout.tsx
  const appDir = path.join(srcPath, 'app')
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true })
  fs.copyFileSync(
    path.join(templatesPath, 'page.tsx'),
    path.join(appDir, 'page.tsx')
  )
  fs.copyFileSync(
    path.join(templatesPath, 'layout.tsx'),
    path.join(appDir, 'layout.tsx')
  )

  // Step 10: Prettier config
  fs.copyFileSync(
    path.join(templatesPath, '.prettierrc'),
    path.join(projectPath, '.prettierrc')
  )
  fs.copyFileSync(
    path.join(templatesPath, '.prettierignore'),
    path.join(projectPath, '.prettierignore')
  )

  // Step 11: VSCode Prettier auto-save config
  const vscodeDir = path.join(projectPath, '.vscode')
  if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir)
  fs.writeFileSync(
    path.join(vscodeDir, 'settings.json'),
    JSON.stringify(
      {
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
        'editor.formatOnSave': true,
      },
      null,
      2
    )
  )
  console.log(chalk.green('⚡ VSCode Prettier auto-save configured'))

  // Step 12: README
  fs.writeFileSync(
    path.join(projectPath, 'README.md'),
    readmeTemplate(projectName)
  )

  // Step 13: GitHub workflows (optional)
  if (await confirm('📦 Include GitHub workflows?', false)) {
    const githubSrc = path.join(templatesPath, '.github')
    const githubDest = path.join(projectPath, '.github')
    if (fs.existsSync(githubSrc)) {
      fs.cpSync(githubSrc, githubDest, { recursive: true })
      console.log(chalk.green('🔧 GitHub workflows added'))
    } else {
      console.log(chalk.red('⚠️ .github templates not found, skipping.'))
    }
  }

  // Step 14: Completion
  console.log()
  console.log(
    chalk.green(`✅ Success! Created ${projectName} at ${projectPath}`)
  )
  console.log()
  console.log('Inside that directory, you can run several commands:')
  console.log()
  console.log(chalk.cyan('  npm run dev'))
  console.log('    Starts the development server.')
  console.log()
  console.log(chalk.cyan('  npm run build'))
  console.log('    Builds the app for production.')
  console.log()
  console.log(chalk.cyan('  npm run start'))
  console.log('    Runs the built app in production mode.')
  console.log()
  console.log(chalk.cyan('  npm run lint'))
  console.log('    Runs ESLint to check for code issues.')
  console.log()
  console.log(chalk.cyan('  npm run format'))
  console.log('    Formats your code with Prettier.')
  console.log()
  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(chalk.cyan(`  cd ${projectName}`))
  console.log(chalk.cyan('  npm install'))
  console.log(chalk.cyan('  npm run dev'))
  console.log()
  console.log('🎉 Happy hacking with LSCS Next.js setup!')
}

// Execute main
main().catch((err) => {
  console.error(chalk.red('❌ Unexpected error:'), err)
  process.exit(1)
})
