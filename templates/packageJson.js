export const packageJsonTemplate = (projectName) => `
{
  "name": "${projectName}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --write .",
    "test": "vitest"
  },
  "dependencies": {
    "next": "^15.5.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^3.3.1",
    "zustand": "^5.0.8",
    "@tanstack/react-query": "^5.87.4",
    "react-hook-form": "^7.62.0",
    "zod": "^4.1.8",
    "framer-motion": "^12.23.12",
    "react-icons": "^5.5.0",
    "drizzle-orm": "^0.25.0"
  },
  "devDependencies": {
    "@types/node": "^20.19.14",
    "@types/react": "^18.2.14",
    "@types/react-dom": "^18.2.7",
    "eslint": "^9.35.0",
    "eslint-config-next": "^15.5.3",
    "prettier": "^3.6.2",
    "tailwindcss": "^4.1.13",
    "typescript": "^5.9.2",
    "vitest": "^3.2.4",
    "cypress": "^12.17.0"
  }
`.trim();
