// Scoped replacement for the single globSync call in Next's ESLint plugin.
// Disable globby-style directory expansion to retain fast-glob semantics.
const { globSync: findDirectories } = require("tinyglobby");

exports.globSync = (pattern, options = {}) => {
  const unsupported = Object.keys(options).filter(key => key !== "onlyDirectories");
  if (unsupported.length) {
    throw new Error(`Review the Next ESLint glob adapter for new options: ${unsupported.join(", ")}`);
  }
  return findDirectories(pattern, { ...options, expandDirectories: false })
    .map(directory => directory.replace(/\/$/, ""));
};
