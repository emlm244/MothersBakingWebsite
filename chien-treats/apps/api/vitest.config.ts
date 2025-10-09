import { defineConfig } from "vitest/config";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    root: rootDir,
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      all: false,
    },
  },
  resolve: {
    alias: {
      "@data": resolve(rootDir, "../../packages/data/index.ts"),
    },
  },
});
