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
    
    // PROBLEMA 1: CSS Assíncrono
    content = content.replace(
        /<link rel="stylesheet" href="([^"]+\.css)">/g,
        '<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="$1"></noscript>'
    );
    
    // PROBLEMA 2: GTM com Partytown
    content = content.replace(
        /<script async src="https:\/\/www.googletagmanager.com\/gtag\/js\?id=G-Q489ZNZEBV"><\/script>/g,
        '<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-Q489ZNZEBV"></script>'
    );
    content = content.replace(
        /<script>\s*window\.dataLayer = window\.dataLayer/g,
        '<script type="text/partytown">\n            window.dataLayer = window.dataLayer'
    );
    
    // PROBLEMA 4: Preload das fontes corretas
    // Primeiro removemos os preloads antigos
    content = content.replace(/<!-- Preload critical fonts -->[\s\S]*?(?=<!-- Preload LCP image -->)/g, '<!-- Preload critical fonts -->\n<link rel="preload" as="font" href="/fonts/Montserrat-Bold.woff2" type="font/woff2" crossorigin>\n<link rel="preload" as="font" href="/fonts/Poppins-Bold.woff2" type="font/woff2" crossorigin>\n');
    
    // PROBLEMA 5: Remover preconnect inútil com wa.me
    content = content.replace(/<link rel="preconnect" href="https:\/\/wa\.me" crossorigin>/g, '');
    content = content.replace(/<link rel="dns-prefetch" href="https:\/\/wa\.me">/g, '');
    
    fs.writeFileSync(filePath, content, 'utf-8');
}

processDir(htmlDir);
console.log('Done applying Lighthouse fixes');
