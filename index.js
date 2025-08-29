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
  fs.mkdirSync(path.join(basePath, folder), { recursive: true })
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
  fs.mkdirSync(path.join(featureBase, folder), { recursive: true })
})

// Step 5: Add the comprehensive Project Development Guide to README.md
const readmeContent = `
# 🚀 Project Development Guide

Welcome to the project! This guide outlines our frontend standards, architecture, technology stack, and contribution workflow to ensure a consistent, scalable, and maintainable approach across all development efforts.

---

## 1. 🛠️ Tech Stack

We leverage a modern and efficient technology stack to build fast and scalable applications.

* **Framework**: [Next.js](https://nextjs.org/)

* **Language**: [TypeScript](https://www.typescriptlang.org/)

* **UI/Styling**: [Tailwind CSS](https://tailwindcss.com/) + (optional: [shadcn/ui](https://ui.shadcn.com/))

* **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)

* **State Management**: [Zustand](https://zustand-bear.github.io/zustand/)

* **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

* **Authentication**: [NextAuth.js](https://next-auth.js.org/)

* **Animations**: [Framer Motion](https://www.framer.com/motion/)

* **Testing**: [Vitest](https://vitest.dev/) + [Cypress](https://www.cypress.io/)

* **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

* **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (for type-safe queries and schema definitions)

---

## 2. 🏛️ Architecture

We employ a **Feature-Driven Architecture** within Next.js, organizing code by domain features for enhanced scalability, maintainability, and team collaboration. Inside each feature, we follow the **Container/Presentational pattern** to ensure clean and modular code.

### File Structure

The \`src/\` directory is structured as follows:

\`\`\`
src/
├── app/          # Next.js App Router (pages, layouts, routing logic)
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Root page
│   └── providers.tsx  # Composes all global providers
│
├── components/   # Globally shared reusable UI components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   └── ...
│
├── features/     # Domain-specific feature modules
│   ├── posts/         # Example feature: posts
│   │   ├── components/    # Presentational UI components (dumb components)
│   │   │   └── PostList.tsx
│   │   ├── containers/    # Smart components (state + hooks + query)
│   │   │   └── PostListContainer.tsx
│   │   ├── hooks/         # Feature-specific hooks (e.g., usePosts.ts)
│   │   │   └── use-posts.ts
│   │   ├── services/      # API calls + business logic (e.g., post-service.ts)
│   │   │   └── post-service.ts
│   │   ├── queries/       # Query configs for TanStack Query (e.g., post-queries.ts)
│   │   │   └── post-queries.ts
│   │   ├── types/         # Feature-specific TypeScript types/interfaces (e.g., post-types.ts)
│   │   │   └── post-types.ts
│   │   └── data/          # Mock data for local development/testing (e.g., mock-posts.ts)
│   │
│   └── shared/        # Cross-feature shared utilities/components
│       └── FeatureCard.tsx
│
├── lib/          # Core utilities, helpers, and global query options
│   ├── apiClient.ts     # Axios/fetch wrapper
│   ├── dateUtils.ts     # Date formatting helpers
│   ├── use-app-query.ts # Wrapper for TanStack useQuery with defaults
│   └── ...
│
├── queries/      # Global query configurations (cross-feature)
│   ├── posts.ts
│   └── users.ts
│
├── store/        # Global state management (Zustand)
│   ├── theme-store.ts
│   └── user-store.ts
│
├── providers/    # Provider components for global contexts
│   ├── auth-provider.tsx  # NextAuth provider wrapper
│   ├── query-provider.tsx # React Query provider wrapper
│   ├── theme-provider.tsx # Theme (dark/light) provider wrapper
│   └── index.tsx          # Combines all providers
│
├── config/       # Static configurations
│   ├── env.ts       # Environment variables
│   ├── constants.ts # App-wide constants
│   └── query.ts     # Default React Query options
│
├── styles/       # Global & theme styles
│   ├── globals.css
│   └── theme.css
│
├── types/        # Global TypeScript types/interfaces
│   ├── global.d.ts
│   └── custom-types.ts
│
└── __tests__/    # Testing (unit + e2e)
    ├── unit/
    │   └── sample.test.ts
    └── e2e/
        └── sample.cy.ts
\`\`\`

### Architecture Pattern

* **Container Components**:

  * Manage state and data using hooks.

  * Utilize **Zustand** for client-side state and **TanStack Query** for server data fetching.

  * Reside alongside or within a dedicated \`containers/\` folder inside a feature.

* **Presentational Components**:

  * Focus solely on rendering UI based on props.

  * Are located in \`features/[feature]/components/\`.

#### Example Structure:

\`\`\`
src/
├── features/
│   ├── posts/
│   │   ├── components/    # Presentational UI components
│   │   │   └── PostList.tsx
│   │   ├── containers/    # Container components
│   │   │   └── PostListContainer.tsx
│   │   ├── hooks/         # Custom hooks (e.g., Zustand stores, TanStack queries)
│   │   │   └── usePosts.ts
│   │   ├── services/      # API calls and business logic
│   │   │   └── postService.ts
│   │   ├── types/         # Types and interfaces
│   │   │   └── postTypes.ts
│   │   └── data/          # Hardcoded or mock data for the feature
│   │       └── mockPosts.ts
\`\`\`

### Naming Conventions

* **React Components and Custom Hooks**: Use **PascalCase**. Hooks **must** start with \`use\`.

  \`\`\`
  export default function UserProfile() { /* ... */ }
  export function useAuth() { /* ... */ }
  \`\`\`

* **Service and Utility Files**: Use **camelCase** or **kebab-case**.

  \`\`\`
  // camelCase
  export async function authService() { /* ... */ }

  // kebab-case
  export function dateUtils() { /* ... */ }
  \`\`\`

* **Folder and File Names (Routing/General Utilities)**: Use **kebab-case**.

  \`\`\`
  /features/auth-service/
  /lib/date-utils.ts
  /app/user-profile/page.tsx
  \`\`\`

* **TypeScript Type and Interface Files**: Use **PascalCase**, matching the type name.

  \`\`\`
  export interface User {
    id: string;
    name: string;
  }
  \`\`\`

* **Test Files**: Mirror the name of the file they test, with \`.test.ts\` or \`.spec.ts\` suffix.

  \`\`\`
  UserProfile.test.tsx // tests UserProfile.tsx
  authService.test.ts  // tests authService.ts
  \`\`\`

* **File Names and Default Exports**: File names should match their default export for clarity and consistency (e.g., \`UserProfile.tsx\` must default export \`UserProfile\`).

---

## 3. 📝 Coding Standards

Adhering to these coding standards ensures high quality and maintainability.

* **Code Formatting**: We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) to automatically enforce consistent code style. Follow the shared configuration in the repository.

* **Component Style**: Prefer **functional React components with hooks**. Strictly separate presentational (UI-only) components from container (logic/stateful) components.

* **TypeScript Usage**: Always **explicitly type** component props, hooks, and functions. Use interfaces or type aliases for props and data structures.

* **State & Data**: Use **Zustand** for client state and **TanStack Query** for server data fetching. Encapsulate logic in custom hooks.

* **Error Handling**: Gracefully handle errors and loading states in UI components with clear user feedback.

* **Testing**: Write **unit tests with Vitest** and **end-to-end tests with Cypress** for critical features.

* **Comments & Documentation**: Comment code to explain *why* not *what*. Use [JSDoc](https://jsdoc.app/) for complex functions. Keep feature \`README.md\` files updated.

* **Next.js Rendering Practices**: Follow Next.js best practices for SSR (Server-Side Rendering) and CSR (Client-Side Rendering). Use SSR for SEO-critical and initial data fetching, CSR for interactive UI and client-specific logic.

---

## 4. 🤝 Code Contribution Guide

This guide outlines the branching strategy, pull request process, and commit message conventions for the LSCS RND team.

### Branch Structure

We utilize a three-branch model:

| Branch | Purpose | 
 | ----- | ----- | 
| \`main\` | Stable, production-ready code. Only merged from \`staging\`. | 
| \`staging\` | Pre-release branch for final testing. Merged from \`dev\`. | 
| \`dev\` | Ongoing integration branch. All feature branches merge here first. | 

### Workflow

1. **Create a feature branch**:

   * Go to the issue for the specific task and create a branch.

   * Always branch off from the \`dev\` branch.

   * Name format:

     * \`feature/<issue-no-short-description>\`

     * \`fix/<issue-no-short-description>\`

     * \`hotfix/<issue-no-short-description>\`

   * **Example**: \`feature/4-user-authentication\` or \`fix/5-login-bug\`

2. **Make changes locally**:

   * Follow project coding standards.

   * Keep commits small and focused.

3. **Commit using Conventional Commits**:

   * Format: \`<type>[optional scope]: <description>\`

   * **Examples**:

     * \`feat(auth): add JWT-based authentication\`

     * \`fix(api): correct null pointer in response handler\`

     * \`docs(readme): update installation instructions\`

   * Refer to [Conventional Commits Documentation](https://www.conventionalcommits.org/en/v1.0.0/) for further information.

4. **Push to remote**:

   \`\`\`
   git push origin feature/your-feature
   \`\`\`

5. **Open a Pull Request (PR)**:

   * **Target branch**:

     * Feature branches → \`dev\`

     * Hotfixes for production → \`main\` (with \`staging\` approval)

   * PR title should match the main commit message format.

   * Fill out the PR template completely.

   * Assign at least one reviewer.

   * Make sure the feature branch is up to date with the \`dev\` branch.

6. **Code Review**:

   * All PRs require at least one approval before merging.

   * Address requested changes promptly.

7. **Merging**:

   * We use **Squash and Merge** for feature branches into \`dev\`.

   * Merging \`dev\` → \`staging\` and \`staging\` → \`main\` is done by maintainers only.

### Branch Protection Rules

* \`main\` and \`staging\` are protected branches:

  * No direct pushes.

  * Requires PR review and passing checks.

### Commit Message Quick Reference

| Type | Description | 
 | ----- | ----- | 
| \`feat\` | New feature | 
| \`fix\` | Bug fix | 
| \`docs\` | Documentation only changes | 
| \`style\` | Code style changes (no logic changes) | 
| \`refactor\` | Code changes without changing behavior | 
| \`test\` | Adding/updating tests | 
| \`chore\` | Maintenance tasks | 

### Additional Notes

* Keep PRs small and focused — avoid combining unrelated changes.

* Write descriptive commit messages and PR descriptions.

* Run all tests before pushing.

* Follow the coding style and lint rules set for the project.

* If you’re unsure about anything, ask in the team chat before starting work.
`

// Step 6: Write the comprehensive development guide to the README.md file
// This replaces the default README.md generated by create-next-app
fs.writeFileSync(
  path.join(process.cwd(), projectName, 'README.md'),
  readmeContent
)

console.log(
  '✅ Project scaffolded with RnD architecture + comprehensive Development Guide in README.md!'
)
