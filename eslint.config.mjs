import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint config for packages/*.
 * apps/web keeps its own Next.js config (apps/web/eslint.config.mjs).
 */
export default defineConfig([
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**", "apps/**", "**/*.generated.ts"],
  },
  tseslint.configs.strict,
]);
