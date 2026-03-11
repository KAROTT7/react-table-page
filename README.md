# react-table-page

A minimal JavaScript library scaffold built with Rollup and TypeScript, outputting ESM bundles and declaration files.

## Package Manager

This repository only supports `pnpm >= 10.0.0`.

```bash
pnpm install
```

## Scripts

- `pnpm build`: build the library into `dist/`
- `pnpm dev`: watch mode for local development
- `pnpm clean`: remove build artifacts
- `pnpm lint`: run ESLint
- `pnpm format`: format the repository with Prettier
- `pnpm test`: run Vitest once
- `pnpm typecheck`: run TypeScript type checks
- `pnpm check`: run the full pre-publish validation pipeline

## Publish

`pnpm publish` will first run `pnpm check` via `prepublishOnly`, ensuring lint, typecheck, test, and build all pass before publishing.

## Usage

```ts
import { createGreeting } from 'react-table-page';

console.log(createGreeting('world'));
```