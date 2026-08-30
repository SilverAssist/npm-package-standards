# Changelog

## 0.1.0 (2026-08-30)

Initial release. Shared ESLint (`eslint/base`, `eslint/react`), Prettier,
and tsconfig (`tsconfig/base`, `tsconfig/react`) configs, plus Husky
`pre-commit`/`pre-push` templates, for Silver Assist's published npm
packages.

- `eslint/base` and `eslint/react`'s runtime dependencies (`@eslint/js`,
  `eslint-config-prettier`) are listed under `dependencies`, not
  `devDependencies` — required for consumers that install this package.
- `tsconfig/base` and `tsconfig/react` intentionally omit `rootDir`,
  `outDir`, `include`, and `exclude`: TypeScript resolves path-valued
  `compilerOptions` in an extended config relative to that config file's
  own location, not the consumer's. Every consumer restates these itself.
- `tsconfig/base`'s `lib` includes `DOM` (not just `ES2020`) — needed even
  by non-React packages for `fetch`/`Response` types. Consumers must
  restate `lib` in their own `tsconfig.json` regardless of whether it
  matches this package's own array, since a `typescript` version mismatch
  between a consumer and this package can otherwise resolve `lib.*.d.ts`
  inconsistently across the `extends` chain.
