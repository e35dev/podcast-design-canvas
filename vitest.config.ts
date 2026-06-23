import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@edit-schema": fileURLToPath(new URL("./packages/edit-schema/index.ts", import.meta.url)),
      "@validation": fileURLToPath(new URL("./packages/validation/index.ts", import.meta.url)),
    },
  },
});
