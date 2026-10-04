# Next ESLint directory lookup

The override applies only to `@next/eslint-plugin-next`'s `fast-glob` dependency. Next 16.3.8 uses one call, `globSync(pattern, { onlyDirectories: true })`, to resolve configured root directories.

This adapter uses maintained `tinyglobby` without the vulnerable `micromatch`/`braces` chain. It disables directory expansion, as required by tinyglobby's fast-glob migration guide. Unsupported future options fail explicitly instead of silently changing lint behaviour. Review this adapter whenever updating Next's ESLint plugin; remove the override when the upstream dependency is fixed.

https://superchupu.dev/tinyglobby/migration
