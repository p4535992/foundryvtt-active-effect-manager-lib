import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/module.ts"),
      name: "SvelteInFoundry",
      fileName: "svelte-in-foundry",
    },
    rollupOptions: {
      output: {
        globals: {
          svelte: "svelte",
        },
      },
    },
  },
});
