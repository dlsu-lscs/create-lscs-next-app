# create-lscs-next-app

### Author: Max Benedict Chavez, Lead Frontend Engineer for Research and Development

create-lscs-next-app is an NPX scaffolding tool designed to quickly set up a new Next.js project based on the RnD Frontend Standards Manual. It automates the creation of a consistent project structure with a feature-driven architecture, a robust developer toolkit, and a complete testing environment, ensuring all projects align with a unified coding standard from day one.
Key Features

#### This CLI tool goes beyond a standard create-next-app installation to provide a comprehensive, production-ready foundation:

    Next.js 14+ Foundation: Initializes a new Next.js project using the latest version, configured with the App Router, TypeScript, ESLint, and Tailwind CSS.

    Structured Folder Architecture: Creates a standardized folder structure within src/ that adheres to the Feature-Sliced Design (FSD), including dedicated directories for lib, components, hooks, types, services, and more.

    Feature-First Scaffolding: Includes a placeholder src/features/[feature-name] folder with a clear README.md to guide you in building new features with a consistent, modular approach.

    Prettier Configuration: Automatically adds .prettierrc and .prettierignore files to ensure consistent code formatting across the project.

    Robust Testing Setup: Configures Vitest for unit and component testing, including jsdom and @testing-library/react for a complete test environment. It also adds dedicated __tests__/unit and __tests__/e2e directories.

    Optimized Styling: Relocates the globals.css file to src/styles/ to centralize all global styles.

    Optional GitHub Workflows: Provides an option to add pre-configured GitHub workflows for continuous integration and deployment.

## Getting Started

Before you begin, ensure you have Node.js 18 or higher installed.

To create a new project, simply run the following command in your terminal:

```
npx create-lscs-next-app my-new-app

```

Replace my-new-app with your desired project name. The script will then guide you through the remaining setup process.
Next Steps

Once the script has completed, navigate to your new project and start the development server:

```
cd my-new-app
npm run dev
```

You can also run the pre-configured scripts for linting and testing:

```
    Linting: npm run lint

    Testing: npm run test
```
