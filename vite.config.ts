import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function shaLocal(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

export default defineConfig(({ mode }) => {
  void loadEnv(mode, process.cwd(), "");
  let sha = shaLocal();
  if (sha === "" && existsSync("src/version.ts")) {
    const contenu = readFileSync("src/version.ts", "utf8");
    const m = contenu.match(/VERSION_CODE = "([^"]*)"/);
    sha = m?.[1] ?? "";
  }
  return {
    plugins: [react(), tailwindcss()],
    base: "./",
    define: {
      __SHA_LOCAL__: JSON.stringify(sha),
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    build: {
      outDir: "dist",
    },
  };
});
