import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const legacyRoot = path.join(projectRoot, "src", "legacy-html");

const routes = [
  "/blog",
  "/depoimentos",
  "/galeria",
  "/sobre-karol-massagista",
  "/massagem-4-maos-campinas",
  "/massagem-lingam-campinas",
  "/massagem-nuru-campinas",
  "/massagem-sensual-campinas",
  "/massagem-sensual-hortolandia",
  "/massagem-sensual-sumare",
  "/massagem-sensual-valinhos",
  "/massagem-tantrica-campinas",
  "/blog/beneficios-massagem-tantrica",
  "/blog/como-apimentar-relacao-tantra",
  "/blog/comunicacao-nao-verbal-toque",
  "/blog/diferenca-massagem-sensual-erotica",
  "/blog/guia-massagem-lingam-campinas",
  "/blog/guia-relaxamento-pos-trabalho-campinas",
  "/blog/homens-casados-massagem-tantrica",
  "/blog/liberacao-miofascial-vs-tantrica",
  "/blog/massagem-nuru-alivia-estresse",
  "/blog/massagem-prostatica-saude",
  "/blog/massagem-sensual-casais-dicas",
  "/blog/melhores-spas-vs-atendimento-privado",
  "/blog/nuru-vs-tantrica",
  "/blog/performance-masculina-tantra",
  "/blog/primeira-sessao-massagem-tantrica",
  "/blog/turismo-bem-estar-rmc",
  "/blog/yoga-e-tantra-conexao"
];

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

walk(legacyRoot);

let changedFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  let text = fs.readFileSync(file, "utf-8");
  let fileReplacements = 0;

  for (const route of routes) {
    const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`href=(['\"])${escaped}(?=([\\?#]|\\1))`, "g");
    text = text.replace(regex, (match, quote) => {
      fileReplacements += 1;
      return `href=${quote}${route}/`;
    });
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(file, text, "utf-8");
    changedFiles += 1;
    totalReplacements += fileReplacements;
  }
}

console.log(`Arquivos alterados: ${changedFiles}`);
console.log(`Links corrigidos: ${totalReplacements}`);
