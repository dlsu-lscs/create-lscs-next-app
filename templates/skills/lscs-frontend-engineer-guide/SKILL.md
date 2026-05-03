---
name: lscs-frontend-engineer-guide
description: >
  LSCS Frontend Engineer Guide — enforces the La Salle Computer Society Frontend Standards
  Manual (FSM v1.1.4) for any project scaffolded with create-lscs-next-app. Activates
  automatically when working on Next.js code in an LSCS project. Triggers on: component
  creation, feature scaffolding, hooks, Zustand stores, TanStack Query, shadcn/ui, file
  naming, folder structure, and code review. If the stack matches (Next.js + TypeScript +
  Tailwind + TanStack Query + Zustand), this skill is always active.
---

# LSCS Frontend Engineer Guide

You are working inside an **LSCS project** scaffolded with `create-lscs-next-app`.
All code must follow the **LSCS Frontend Standards Manual (FSM) v1.1.4**.
These are not suggestions — they are the team standard.

---

## Tech Stack

Do not deviate from this stack. Do not suggest alternatives.

| Concern        | Tool                          |
|----------------|-------------------------------|
| Framework      | Next.js (App Router)          |
| Language       | TypeScript                    |
| Styling        | Tailwind CSS + shadcn/ui      |
| Data Fetching  | TanStack Query                |
| Client State   | Zustand                       |
| Forms          | React Hook Form + Zod         |
| Auth           | BetterAuth                    |
| Animations     | Framer Motion                 |
| Testing        | Vitest + Cypress              |
| Icons          | React Icons                   |
| ORM            | Drizzle ORM                   |
| HTTP           | Native `fetch` — never Axios  |

---

## Project Structure

Every LSCS project follows this exact structure:

```
src/
├── app/                        # Next.js App Router pages and layouts
├── components/
│   ├── atoms/                  # Wrap shadcn/ui primitives here only
│   ├── molecules/              # Compose atoms
│   ├── organisms/              # Compose molecules + atoms
│   └── ui/                    # shadcn/ui primitives (never import directly above atoms)
├── features/
│   └── [feature-name]/
│       ├── components/         # Presentational components (UI only)
│       ├── containers/         # Container components (data + logic)
│       ├── hooks/              # TanStack Query hooks
│       ├── services/           # fetch-based API calls
│       ├── queries/            # Query key and option configs
│       ├── types/              # Feature-specific interfaces
│       └── data/              # Mock/hardcoded data
├── store/                      # Zustand global stores
├── providers/                  # React Query, Auth, Theme providers
├── lib/                        # Utilities and helpers
├── config/                     # env.ts, constants.ts, query.ts
├── styles/                     # globals.css, theme.css
├── types/                      # Global TypeScript types
└── __tests__/
    ├── unit/                   # Vitest
    └── e2e/                    # Cypress
```

---

## Architecture Patterns

### Container / Presentational

Always separate data from UI. No exceptions.

**Presentational** — renders UI from props only. Zero fetching, zero side effects:
```tsx
// features/posts/components/PostList.tsx
type PostListProps = {
  posts: Post[];
  isLoading: boolean;
  error?: string;
};

export default function PostList({ posts, isLoading, error }: PostListProps) {
  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**Container** — fetches data, passes to presentational:
```tsx
// features/posts/containers/PostListContainer.tsx
import PostList from '../components/PostList';
import { usePosts } from '../hooks/use-posts';

export default function PostListContainer() {
  const { data, isLoading, error } = usePosts();
  return <PostList posts={data ?? []} isLoading={isLoading} error={error?.message} />;
}
```

---

### Atomic Design

Three levels. Never skip levels. Never import `ui/` directly into molecules or organisms.

**Atoms** — always wrap shadcn/ui:
```tsx
// components/atoms/Button.tsx
import { Button as ShadButton, ButtonProps } from "@/components/ui/button";
export const Button = (props: ButtonProps) => <ShadButton {...props} />;
```

**Molecules** — compose atoms:
```tsx
// components/molecules/SearchBar.tsx
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

export const SearchBar = () => (
  <div className="flex gap-2">
    <Input placeholder="Search..." />
    <Button>Go</Button>
  </div>
);
```

**Organisms** — compose molecules + atoms:
```tsx
// components/organisms/Header.tsx
import { SearchBar } from "../molecules/SearchBar";

export const Header = () => (
  <header className="flex justify-between items-center p-4 bg-gray-50">
    <div className="text-2xl font-bold">LSCS</div>
    <SearchBar />
  </header>
);
```

---

## Data Fetching

Always use TanStack Query for server data. Never use raw `useState` + `useEffect` to fetch:

```ts
// features/posts/hooks/use-posts.ts
import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../services/post.service';

export function usePosts() {
  return useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
}
```

```ts
// features/posts/services/post.service.ts
import { Post } from '../types/post.types';

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch('/api/posts');
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json() as Promise<Post[]>;
}
```

---

## Client State

Use Zustand for UI/client-only state. Never use Zustand for server data:

```ts
// store/sidebar.store.ts
import { create } from 'zustand';

type SidebarStore = {
  open: boolean;
  toggle: () => void;
};

export const useSidebarStore = create<SidebarStore>(set => ({
  open: false,
  toggle: () => set(s => ({ open: !s.open })),
}));
```

---

## Naming Conventions

| Thing                     | Convention        | Example                              |
|---------------------------|-------------------|--------------------------------------|
| Components & Containers   | PascalCase        | `PostList.tsx`, `PostListContainer.tsx` |
| Hooks & Stores            | camelCase         | `use-posts.ts`, `sidebar.store.ts`   |
| Services, Queries, Types  | dot-case          | `post.service.ts`, `post.types.ts`   |
| Folders, pages, utilities | kebab-case        | `/features/auth-service/`            |
| Test files                | mirror + `.test.ts` | `PostList.test.tsx`                |

**File name must match its default export.**
`PostList.tsx` must export `PostList` as default. No exceptions.

---

## Scaffolding a New Feature

When adding a feature, always generate the full structure:

```
src/features/[name]/
├── components/[Name]List.tsx
├── containers/[Name]ListContainer.tsx
├── hooks/use-[name].ts
├── services/[name].service.ts
├── queries/[name].queries.ts
├── types/[name].types.ts
└── data/mock.[name].ts
```

---

## Coding Standards

- Functional components only — no class components
- Always explicitly type props, hook return values, and function params
- Never use `any` — use `unknown` and narrow, or define a proper type
- Handle loading and error states in every presentational component
- Use SSR for SEO-critical pages; CSR only for interactive/client-specific logic
- Write unit tests with Vitest; e2e tests with Cypress for critical flows
- Comments explain *why*, not *what*

---

## Common Violations to Avoid

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `useState` + `useEffect` for fetching | TanStack Query `useQuery` |
| `import axios from 'axios'` | Native `fetch` |
| Importing `ui/button` in a molecule | Wrap in `atoms/Button` first |
| Fetch logic inside a presentational component | Move to container + service |
| Using `any` as a type | Define an interface or use `unknown` |
| File name doesn't match export | `PostList.tsx` → `export default function PostList` |

---

## Quick Start

This project was scaffolded with:

```bash
npx create-lscs-next-app
```

All libraries in the tech stack are pre-installed. Start building features inside `src/features/`.
Read the full FSM at: `https://github.com/dlsu-lscs/create-lscs-next-app`