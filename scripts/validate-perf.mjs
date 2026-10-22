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

const stripIslands = (html) => {
  const islandRegex = /<astro-island[\s\S]*?<\/astro-island>/gi;
  return html.replace(islandRegex, "");
};

const violations = [];

for (const file of files) {
  const raw = fs.readFileSync(file, "utf-8");
  const hasIslandTag = /<astro-island\b/i.test(raw);
  const hasClientDirective = /client:(load|idle|visible|media|only)/i.test(raw);
  const content = stripIslands(raw);
  const contentForImgCheck = hasIslandTag ? content : (hasClientDirective ? "" : raw);

  const imgMatches = contentForImgCheck.match(/<img\b[^>]*>/gi) || [];
  if (imgMatches.length > 0) {
    violations.push({
      file,
      issue: "Found <img> outside astro-island",
      count: imgMatches.length
    });
  }

  const imageMatches = content.match(/<Image\b[^>]*>/gi) || [];
  if (imageMatches.length > 0) {
    let hasHighFetchpriority = false;
    for (const tag of imageMatches) {
      const hasHigh = /fetchpriority\s*=\s*("high"|'high'|{[^}]*high[^}]*})/i.test(tag);
      if (hasHigh) {
        hasHighFetchpriority = true;
        if (!/loading\s*=\s*("eager"|'eager'|{[^}]*eager[^}]*})/i.test(tag)) {
          violations.push({ file, issue: "Image with fetchpriority=high must include loading=\\\"eager\\\"" });
        }
      } else if (!/loading\s*=\s*("lazy"|'lazy'|{[^}]*lazy[^}]*})/i.test(tag)) {
        violations.push({ file, issue: "Non-LCP Image missing loading=\\\"lazy\\\"" });
      }

      if (!/\ssizes\s*=\s*("[^"]+"|'[^']+'|{[^}]+})/i.test(tag)) {
        violations.push({ file, issue: "Image missing sizes attribute" });
      }
    }

    if (!hasHighFetchpriority) {
      violations.push({ file, issue: "At least one Image must set fetchpriority=\\\"high\\\"" });
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
