// Génère src/version.ts : empreinte du code pour la détection de mise à jour.
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

function shaCourant() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "inconnu";
  }
}

const sha = shaCourant();
const date = new Date().toISOString();
mkdirSync(path.resolve("src"), { recursive: true });
writeFileSync(
  path.resolve("src/version.ts"),
  `// Généré automatiquement au build — ne pas éditer à la main.
export const VERSION_CODE = "${sha}";
export const DATE_BUILD = "${date}";
`,
);
console.log(`version.ts généré (SHA: ${sha.slice(0, 8)}…)`);
// Empreinte aussi écrite dans dist/version.txt (lue par le processus Electron packagé).
mkdirSync(path.resolve("dist"), { recursive: true });
writeFileSync(path.resolve("dist/version.txt"), `${sha}\n`);
console.log("dist/version.txt généré");
