import fs from "node:fs";
import path from "node:path";

const routeArg = process.argv[2];

if (!routeArg) {
  console.error("Uso: node scripts/extract-page.mjs <rota>");
  console.error("Exemplo: node scripts/extract-page.mjs /depoimentos/");
  process.exit(1);
}

const normalizeRoute = (value) => {
  const trimmed = value.trim();
  if (trimmed === "/") {
    return "/";
  }

  const noEdges = trimmed.replace(/^\/+|\/+$/g, "");
  return `/${noEdges}/`;
};

const route = normalizeRoute(routeArg);
const projectRoot = process.cwd();

const pagesBase = path.join(projectRoot, "src", "pages");
const legacyBase = path.join(projectRoot, "src", "legacy-html");
const componentPath = path.join(projectRoot, "src", "components", "LegacyDocument.astro");

const routeParts = route === "/" ? [] : route.slice(1, -1).split("/");
const pageDir = path.join(pagesBase, ...routeParts);
const pageFile = path.join(pageDir, "index.astro");

if (!fs.existsSync(pageFile)) {
  console.error(`Pagina nao encontrada: ${pageFile}`);
  process.exit(1);
}

if (!fs.existsSync(componentPath)) {
  console.error("Componente LegacyDocument nao encontrado em src/components.");
  process.exit(1);
}

const legacyDir = path.join(legacyBase, ...routeParts);
const legacyFile = path.join(legacyDir, "index.html");

const originalContent = fs.readFileSync(pageFile, "utf-8");
fs.mkdirSync(legacyDir, { recursive: true });
fs.writeFileSync(legacyFile, originalContent, "utf-8");

const importPath = path
  .relative(path.dirname(pageFile), componentPath)
  .replace(/\\/g, "/");
const safeImportPath = importPath.startsWith(".") ? importPath : `./${importPath}`;

const wrapper = `---\nimport LegacyDocument from \"${safeImportPath}\";\n---\n\n<LegacyDocument filePath=\"${path
  .relative(projectRoot, legacyFile)
  .replace(/\\/g, "/")}\" />\n`;

fs.writeFileSync(pageFile, wrapper, "utf-8");

console.log(`Rota convertida para wrapper: ${route}`);
console.log(`HTML legado salvo em: ${path.relative(projectRoot, legacyFile)}`);
