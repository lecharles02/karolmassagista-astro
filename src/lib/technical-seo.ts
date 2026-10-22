type Schema = Record<string, any>;
import responsiveImages from './responsive-images.json';

const site = 'https://karolmassagista.com.br';
const reviewsUrl = 'https://share.google/6Wjq6Qx3XE8okqrHv';
const clinicalSource = 'https://www.niddk.nih.gov/health-information/urologic-diseases/prostate-problems/prostatitis-inflammation-prostate';

function textContent(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function alignMetadata(html: string, title: string, description: string) {
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\b[^>]*(?:name="(?:description|twitter:description)"|property="og:description")[^>]*content=")[^"]*/g, `$1${description}`)
    .replace(/(<meta\b[^>]*(?:name="twitter:title"|property="og:title")[^>]*content=")[^"]*/g, `$1${title}`);
}

function reviewSection(heading: 'h1' | 'h2') {
  const testimonials = [
    ['Experiência incrível', 'Fui com bastante expectativa, mas a Karol conseguiu me surpreender. Muito simpática, atenciosa e sabe deixar tudo leve e natural. O tempo passou tão rápido que nem percebi. Com certeza voltarei.'],
    ['Valeu cada minuto', 'Já tinha passado por outras experiências, mas com a Karol foi diferente. Desde a recepção até os pequenos detalhes, tudo muito bem cuidado. Ela transmite uma tranquilidade que faz a gente esquecer do mundo lá fora.'],
    ['Surpreendeu de verdade', 'Confesso que estava meio nervoso no começo, mas em poucos minutos já parecia que conhecia a Karol há tempos. Ela tem um jeito especial de conduzir tudo, sem pressa. Saí muito satisfeito e já pensando em quando voltar.'],
  ];
  const cards = `<div class="karol-reviews__grid" tabindex="0" role="region" aria-label="Depoimentos de clientes; deslize para ver mais">${testimonials.map(([title, quote]) => `<article class="karol-review"><span class="karol-reviews__stars" role="img" aria-label="5 de 5 estrelas">★★★★★</span><h3 class="karol-review__title">${title}</h3><blockquote><p>“${quote}”</p></blockquote></article>`).join('')}</div>`;
  return `<section id="depoimentos" class="karol-reviews" aria-labelledby="karol-reviews-title"><div class="karol-reviews__shell"><header class="karol-section-heading"><span class="karol-eyebrow">Depoimentos</span><${heading} id="karol-reviews-title">Avaliações de clientes</${heading}><p>Relatos de clientes sobre o atendimento da Karol.</p></header><div class="karol-reviews__summary"><div class="karol-reviews__identity"><img src="/imagens/hero/karol-logo-site.webp" alt="Logo da Karol" width="80" height="80" loading="lazy" decoding="async"><div><h3>Karol Massagista</h3><span class="karol-reviews__source">Perfil no Google</span></div></div><div class="karol-reviews__actions"><a class="karol-outline-button" href="${reviewsUrl}" target="_blank" rel="noopener noreferrer">Ver avaliações <span aria-hidden="true">↗</span></a><a class="karol-solid-button" href="https://g.page/r/CXaXmEp3QyR6EBM/review" target="_blank" rel="noopener noreferrer">Avaliar no Google <span aria-hidden="true">↗</span></a></div></div>${cards}</div></section>`;
}

function removeUnverifiedClaims(html: string, route: string) {
  let output = html;
  if (route === '/sobre-karol-massagista/') {
    output = output
      .replace(/<div class="absolute -bottom-6 -right-6[\s\S]*?Clientes Atendidos<\/p><\/div><\/div><\/div>/, '')
      .replace(/<div class="flex items-center gap-3 font-poppins text-sm">[\s\S]*?<\/div>/g, block => /Certificação|Especialista|Domínio em Terapia/.test(block) ? '' : block)
      .replace(/Com mais de 2 anos de atuação exclusiva[\s\S]*?cada cliente\./, 'O atendimento da Karol acontece em Campinas, no bairro Cambuí, em espaço privativo e com horário marcado.')
      .replace(/Referência em Terapia Tântrica e Sensorial no Cambuí, unindo técnica apurada, Ética e sensibilidade\./, 'Atendimento em espaço privativo no Cambuí, em Campinas, com respeito aos limites de cada pessoa.')
      .replace(/Minha missão\s+proporcionar/, 'Minha missão é proporcionar')
      .replace(/Anos de prática e estudo constante das técnicas tântricas\./, 'Informações sobre formação e experiência podem ser confirmadas diretamente com a profissional.')
      .replace(/alt="Karol, terapeuta tântrica profissional[^"]*"/, 'alt="Retrato de Karol em Campinas"');
  }
  if (route === '/blog/massagem-prostatica-saude/') {
    output = output
      .replace(/<p\b[^>]*>[\s\S]*?<\/p>/g, block => /uma aliada poderosa/.test(block) ? '<p>Questões relacionadas à próstata precisam de avaliação médica. Massagem de bem-estar não deve ser apresentada como prevenção, diagnóstico ou tratamento de doenças.</p>' : block)
      .replace(/(<h2\b[^>]*>)\s*Principais Benefícios para a Saúde\s*<\/h2>\s*<ul>[\s\S]*?<\/ul>/, '$1Limites e cuidados com a saúde</h2><p>Não atribua efeitos preventivos ou terapêuticos a uma sessão de bem-estar. A investigação de sintomas e a definição de tratamento cabem a profissionais de saúde habilitados.</p>')
      .replace(/(<h2\b[^>]*>)\s*Por que buscar um profissional no Cambuí\?\s*<\/h2>/, '$1Quando procurar orientação médica</h2>')
      .replace(/<section class="seo-depth" data-seo-blog-recovery>[\s\S]*?<\/section>/, '')
      .replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/, '<h1$1>Saúde masculina: limites e cuidados com a próstata</h1>')
      .replace(/(<\/article>)/, `<p class="font-poppins text-sm text-stone-600">Fonte de informação sobre prostatite: <a href="${clinicalSource}" target="_blank" rel="noopener noreferrer">NIDDK — National Institutes of Health</a>.</p>$1`);
    output = alignMetadata(output, 'Saúde Masculina: Cuidados com a Próstata | Karol', 'Informações sobre os limites da massagem de bem-estar e a importância de avaliação médica para sintomas relacionados à próstata e à saúde masculina.');
  }
  output = output.replace(/<li\b[^>]*>[\s\S]*?<\/li>/g, block => /Cura de bloqueios|Reduz cortisol:|Melhora circulação:|Insónia:|Equilíbrio emocional e psicológico|Libera ocitocina:|Saúde da próstata:|Redução drástica do estresse:|melhorando a circulação e a vitalidade|Controle da ejaculação:|Desbloqueio emocional:|Ativa relaxamento:|Controle da Energia:|Prolongamento do Prazer:|Confiança Renovada:/.test(textContent(block)) ? '' : block);
  output = output.replace(/<p\b[^>]*>[\s\S]*?<\/p>/g, block => {
    const text = textContent(block);
    if (/Não há contraindicações/.test(text)) return '<p>Condições de saúde, dor persistente ou sintomas de ansiedade devem ser discutidos com profissional de saúde habilitado. Uma experiência de bem-estar não substitui acompanhamento clínico.</p>';
    if (/promovendo cura, controle/.test(text)) return '<p>Massagens de bem-estar não devem ser apresentadas como tratamento de doenças ou garantia de resultados relacionados à saúde sexual.</p>';
    if (/O Tantra oferece a solução/.test(text)) return '<p>Ansiedade e dificuldades relacionadas à saúde sexual podem exigir avaliação médica ou psicológica. Massagens de bem-estar não substituem diagnóstico ou tratamento.</p>';
    if (/Isso gera ansiedade, que por sua vez gera perda de controle/.test(text)) return '<p>Não é adequado atribuir dificuldades de saúde sexual a uma causa única ou prometer sua resolução por meio de uma massagem.</p>';
    if (/obstruídos por traumas|ativa o hormônio|desbloquear emoções/.test(text)) return '';
    return block;
  });
  output = output.replace(/<ul\b[^>]*>\s*<\/ul>/g, '<p>Experiências de bem-estar não garantem efeitos hormonais, melhora de circulação ou tratamento de alterações do sono.</p>');
  if (route === '/blog/massagem-nuru-alivia-estresse/') {
    output = output.replace(/(<h2\b[^>]*>)\s*Por Que Funciona Contra o Estresse\?\s*<\/h2>/, '$1Limites das alegações sobre saúde</h2>');
  }
  if (route === '/blog/performance-masculina-tantra/') {
    output = output
      .replace(/(<h2\b[^>]*>)\s*O Fim da Ansiedade de Performance\s*<\/h2>/, '$1Ansiedade exige cuidado individual</h2>')
      .replace(/(<h2\b[^>]*>)\s*Como o Tantra ajuda na prática\?\s*<\/h2>/, '$1Limites das promessas de resultado</h2>');
    output = alignMetadata(output, 'Saúde Sexual: Ansiedade e Orientação Profissional | Karol', 'Entenda os limites de promessas relacionadas à saúde sexual. Ansiedade e dificuldades persistentes exigem orientação médica ou psicológica individual.');
  }
  if (route === '/blog/guia-massagem-lingam-campinas/') output = output
    .replace(/(<h2\b[^>]*>)\s*Quais os Benefícios Reais\?\s*<\/h2>/, '$1Cuidados e expectativas</h2>')
    .replace(/DÊ o próximo passo na sua saúde masculina/, 'Cuide da sua saúde com orientação profissional');
  if (route === '/blog/') output = output.replace(/seus benefícios para a saúde masculina/g, 'os cuidados e limites necessários');
  return output;
}

function sanitizeSchemas(html: string, route: string) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = `${site}${route}`;
  const seen = new Set<string>();
  function clean(value: any): any {
    if (Array.isArray(value)) return value.map(clean).filter(v => v !== undefined);
    if (!value || typeof value !== 'object') return value;
    const types = [value['@type']].flat();
    if (types.some(type => ['Review', 'AggregateRating', 'FAQPage'].includes(type))) return undefined;
    const result: Schema = {};
    for (const [key, data] of Object.entries(value)) {
      if (['aggregateRating', 'review'].includes(key)) continue;
      const normalized = clean(data);
      if (normalized !== undefined) result[key] = normalized;
    }
    if (types.includes('LocalBusiness')) {
      result['@id'] = `${site}/#business`;
      delete result.geo;
      if (typeof result.description === 'string') result.description = result.description.replace(/,\s*lingam\s+e\s+/i, ' e ');
      result.image = `${site}/imagens/hero/karol-spa-relaxante-desktop-v2.webp`;
      if (result.address) {
        delete result.address.streetAddress;
        delete result.address.postalCode;
        result.address.addressLocality = 'Campinas';
        result.address.addressRegion = 'SP';
      }
    }
    if (types.includes('Person') && result.worksFor) {
      result.worksFor = { '@id': `${site}/#business` };
      result.jobTitle = 'Massagista';
      delete result.knowsAbout;
    }
    if (types.includes('WebPage')) {
      result.name = title;
      result.description = description;
      result.url = canonical;
    }
    if (types.some(type => ['BlogPosting', 'Article'].includes(type))) {
      result.headline = title;
      result.description = description;
      result.url = canonical;
      if (route === '/blog/massagem-prostatica-saude/') {
        delete result.keywords;
        result.citation = clinicalSource;
        result.dateModified = '2026-10-08';
      }
      if (['/blog/beneficios-massagem-tantrica/', '/blog/massagem-nuru-alivia-estresse/', '/blog/guia-massagem-lingam-campinas/', '/blog/performance-masculina-tantra/'].includes(route)) result.dateModified = '2026-10-08';
    }
    if (types.includes('OfferCatalog') && result.itemListElement) {
      result.itemListElement = result.itemListElement.filter((item: Schema) => !/lingam/i.test(JSON.stringify(item)));
    }
    if (Array.isArray(result.itemListElement) && 'numberOfItems' in result) result.numberOfItems = result.itemListElement.length;
    if (types.includes('Service') && result.provider) result.provider = { '@id': `${site}/#business` };
    return result;
  }
  return html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, (_, source: string) => {
    const data = clean(JSON.parse(source));
    if (!data || (Array.isArray(data) && !data.length)) return '';
    const key = JSON.stringify(data);
    if (seen.has(key)) return '';
    seen.add(key);
    return `<script type="application/ld+json">${key.replace(/</g, '\\u003c')}</script>`;
  });
}

export function applyTechnicalSeo(html: string, route: string) {
  let output = html.replace(/<script\b[^>]*type="text\/partytown"[^>]*>[\s\S]*?<\/script>/g, '');
  output = output.replace('</head>', '<script>window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments)}gtag("js",new Date());gtag("config","G-Q489ZNZEBV");</script><script async src="https://www.googletagmanager.com/gtag/js?id=G-Q489ZNZEBV"></script></head>');
  if (route !== '/') output = output.replace(/<link\b(?=[^>]*rel="preload")(?=[^>]*as="image")(?=[^>]*karol-massagista-tantrica-hero-campinas)[^>]*>/g, '');
  if (['/', '/servicos/'].includes(route)) {
    output = output.replace(/(<meta\b[^>]*(?:name="(?:description|twitter:description)"|property="og:description")[^>]*content=")[^"]*/g, tag => tag.replace(/,? e? Lingam/i, '').replace('Nuru, sensual em', 'Nuru e sensual em'));
  }
  if (route === '/') output = output.replace(/<section id="depoimentos"[\s\S]*?<\/section>/, reviewSection('h2'));
  if (route === '/depoimentos/') {
    output = output.replace(/<main\b([^>]*)>[\s\S]*?<\/main>/, `<main$1>${reviewSection('h1')}</main>`);
    output = alignMetadata(output, 'Avaliações de Clientes no Google | Karol Massagista', 'Consulte as avaliações atualizadas de clientes da Karol no perfil do Google. Acesse a fonte original para conferir os relatos e as informações públicas.');
  }
  output = output.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, anchor => /Avaliação 5[.,]0/.test(textContent(anchor)) ? `<a href="${reviewsUrl}" target="_blank" rel="noopener noreferrer" class="text-stone-400 text-xs underline">Avaliações no Google</a>` : anchor);
  const cities: Record<string, string> = { '/massagem-sensual-hortolandia/': 'Hortolândia', '/massagem-sensual-sumare/': 'Sumaré', '/massagem-sensual-valinhos/': 'Valinhos' };
  if (cities[route]) output = output.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/, `<h1$1>Atendimento no Cambuí para visitantes de ${cities[route]}</h1>`);
  output = removeUnverifiedClaims(output, route);
  output = output.replace(/<meta\b[^>]*name="keywords"[^>]*>/g, '');
  output = output.replace(/(<meta\b[^>]*(?:name="twitter:image"|property="og:image")[^>]*content=")[^"]*karol-massagista-tantrica-hero-campinas-v2\.webp/g, `$1${site}/imagens/hero/karol-spa-relaxante-desktop-v2.webp`);
  output = output.replace(/<img\b[^>]*>/g, image => {
    const source = image.match(/\bsrc="([^"]*)"/)?.[1];
    if (source === '/imagens/hero/karol-logo-site.webp') {
      return image.replace(/\bsrc="[^"]*"/, 'src="/imagens/hero/karol-logo-w96-v1.webp"')
        .replace('<img', '<img srcset="/imagens/hero/karol-logo-w96-v1.webp 96w, /imagens/hero/karol-logo-w192-v1.webp 192w" sizes="(max-width: 767px) 72px, 96px"');
    }
    const info = responsiveImages.images[source as keyof typeof responsiveImages.images];
    if (!info?.variants.length) return image;
    const variants = [...info.variants, { src: source, width: info.width }];
    const sizes = source?.includes('/sobre-mim/')
      ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 45vw, 520px'
      : route === '/galeria/'
        ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 45vw, 380px'
        : source?.includes('/meu-espaco/')
          ? '(max-width: 767px) calc(100vw - 24px), (max-width: 1023px) 48vw, 33vw'
          : '(max-width: 767px) calc(100vw - 24px), (max-width: 1023px) 48vw, 25vw';
    return image.replace(/\bsrc="[^"]*"/, `src="${info.variants[0].src}"`).replace('<img', `<img srcset="${variants.map(v => `${v.src} ${v.width}w`).join(', ')}" sizes="${sizes}"`);
  });
  output = output.replace('</head>', '<link rel="preload" as="font" href="/fonts/SourceSans3-latin.woff2" type="font/woff2" crossorigin><link rel="preload" as="font" href="/fonts/Lora-latin.woff2" type="font/woff2" crossorigin></head>');
  return sanitizeSchemas(output, route);
}
