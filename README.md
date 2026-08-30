# @silverassist/npm-package-standards

Shared ESLint/Prettier/tsconfig base configs and conventions for Silver
Assist's published npm packages — `icons`, `recaptcha`, `consent-banner`,
`next-script-loader`, `nextjs-core`, and any future one. The JS/TS analog of
`wp-coding-standards` on the PHP side: a config package, not a runtime
dependency.

## Why this exists

One shared config instead of each package maintaining its own copy of the
same ESLint/Prettier/tsconfig setup — a fix or a rule change lands in one
place and every package picks it up, the same relationship
`wp-coding-standards` has to Silver Assist's PHP plugins.

## What's shared

| Export                                               | For                                                                                                                                                                                                               |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@silverassist/npm-package-standards/eslint/base`    | Packages with no React components (`nextjs-core`, `next-script-loader`)                                                                                                                                           |
| `@silverassist/npm-package-standards/eslint/react`   | Packages that ship React components (`icons`, `recaptcha`, `consent-banner`)                                                                                                                                      |
| `@silverassist/npm-package-standards/prettier`       | Every package                                                                                                                                                                                                     |
| `@silverassist/npm-package-standards/tsconfig/base`  | Every package, via `"extends"`                                                                                                                                                                                    |
| `@silverassist/npm-package-standards/tsconfig/react` | React packages, via `"extends"` (adds DOM lib + `jsx: react-jsx`)                                                                                                                                                 |
| `templates/husky/{pre-commit,pre-push}`              | Copy into `.husky/` — branch protection + `lint-staged` on commit, the full `npm run check` gate on push. Hooks can't be `extends`-ed the way JS/JSON configs can, so these are templates to copy, not an import. |

Every export layers on top of a package's own overrides — this generalizes
what's genuinely identical (base TS/React lint rules, Prettier style, the
common `compilerOptions`), it doesn't force a single rigid config. A
package with a real technical need (e.g. `recaptcha`'s TS7-specific
`types: ["node"]`, or `consent-banner`'s path alias for its client
subpath) still sets that itself, on top of `extends`.

## Usage

**ESLint** (`eslint.config.mjs`):

```javascript
import react from "@silverassist/npm-package-standards/eslint/react"; // or /eslint/base
import tseslint from "typescript-eslint";
import { ESLINT_IGNORE_PATTERNS } from "@silverassist/next-testing-toolkit";

export default tseslint.config(...react, { ignores: [...ESLINT_IGNORE_PATTERNS, "dist/**"] });
```

**Prettier** (`package.json`):

```json
{ "prettier": "@silverassist/npm-package-standards/prettier" }
```

**TypeScript** (`tsconfig.json`):

```json
{
  "extends": "@silverassist/npm-package-standards/tsconfig/react",
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": { "@scope/pkg/client": ["./src/client.ts"] }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

`outDir`/`rootDir`/`include`/`exclude` aren't in the shared base and never
will be: TypeScript resolves path-valued `compilerOptions` in an extended
config relative to _that config file's own location_, not the consumer's —
so `rootDir: "./src"` in this package would mean `<this package>/src`, not
your package's `src/`. Every consumer declares these itself, same as
`paths`.

**`lib` must also be restated, even though it isn't path-valued.** Confirmed
empirically: when your own `typescript` devDependency version differs from
the one this package pins, `extends`-ing a config from a _different_
package resolves `lib.*.d.ts` inconsistently — a real repro had a consumer
on `typescript@5.9.3` extending this package (pinned to `^6.0.3`) silently
lose `DOM` from its effective `lib`, surfacing as `RequestCache` not found
and `Response.json()` typed as `Promise<unknown>` instead of `Promise<any>`
(a real difference between TypeScript 5 and 6's `lib.dom.d.ts`). Copy the
`lib` array from whichever variant you extend (`/tsconfig/base` is
`["ES2020", "DOM"]`, `/tsconfig/react` adds `"DOM.Iterable"`) into your own
`compilerOptions` — restating the exact same values is enough to fix it.

**Husky hooks** — copy once, don't import:

```bash
cp node_modules/@silverassist/npm-package-standards/templates/husky/pre-commit .husky/pre-commit
cp node_modules/@silverassist/npm-package-standards/templates/husky/pre-push .husky/pre-push
chmod +x .husky/pre-commit .husky/pre-push
```

## Conventions (documented, not enforced by a shared config)

- **License string**: `PolyForm-Noncommercial-1.0.0` — this exact
  capitalization, everywhere.
- **`prepublishOnly` gate**: run the full suite before publishing —
  `npm run clean && npm run typecheck && npm run lint && npm run test && npm run build`.
- **`check` script**: `format:check && typecheck && lint && test` — the
  single command CI and the pre-push hook both run.
- **E2E port registry** (`@silverassist/next-testing-toolkit build-fixture --port <n>`,
  one per package so suites can run in parallel):

  | Port | Package              |
  | ---- | -------------------- |
  | 3210 | `recaptcha`          |
  | 3211 | `consent-banner`     |
  | 3212 | `icons`              |
  | 3213 | `nextjs-core`        |
  | 3214 | `next-script-loader` |

  Claim the next unused port for a new package rather than reusing one.

## What's deliberately NOT standardized

- **Test runner** (Jest vs. Vitest vs. none). Migrating an existing
  package's test suite between runners is a real, risky rewrite with no
  behavioral upside — out of scope for a tooling-standards pass. New
  packages should default to Jest (the fleet-wide choice across the
  site repos and `nextjs-core`/`next-script-loader`), but an existing package's
  choice is left as-is.
- **ESM/CJS extension convention** (`.mjs`/`.js` vs. `"type": "module"` +
  `.js`/`.cjs`). Both are correct, published, working conventions; forcing
  one would mean touching every consumer's build output and `exports` map
  for a purely cosmetic gain.
- **tsdown entry structure** (single-entry vs. multi-entry with a
  `"use client"` banner). `consent-banner` and `recaptcha` both need
  multi-entry configs for their client/server split; `icons` correctly
  stays single-entry since it ships no client components at all. This is a
  real technical difference, not drift.

## Status

New package (2026-08-30). Not yet published to npm or GitHub Packages — no
CI/publish workflow exists yet (same Phase 1 gap `nextjs-core` and
`next-script-loader` have). Consumers install it as a git dependency in the
meantime:

```json
{
  "devDependencies": {
    "@silverassist/npm-package-standards": "github:SilverAssist/npm-package-standards#main"
  }
}
```

Switch to a normal SemVer range once it's published for real.

## Development

```bash
npm install
npm run format:check
```

## License

[PolyForm Noncommercial 1.0.0](./LICENSE)
