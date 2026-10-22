import fs from 'fs';
import path from 'path';

const htmlDir = path.join(process.cwd(), 'src', 'legacy-html');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Fix images
    let imgIndex = 0;
    content = content.replace(/<img([^>]*)>/gi, (match, attrs) => {
        let isFirst = imgIndex === 0;
        imgIndex++;
        
        let newAttrs = attrs;
        
        // Remove existing loading/fetchpriority to avoid duplicates
        newAttrs = newAttrs.replace(/\s+loading="[^"]*"/gi, '');
        newAttrs = newAttrs.replace(/\s+fetchpriority="[^"]*"/gi, '');
        newAttrs = newAttrs.replace(/\s+fetchPriority="[^"]*"/gi, '');
        
        if (isFirst) {
            newAttrs += ' fetchpriority="high"';
        } else {
            newAttrs += ' loading="lazy"';
        }
        
        return `<img${newAttrs}>`;
    });
    
    // 2. Fix astro-islands client:load
    content = content.replace(/client="load"/g, 'client="visible"');
    
    // 3. Ensure defer/async on scripts (excluding inline and already deferred)
    // Avoid scripts that already have async or defer
    content = content.replace(/<script(?![^>]*\basync\b)(?![^>]*\bdefer\b)([^>]*)src="([^"]+)"([^>]*)>/gi, '<script defer$1src="$2"$3>');
    
    fs.writeFileSync(filePath, content, 'utf-8');
}

processDir(htmlDir);
console.log('Done fixing HTML files');
