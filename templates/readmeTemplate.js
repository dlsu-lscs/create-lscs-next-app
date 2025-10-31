// ────────────────────────────────
// Main Project README Template
// ────────────────────────────────
// This template generates the root README.md
// for projects created via the CLI command:
// `npx create-lscs-next-app`
//
// It explains the setup, folder structure,
// Atomic Design system, Container/Presentational pattern,
// coding standards, and contribution workflow.

export const readmeTemplate = (projectName) => `
# ${projectName}

This project was bootstrapped with **create-lscs-next-app** — a CLI that sets up a scalable, opinionated **Feature-Driven Next.js Architecture** using modern standards and conventions.

---

## 1. 🚀 Development Setup

- Prettier + ESLint (with Prettier rules)
- Organized, modular folder structure
- Atomic Design + Feature Architecture
- Vitest + Cypress preconfigured for testing
- Global styles in \`src/styles/globals.css\`

### Scripts

- \`npm run dev\` → Start development server
- \`npm run build\` → Build production bundle
- \`npm run start\` → Run production build
- \`npm run lint\` → Run ESLint
- \`npm run test\` → Run Vitest
- \`npm run test:e2e\` → Run Cypress end-to-end tests

---

## 2. ⚡ Creating a New Feature

You can scaffold a new feature module using the CLI:

\`\`\`bash
npx create-lscs-next-app feature <feature-name>
\`\`\`

This generates a folder under \`src/features/<feature-name>\` with:

- components/
- containers/
- hooks/
- services/
- queries/
- types/
- data/
- README.md

Each generated feature is self-contained and ready to scale.

---

## 3. 🧬 Atomic Design System

Each feature uses **Atomic Design** to organize components by their role and reusability.

\`\`\`
[feature-name]/
└── components/
    ├── atoms/       # Smallest, indivisible UI elements (Button, Input, Label)
    ├── molecules/   # Groups of atoms forming functional units (Card, Form Field)
    └── organisms/   # Complex UI sections built from molecules/atoms (Navbar, Footer, Hero)
\`\`\`

### 🧩 How It Works

- **Atoms** → Basic reusable UI parts.
- **Molecules** → Groups of atoms with simple interactivity.
- **Organisms** → Larger composed sections of the interface.

This structure allows:
- Reusability and consistency in UI
- Easier maintenance and scaling of complex designs
- Clear boundaries between design layers

---

## 4. ⚙️ Container/Presentational Pattern

Inside each feature, logic and UI are **separated** into distinct layers to keep the codebase clean and modular.

| Layer | Folder | Responsibility |
|-------|---------|----------------|
| **Presentational** | \`components/\` | Defines **how things look**. Purely visual, receives data via props. No business logic. |
| **Container** | \`containers/\` | Defines **how things work**. Handles logic, data fetching, and passes props to components. |

### Example

\`\`\`tsx
// components/atoms/Button.tsx (Presentational)
export const Button = ({ label, onClick }) => (
  <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={onClick}>
    {label}
  </button>
);
\`\`\`

\`\`\`tsx
// containers/LoginContainer.tsx (Container)
import { Button } from "../components/atoms/Button";
import { useAuth } from "../hooks/useAuth";

export const LoginContainer = () => {
  const { login } = useAuth();
  return <Button label="Login" onClick={login} />;
};
\`\`\`

✅ **Benefits**
- Components remain reusable and easy to test.
- Logic is decoupled from presentation.
- Easier collaboration between UI and logic developers.

---

## 5. 🏗️ Architecture Overview

The architecture follows **Feature-Driven Development (FDD)**.
All code is organized around features instead of technical layers — ensuring modularity and scalability.

\`\`\`
src/
├── app/ # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
│
├── components/ # Global shared UI (Atomic Design)
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
│
├── features/ # Domain-specific modules
│   ├── [feature-name]/ # Generated via CLI
│   │   ├── components/ (Atoms → Molecules → Organisms)
│   │   ├── containers/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── queries/
│   │   ├── types/
│   │   └── data/
│   └── shared/ # Shared feature logic/components
│
├── lib/ # Global utilities & helpers
├── queries/ # Global TanStack Query setup
├── store/ # Zustand stores
├── providers/ # App-level providers (Auth, Theme, Query)
├── config/ # Constants, environment setup
├── styles/ # Global styles
├── types/ # Global TypeScript types
└── tests/ # Unit & E2E tests
\`\`\`

This structure keeps the app modular, testable, and highly maintainable.

---

## 6. 🧠 Tech Stack Recommendations

These libraries are **recommended** (not auto-installed) for your feature development:

| Category | Tool |
|-----------|------|
| Language | **TypeScript** |
| Styling | **Tailwind CSS**, optionally **shadcn/ui** |
| Data Fetching | **TanStack Query** |
| State Management | **Zustand** |
| Forms | **React Hook Form** + **Zod** |
| Authentication | **NextAuth.js** |
| Animations | **Framer Motion** |
| Testing | **Vitest** + **Cypress** |
| ORM | **Drizzle ORM** |

---

## 7. 🧾 Coding Standards

- Use **functional React components** with hooks.
- **Type everything** using TypeScript.
- Maintain logic/UI separation (Container/Presentational).
- Use **Zustand** for client state, **TanStack Query** for server data.
- Handle loading/error states gracefully.
- Use **Prettier** + **ESLint** for style consistency.
- Test with **Vitest** (unit) and **Cypress** (e2e).
- Comment only to explain **why**, not **what**.

---

## 8. 🤝 Contribution Workflow

### Branch Model
- \`main\` → production branch
- \`staging\` → pre-release testing
- \`dev\` → active development

### Workflow
1. Create branch: \`feature/<issue-no-desc>\` or \`fix/<issue-no-desc>\`
2. Commit using **Conventional Commits**:
   - \`feat(auth): add JWT authentication\`
   - \`fix(api): correct null pointer\`
3. Open a PR → target \`dev\` (or \`main\` for hotfix)
4. Get at least **1 approval** before merging
5. Use **Squash and Merge** to keep history clean

### Commit Message Reference

| Type | Description |
|------|--------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation change |
| style | Code style (no logic) |
| refactor | Refactor (no behavior) |
| test | Add/update tests |
| chore | Maintenance tasks |

---

## 9. 🧪 Testing Setup

This project comes preconfigured with **Vitest** (unit/integration tests) and **Cypress** (end-to-end tests).

### 🧩 Unit & Integration Tests — *Vitest*

- Location: \`/src/tests/unit/\` or near related files (e.g. \`Button.test.tsx\`)
- Run tests:
  \`\`\`bash
  npm run test
  \`\`\`
- Example:
  \`\`\`tsx
  import { render, screen } from "@testing-library/react";
  import { Button } from "@/components/atoms/Button";

  test("renders button label", () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
  \`\`\`

### 🌐 End-to-End Tests — *Cypress*

- Location: \`/src/tests/e2e/\`
- Run tests (interactive mode):
  \`\`\`bash
  npm run test:e2e
  \`\`\`
- Example:
  \`\`\`js
  // cypress/e2e/login.cy.ts
  describe("Login Page", () => {
    it("should allow user to login", () => {
      cy.visit("/login");
      cy.get("input[name=email]").type("user@example.com");
      cy.get("input[name=password]").type("password123");
      cy.get("button[type=submit]").click();
      cy.url().should("include", "/dashboard");
    });
  });
  \`\`\`

✅ **Best Practices**
- Keep unit tests close to the files they test.
- Mock API responses using \`msw\` (Mock Service Worker).
- Use **Vitest** for logic/UI testing, **Cypress** for full app flow.
- Ensure all PRs include relevant test coverage.

---

✅ Following these conventions ensures your ${projectName} project remains **scalable**, **maintainable**, and **collaborative** — aligned with LSCS development standards.
`

