import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src", "legacy-html");
const files = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".html")) files.push(full);
  }
};
walk(root);

let changed = 0;
for (const file of files) {
  let txt = fs.readFileSync(file, "utf-8");
  const original = txt;

  // Navbar desktop + mobile: Depoimentos must scroll to home section.
  txt = txt.replaceAll(
    'href="/depoimentos" class="font-poppins text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-brand transition-all duration-300 relative group">Depoimentos',
    'href="/#depoimentos" class="font-poppins text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-brand transition-all duration-300 relative group">Depoimentos'
  );
  txt = txt.replaceAll(
    'href="/depoimentos" class="text-2xl font-montserrat font-bold text-gray-800 hover:text-brand transition-colors">Depoimentos',
    'href="/#depoimentos" class="text-2xl font-montserrat font-bold text-gray-800 hover:text-brand transition-colors">Depoimentos'
  );

  // Keep blog links in navbar with trailing slash to avoid dev warning.
  txt = txt.replaceAll(
    'href="/blog" class="font-poppins text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-brand transition-all duration-300 relative group">Blog',
    'href="/blog/" class="font-poppins text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-brand transition-all duration-300 relative group">Blog'
  );
  txt = txt.replaceAll(
    'href="/blog" class="text-2xl font-montserrat font-bold text-gray-800 hover:text-brand transition-colors">Blog',
    'href="/blog/" class="text-2xl font-montserrat font-bold text-gray-800 hover:text-brand transition-colors">Blog'
  );

  if (txt !== original) {
    fs.writeFileSync(file, txt, "utf-8");
    changed += 1;
  }
}

console.log(`Arquivos com ajuste de navegação: ${changed}`);
