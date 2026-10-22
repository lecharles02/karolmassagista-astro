import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src", "legacy-html");

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && full.endsWith(".html")) {
      files.push(full);
    }
  }
};

walk(root);

const score = (text) => {
  // Common mojibake markers in PT-BR content.
  const matches = text.match(/[ÃÂ�]/g);
  return matches ? matches.length : 0;
};

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, "utf-8");
  const repaired = Buffer.from(original, "latin1").toString("utf8");

  if (score(repaired) < score(original)) {
    fs.writeFileSync(file, repaired, "utf-8");
    changed += 1;
  }
}

console.log(`Arquivos corrigidos: ${changed}`);
