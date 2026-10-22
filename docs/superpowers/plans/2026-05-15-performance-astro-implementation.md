# Performance Hardening (Astro) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate legacy pages to native Astro with optimized images and Cloudflare Pages caching, without changing SEO or breaking interactivity.

**Architecture:** Convert each legacy HTML page into a native `.astro` page that preserves the existing `<head>` and body HTML, replacing only static `<img>` tags outside `astro-island` blocks with `astro:assets` `<Image>` components. Use a route-based migration script to apply changes incrementally. Add a validation script to enforce image rules and Cloudflare cache headers for static assets.

**Tech Stack:** Astro 5, Node.js scripts, Cloudflare Pages headers.

---

## File Structure

- Modify: `astro.config.mjs`
- Create: `public/_headers`
- Create: `scripts/validate-perf.mjs`
- Create: `scripts/migrate-route.mjs`
- Create: `src/assets/imagens/**` (copy of `public/imagens/**`)
- Modify: `src/pages/**` (replace LegacyDocument wrappers with native `.astro` pages)

---

### Task 1: Add validation script for image rules (TDD)

**Files:**
- Create: `scripts/validate-perf.mjs`

- [ ] **Step 1: Write the failing test script**

```js
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const pagesRoot = path.join(projectRoot, "src", "pages");

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".astro")) files.push(full);
  }
};
walk(pagesRoot);

// NOTE: Validation is applied only outside astro-island blocks.
const stripIslands = (html) => {
  const islandRegex = /<astro-island[\s\S]*?<\/astro-island>/gi;
  return html.replace(islandRegex, "");
};

const violations = [];

for (const file of files) {
  const raw = fs.readFileSync(file, "utf-8");
  const content = stripIslands(raw);

  const imgMatches = content.match(/<img\b[^>]*>/gi) || [];
  if (imgMatches.length > 0) {
    violations.push({
      file,
      issue: "Found <img> outside astro-island",
      count: imgMatches.length
    });
  }

  const imageMatches = content.match(/<Image\b[^>]*>/gi) || [];
  if (imageMatches.length > 0) {
    const first = imageMatches[0];
    if (!/fetchpriority=\"high\"/i.test(first) || !/loading=\"eager\"/i.test(first)) {
      violations.push({ file, issue: "First Image must be LCP (fetchpriority=high + loading=eager)" });
    }
    for (let i = 1; i < imageMatches.length; i += 1) {
      const tag = imageMatches[i];
      if (!/loading=\"lazy\"/i.test(tag)) {
        violations.push({ file, issue: "Non-LCP Image missing loading=\\\"lazy\\\"" });
      }
    }
    for (const tag of imageMatches) {
      if (!/\ssizes=\"/i.test(tag)) {
        violations.push({ file, issue: "Image missing sizes attribute" });
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Performance validation failed:");
  for (const v of violations) {
    console.error(`- ${v.file}: ${v.issue}${v.count ? ` (${v.count})` : ""}`);
  }
  process.exit(1);
}

console.log("Performance validation passed.");
```

- [ ] **Step 2: Run the script to confirm it fails**

Run: `node scripts/validate-perf.mjs`
Expected: FAIL with "Found <img> outside astro-island".

- [ ] **Step 3: Commit**

```bash
git add scripts/validate-perf.mjs
git commit -m "chore: add performance validation script"
```

---

### Task 2: Enable HTML compression in Astro

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Update Astro config**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://karolmassagista.com.br',
  trailingSlash: 'always',
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add astro.config.mjs
git commit -m "perf: enable HTML compression and inline styles"
```

---

### Task 3: Add Cloudflare Pages cache headers

**Files:**
- Create: `public/_headers`

- [ ] **Step 1: Create headers file**

```text
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/imagens/*
  Cache-Control: public, max-age=2592000
```

- [ ] **Step 2: Commit**

```bash
git add public/_headers
git commit -m "perf: add Cloudflare Pages cache headers"
```

---

### Task 4: Copy images into src/assets for astro:assets

**Files:**
- Create: `src/assets/imagens/**`

- [ ] **Step 1: Copy images from public**

Run:

```powershell
Copy-Item -Recurse -Force "public/imagens" "src/assets/imagens"
```

Expected: `src/assets/imagens` mirrors `public/imagens`.

- [ ] **Step 2: Commit**

```bash
git add src/assets/imagens
git commit -m "chore: add image assets for astro:assets"
```

---

### Task 5: Create route migration script to convert a single legacy page

**Files:**
- Create: `scripts/migrate-route.mjs`

- [ ] **Step 1: Write the migration script**

```js
import fs from "node:fs";
import path from "node:path";

const routeArg = process.argv[2];
if (!routeArg) {
  console.error("Usage: node scripts/migrate-route.mjs <route>");
  console.error("Example: node scripts/migrate-route.mjs /depoimentos/");
  process.exit(1);
}

const normalizeRoute = (value) => {
  const trimmed = value.trim();
  if (trimmed === "/") return "/";
  const noEdges = trimmed.replace(/^\/+|\/+$/g, "");
  return `/${noEdges}/`;
};

const route = normalizeRoute(routeArg);
const projectRoot = process.cwd();
const legacyRoot = path.join(projectRoot, "src", "legacy-html");
const pagesRoot = path.join(projectRoot, "src", "pages");
const isWindows = process.platform === "win32";

const toImportName = (src) => {
  const base = src
    .replace(/^\//, "")
    .replace(/\.[a-zA-Z0-9]+$/, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((part, index) => {
      if (index === 0) return part.toLowerCase();
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
  return `img${base.charAt(0).toUpperCase()}${base.slice(1)}`;
};

const normalizePath = (value) => (isWindows ? value.replace(/\\/g, "/") : value);

const extractAttrs = (tag) => {
  const attrs = {};
  const attrRegex = /([a-zA-Z0-9:-]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g;
  let match;
  while ((match = attrRegex.exec(tag))) {
    const key = match[1];
    const rawValue = match[2];
    if (!rawValue) {
      attrs[key] = true;
      continue;
    }
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    attrs[key] = value;
  }
  return attrs;
};

const buildImageTag = (attrs, importName, isLcp) => {
  const classAttr = attrs.class ? ` class=\"${attrs.class}\"` : "";
  const altAttr = attrs.alt ? ` alt=\"${attrs.alt}\"` : "";
  const widthAttr = attrs.width ? ` width=\"${attrs.width}\"` : "";
  const heightAttr = attrs.height ? ` height=\"${attrs.height}\"` : "";
  const decodingAttr = attrs.decoding ? ` decoding=\"${attrs.decoding}\"` : "";
  const styleAttr = attrs.style ? ` style=\"${attrs.style}\"` : "";
  const loadingAttr = isLcp ? " loading=\"eager\"" : " loading=\"lazy\"";
  const fetchAttr = isLcp ? " fetchpriority=\"high\"" : "";
  const sizesAttr = " sizes=\"(min-width: 1024px) 50vw, 100vw\"";
  const widthsAttr = " widths={ [320, 480, 640, 960, 1200] }";

  return `<Image src={${importName}}${altAttr}${classAttr}${styleAttr}${widthAttr}${heightAttr}${decodingAttr}${loadingAttr}${fetchAttr}${sizesAttr}${widthsAttr} />`;
};

const routeParts = route === "/" ? [] : route.slice(1, -1).split("/");
const legacyFile = route === "/"
  ? path.join(legacyRoot, "index.html")
  : route === "/404/"
    ? path.join(legacyRoot, "404.html")
    : path.join(legacyRoot, ...routeParts, "index.html");

if (!fs.existsSync(legacyFile)) {
  console.error(`Legacy file not found: ${legacyFile}`);
  process.exit(1);
}

const legacyHtml = fs.readFileSync(legacyFile, "utf-8");

const islands = [];
const contentWithoutIslands = legacyHtml.replace(/<astro-island[\s\S]*?<\/astro-island>/gi, (match) => {
  const token = `__ASTRO_ISLAND_${islands.length}__`;
  islands.push(match);
  return token;
});

const imgRegex = /<img\b[^>]*>/gi;
let working = contentWithoutIslands;
const importMap = new Map();
let imageIndex = 0;

working = working.replace(imgRegex, (tag) => {
  const attrs = extractAttrs(tag);
  const src = attrs.src;
  if (!src || !src.startsWith("/imagens/")) {
    return tag;
  }

  if (!importMap.has(src)) {
    importMap.set(src, toImportName(src));
  }

  const importName = importMap.get(src);
  const isLcp = imageIndex === 0;
  imageIndex += 1;

  return buildImageTag(attrs, importName, isLcp);
});

for (let i = 0; i < islands.length; i += 1) {
  working = working.replace(`__ASTRO_ISLAND_${i}__`, islands[i]);
}

const importLines = [];
if (importMap.size > 0) {
  importLines.push('import { Image } from "astro:assets";');
  for (const [src, varName] of importMap.entries()) {
    const assetPath = path.join(projectRoot, "src", "assets", src.replace(/^\//, ""));
    const pageDir = route === "/"
      ? pagesRoot
      : path.join(pagesRoot, ...routeParts);
    const importPath = normalizePath(path.relative(pageDir, assetPath));
    importLines.push(`import ${varName} from "${importPath}";`);
  }
}

const frontmatter = importLines.length > 0
  ? `---\n${importLines.join("\n")}\n---\n\n`
  : "";

const targetFile = route === "/"
  ? path.join(pagesRoot, "index.astro")
  : route === "/404/"
    ? path.join(pagesRoot, "404.astro")
    : path.join(pagesRoot, ...routeParts, "index.astro");

fs.mkdirSync(path.dirname(targetFile), { recursive: true });
fs.writeFileSync(targetFile, frontmatter + working, "utf-8");

console.log(`Route migrated: ${route}`);
```

- [ ] **Step 2: Run the migration for /depoimentos/**

Run: `node scripts/migrate-route.mjs /depoimentos/`
Expected: `Route migrated: /depoimentos/`

- [ ] **Step 3: Commit (if git repo exists)**

```bash
git add scripts/migrate-route.mjs src/pages/depoimentos/index.astro
git commit -m "perf: migrate /depoimentos/ to native Astro"
```

---

### Task 6: Migrate priority routes (incremental)

**Files:**
- Modify: `src/pages/galeria/index.astro`
- Modify: `src/pages/sobre-karol-massagista/index.astro`

- [ ] **Step 1: Migrate /galeria/**

Run: `node scripts/migrate-route.mjs /galeria/`
Expected: `Route migrated: /galeria/`

- [ ] **Step 2: Migrate /sobre-karol-massagista/**

Run: `node scripts/migrate-route.mjs /sobre-karol-massagista/`
Expected: `Route migrated: /sobre-karol-massagista/`

- [ ] **Step 3: Commit (if git repo exists)**

```bash
git add src/pages/galeria/index.astro src/pages/sobre-karol-massagista/index.astro
git commit -m "perf: migrate priority routes to native Astro"
```

---

### Task 7: Migrate remaining routes, then validate and build

**Files:**
- Modify: `src/pages/**/index.astro`
- Modify: `src/pages/404.astro`

- [ ] **Step 1: Migrate service and blog routes**

Run each command:

```
node scripts/migrate-route.mjs /massagem-4-maos-campinas/
node scripts/migrate-route.mjs /massagem-lingam-campinas/
node scripts/migrate-route.mjs /massagem-nuru-campinas/
node scripts/migrate-route.mjs /massagem-sensual-campinas/
node scripts/migrate-route.mjs /massagem-sensual-hortolandia/
node scripts/migrate-route.mjs /massagem-sensual-sumare/
node scripts/migrate-route.mjs /massagem-sensual-valinhos/
node scripts/migrate-route.mjs /massagem-tantrica-campinas/
node scripts/migrate-route.mjs /blog/
node scripts/migrate-route.mjs /blog/beneficios-massagem-tantrica/
node scripts/migrate-route.mjs /blog/como-apimentar-relacao-tantra/
node scripts/migrate-route.mjs /blog/comunicacao-nao-verbal-toque/
node scripts/migrate-route.mjs /blog/diferenca-massagem-sensual-erotica/
node scripts/migrate-route.mjs /blog/guia-massagem-lingam-campinas/
node scripts/migrate-route.mjs /blog/guia-relaxamento-pos-trabalho-campinas/
node scripts/migrate-route.mjs /blog/homens-casados-massagem-tantrica/
node scripts/migrate-route.mjs /blog/liberacao-miofascial-vs-tantrica/
node scripts/migrate-route.mjs /blog/massagem-nuru-alivia-estresse/
node scripts/migrate-route.mjs /blog/massagem-prostatica-saude/
node scripts/migrate-route.mjs /blog/massagem-sensual-casais-dicas/
node scripts/migrate-route.mjs /blog/melhores-spas-vs-atendimento-privado/
node scripts/migrate-route.mjs /blog/nuru-vs-tantrica/
node scripts/migrate-route.mjs /blog/performance-masculina-tantra/
node scripts/migrate-route.mjs /blog/primeira-sessao-massagem-tantrica/
node scripts/migrate-route.mjs /blog/turismo-bem-estar-rmc/
node scripts/migrate-route.mjs /blog/yoga-e-tantra-conexao/
```

- [ ] **Step 2: Migrate home and 404**

Run:

```
node scripts/migrate-route.mjs /
node scripts/migrate-route.mjs /404/
```

- [ ] **Step 3: Replace client="load" only for SiloLinks**

Find in `src/pages` and replace:

```
client="load"
```

with:

```
client="idle"
```

ONLY when the tag contains `component-url="/_astro/SiloLinks`.

- [ ] **Step 4: Re-run validation script**

Run: `node scripts/validate-perf.mjs`
Expected: `Performance validation passed.`

- [ ] **Step 5: Build to ensure no regressions**

Run: `npm run build`
Expected: build completes without errors.

- [ ] **Step 6: Commit (if git repo exists)**

```bash
git add -A
git commit -m "chore: finalize performance migration"
```
