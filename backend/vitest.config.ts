// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // WHY: run test files sequentially, not in parallel.
    // Parallel DB tests cause race conditions — two tests
    // deleting the same user at the same time = flaky tests.
    fileParallelism: false,
    // WHY: Neon is a remote DB with cold start latency.
    // 30s for individual tests, 60s for beforeAll hooks
    // which do signup + login + DB queries before any test runs.
    testTimeout: 30000,
    hookTimeout: 60000,
    teardownTimeout: 15000,
  },
});
