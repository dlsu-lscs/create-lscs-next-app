#!/usr/bin/env node

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'
import os from 'os'
import spawn from 'cross-spawn'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const [command, arg] = process.argv.slice(2)
  const templatesDir = path.join(__dirname, 'templates')

  // ───── FEATURE CREATION MODE ─────
  if (command === 'feature') {
    if (!arg) {
      console.error(
        chalk.red(
          '❌ Feature name is required.\nUsage: npx create-lscs-app feature <feature-name>'
        )
      )
      process.exit(1)
    }

    const featureName = arg
    const projectPath = process.cwd()
    const featurePath = path.join(projectPath, 'src', 'features', featureName)
    const featureDirs = [
      'components',
      'containers',
      'hooks',
      'services',
      'queries',
      'types',
      'data',
    ]

    featureDirs.forEach((sub) => {
      const dirPath = path.join(featurePath, sub)
      fs.mkdirSync(dirPath, { recursive: true })
      fs.writeFileSync(path.join(dirPath, '.gitkeep'), '')
    })

    const { featureReadme } = await import(
      path.join(templatesDir, 'featureReadme.js')
    )
    fs.writeFileSync(
      path.join(featurePath, 'README.md'),
      featureReadme(featureName)
    )

    console.log(
      chalk.green(
        `✅ Feature "${featureName}" created under src/features/${featureName}!`
      )
    )
    process.exit(0)
  }

  // ───── NEW PROJECT MODE ─────
  console.log(chalk.green('🚀 Welcome to Create LSCS Next App'))

  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '📦 Enter your project name:',
      validate: (input) =>
        input.trim() !== '' || 'Project name cannot be empty',
    },
  ])

  const projectPath = path.resolve(process.cwd(), projectName)

  if (fs.existsSync(projectPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Folder "${projectName}" already exists. Do you want to overwrite it?`,
        default: false,
      },
    ])

    if (!overwrite) {
      console.log(chalk.yellow('❌ Project creation cancelled.'))
      process.exit(0)
    }

    console.log(chalk.blue(`🗑️ Removing existing folder "${projectName}"...`))
    fs.rmSync(projectPath, { recursive: true, force: true })
  }

  // Step 2: Create Next.js app
  console.log(chalk.blue('📦 Creating Next.js app...'))
  spawn.sync(
    'npx',
    [
      'create-next-app@latest',
      projectName,
      '--ts',
      '--eslint',
      '--tailwind',
      '--app',
      '--src-dir',
      '--import-alias',
      '@/*',
    ],
    { stdio: 'inherit' }
  )

  // Step 2.5: Prettier + ESLint plugins
  console.log(chalk.blue('🎨 Installing Prettier and ESLint plugins...'))
  spawn.sync(
    'npm',
    [
      'install',
      '-D',
      'prettier',
      'eslint-config-prettier',
      'eslint-plugin-prettier',
    ],
    { cwd: projectPath, stdio: 'inherit' }
  )

  fs.writeFileSync(
    path.join(projectPath, '.prettierrc'),
    JSON.stringify(
      {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
        printWidth: 80,
      },
      null,
      2
    )
  )

  fs.writeFileSync(
    path.join(projectPath, '.prettierignore'),
    ['node_modules', 'dist', '.next', 'coverage'].join(os.EOL)
  )

  const packageJsonPath = path.join(projectPath, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  packageJson.scripts = packageJson.scripts || {}
  packageJson.scripts.format = 'prettier --write .'
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  // Copy LSCS templates
  const copyFile = (src, dest) => {
    fs.copyFileSync(path.join(templatesDir, src), path.join(projectPath, dest))
    console.log(chalk.blue(`📄 Overwritten: ${dest}`))
  }

  copyFile('layout.tsx', path.join('src', 'app', 'layout.tsx'))
  copyFile('page.tsx', path.join('src', 'app', 'page.tsx'))
  copyFile('lscs-logo.png', path.join('public', 'lscs-logo.png'))

  // LSCS Feature-Based Architecture
  console.log(chalk.blue('📂 Setting up LSCS Feature-Based Architecture...'))
  const srcPath = path.join(projectPath, 'src')
  const dirs = [
    'app',
    'components',
    'config',
    'context',
    'features',
    'hooks',
    'lib',
    'providers',
    'queries',
    'services',
    'store',
    'styles',
    'types',
    path.join('__tests__', 'unit'),
    path.join('__tests__', 'e2e'),
  ]
  dirs.forEach((dir) => {
    const dirPath = path.join(srcPath, dir)
    fs.mkdirSync(dirPath, { recursive: true })
    fs.writeFileSync(path.join(dirPath, '.gitkeep'), '')
  })

  // First scaffolded feature
  const firstFeatureName = 'example-feature'
  const featureDirs = [
    'components',
    'containers',
    'hooks',
    'services',
    'queries',
    'types',
    'data',
  ]
  const firstFeaturePath = path.join(srcPath, 'features', firstFeatureName)
  featureDirs.forEach((sub) => {
    const dirPath = path.join(firstFeaturePath, sub)
    fs.mkdirSync(dirPath, { recursive: true })
    fs.writeFileSync(path.join(dirPath, '.gitkeep'), '')
  })

  const { featureReadme } = await import(
    path.join(templatesDir, 'featureReadme.js')
  )
  fs.writeFileSync(
    path.join(firstFeaturePath, 'README.md'),
    featureReadme(firstFeatureName)
  )

  const { readmeTemplate } = await import(
    path.join(templatesDir, 'readmeTemplate.js')
  )
  fs.writeFileSync(
    path.join(projectPath, 'README.md'),
    readmeTemplate(projectName)
  )

  // Testing libraries
  console.log(
    chalk.blue('🧪 Installing testing libraries (Vitest + Cypress)...')
  )
  spawn.sync(
    'npm',
    [
      'install',
      '-D',
      'vitest',
      '@testing-library/react',
      '@testing-library/jest-dom',
      'cypress',
    ],
    { cwd: projectPath, stdio: 'inherit' }
  )

  fs.writeFileSync(
    path.join(projectPath, 'vitest.config.ts'),
    `import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { globals: true, environment: "jsdom", setupFiles: "./src/tests/setup.ts" },
});`
  )

  fs.writeFileSync(
    path.join(projectPath, 'cypress.config.ts'),
    `import { defineConfig } from "cypress";
export default defineConfig({
  e2e: { baseUrl: "http://localhost:3000", supportFile: "cypress/support/e2e.ts" },
});`
  )

  const testDir = path.join(projectPath, 'src', 'tests')
  fs.mkdirSync(testDir, { recursive: true })
  fs.writeFileSync(
    path.join(testDir, 'setup.ts'),
    `import "@testing-library/jest-dom";`
  )

  // GitHub workflows
  const { addGithubWorkflow } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addGithubWorkflow',
      message: '⚙️ Add GitHub workflows (CI/CD)?',
      default: true,
    },
  ])
  if (addGithubWorkflow) {
    console.log(chalk.blue('🔧 Adding GitHub workflows...'))
    const githubSrc = path.join(templatesDir, '.github')
    const githubDest = path.join(projectPath, '.github')
    const copyRecursive = (src, dest) => {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
      fs.readdirSync(src).forEach((file) => {
        const srcPath = path.join(src, file)
        const destPath = path.join(dest, file)
        if (fs.lstatSync(srcPath).isDirectory())
          copyRecursive(srcPath, destPath)
        else fs.copyFileSync(srcPath, destPath)
      })
    }
    copyRecursive(githubSrc, githubDest)
    console.log(chalk.green('✅ GitHub workflows added!'))
  }

  console.log(
    chalk.green(`✅ Project "${projectName}" created with LSCS standards!`)
  )
  console.log(
    chalk.yellow(`👉 Next steps:
  cd ${projectName}
  npm install
  npm run dev
  npm run format  # format all files with Prettier
  `)
  )
}

main().catch((err) => {
  console.error(chalk.red('❌ Error:'), err)
  process.exit(1)
})
