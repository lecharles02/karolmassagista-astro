import { additionalServices } from "./additional-services";

type Photo = [string, string];

const whatsappIcon = '<svg class="karol-whatsapp-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';

function replaceWhatsappIcons(html: string) {
  return html.replace(/<a\b[^>]*href="https:\/\/(?:wa\.me|api\.whatsapp\.com)\/[^>]*>[\s\S]*?<\/a>/g, anchor => {
    const icon = /<svg\b[^>]*>[\s\S]*?<\/svg>/;
    return icon.test(anchor) ? anchor.replace(icon, whatsappIcon) : anchor.replace(/(<a\b[^>]*>)/, '$1' + whatsappIcon);
  });
}

const gallery: Photo[] = [
  ["karol-galeria-10.webp", "Karol em um ensaio com lingerie vermelha em ambiente acolhedor"],
  ["karol-galeria-11.webp", "Karol em um ensaio com lingerie vermelha sobre uma cama"],
  ["karol-galeria-01.webp", "Karol durante uma viagem, junto à janela"],
  ["karol-galeria-02.webp", "Retrato de Karol durante uma viagem"],
  ["karol-galeria-03.webp", "Karol em um jardim, usando um conjunto branco"],
  ["karol-galeria-04.webp", "Karol em roupa esportiva vermelha"],
  ["karol-galeria-05.webp", "Karol sentada em um sofá, usando blusa branca"],
  ["karol-galeria-massagem-spa.webp", "Karol realizando uma massagem em um ambiente de spa à luz de velas"],
  ["karol-galeria-06.webp", "Retrato de Karol usando camisa branca"],
  ["karol-galeria-07.webp", "Retrato de Karol usando vestido preto"],
  ["karol-galeria-08.webp", "Karol em um ambiente com iluminação noturna"],
  ["karol-galeria-09.webp", "Retrato de Karol em um ambiente acolhedor"],
];
const dimensions: Record<string, [number, number]> = {
  "karol-galeria-10.webp": [700,1280], "karol-galeria-11.webp": [711,1179],
  "karol-galeria-massagem-spa.webp": [850,769],
  "karol-galeria-05.webp": [1000,1250], "karol-galeria-06.webp": [1000,1250], "karol-galeria-07.webp": [1000,1250], "karol-galeria-08.webp": [1000,1250], "karol-galeria-09.webp": [1000,1250],
  "ambiente-recepcao.webp": [1086,1448], "ambiente-sala.webp": [1200,1000], "ambiente-maca.webp": [1200,1120],
  "karol-galeria-01.webp": [1000,1250], "karol-galeria-02.webp": [1000,1250], "karol-galeria-03.webp": [1000,1250], "karol-galeria-04.webp": [941,1672],
  "massagista-profissional-campinas.webp": [522,709], "ambiente-acolhedor-massagem-campinas.webp": [489,596], "carinho-massagem-tantrica-campinas.webp": [553,638], "conexao-corporal-massagem-campinas.webp": [301,402],
  "atendimento-exclusivo-massagem-campinas.jpg": [410,527], "experiencia-sensorial-massagem-campinas.webp": [512,713], "relaxamento-profundo-massagem-campinas.webp": [593,842], "sessao-massagem-nuru-campinas.webp": [521,663], "tecnica-massagem-nuru-campinas.webp": [715,855], "toque-terapeutico-tantrico-campinas.webp": [470,595], "massagem-relaxante-profissional-campinas.jpg": [600,400],
  "ambiente-massagem-tantrica-campinas-1.webp": [713,572], "espaco-privativo-massagem-campinas-2.webp": [551,515], "sala-massagem-nuru-campinas-3.webp": [340,445], "ambiente-discreto-massagem-campinas-4.webp": [665,567], "massagem-profissional-campinas-cambui-5.webp": [434,374],
};
const space: Photo[] = [
  ["ambiente-recepcao.webp", "Recepção com painel verde e iluminação azul"],
  ["ambiente-sala.webp", "Sala de massagem com iluminação acolhedora"],
  ["ambiente-maca.webp", "Maca de massagem com toalhas e iluminação suave"],
];

function carousel(photos: Photo[], folder: string, label: string) {
  return `<div class="karol-carousel" data-photo-carousel role="region" aria-roledescription="carrossel" aria-label="${label}"><div class="karol-carousel__viewport"><div class="karol-carousel__track">${photos.map(([file, alt]) => `<figure class="karol-carousel__slide"><img src="/imagens/${folder}/${file}" alt="${alt}" loading="lazy" decoding="async" width="${dimensions[file][0]}" height="${dimensions[file][1]}" draggable="false"></figure>`).join("")}</div></div><button class="karol-carousel__arrow karol-carousel__arrow--prev" data-carousel-prev type="button" aria-label="Foto anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg></button><button class="karol-carousel__arrow karol-carousel__arrow--next" data-carousel-next type="button" aria-label="Próxima foto"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7"/></svg></button></div>`;
}

export function refinePresentation(html: string, route: string) {
  let output = html
    .replace(/<link\b[^>]*rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>/gi, "")
    .replace("</head>", '<link rel="icon" type="image/png" sizes="64x64" href="/favicon-karol.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="stylesheet" href="/styles/home-presentation.css"></head>')
    .replace(/<div\b[^>]*>\s*Site por\s*<span[^>]*>[^<]*<\/span>\s*<\/div>/gi, "")
    .replace(/Consultar horários|CONSULTAR HORÁRIOS|consultar horários/g, "Chamar no WhatsApp");
  output = output.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, style => style
    .replace(/@font-face\s*\{[^}]*\}/g, "")
    .replace(/(["']?)\bPoppins\b\1/g, '"Source Sans 3"')
    .replace(/\bMontserrat\b|Georgia/g, "Lora"));
  output = output.replace(/<link\b(?=[^>]*as="font")[^>]*>/g, "");
  output = output.replace(/<li>\s*<a\b[^>]*href="\/massagem-lingam-campinas\/"[\s\S]*?<\/a>\s*<\/li>/g, "");
  if (route === "/servicos/") {
    output = output.replace(/<div class="group bg-white[^>]*><h3\b[^>]*>Massagem Lingam<\/h3>[\s\S]*?<\/a>\s*<\/div><\/div>/g, "");
    output = output.replace(/<div class="(group bg-white[^\"]*)"><h3\b([^>]*)>(Vivência Mútua)<\/h3>/, '<div id="vivencia-mutua" class="$1"><h3$2>$3</h3>');
    const mix = additionalServices.find(service => service.name === "Nuru Mix")!;
    output = output.replace(/(<div id="vivencia-mutua")/, `<article id="nuru-mix" class="karol-catalog-card"><h3>${mix.name}</h3><p>${mix.description}</p><a class="karol-solid-button" href="https://wa.me/5519983732331?text=${encodeURIComponent("Olá, Karol. Gostaria de conhecer a Nuru Mix e consultar horários.")}" target="_blank" rel="noopener noreferrer">Conhecer Nuru Mix</a></article>$1`);
  }
  output = output.replace(/<footer\b[\s\S]*?<\/footer>/, footer => footer.includes('href="/servicos/"') ? footer : footer.replace(/(<nav\b[^>]*>[\s\S]*?<ul\b[^>]*>)/, '$1<li><a href="/servicos/">Serviços e massagens</a></li>'));
  output = output.replace(/<div class="seo-mobile-whatsapp"[\s\S]*?<\/a>\s*<\/div>/g, "");
  output = replaceWhatsappIcons(output);
  if (route === "/galeria/") {
    const photos = gallery.map(([file, alt]) => '<a class="karol-full-gallery__photo" href="/imagens/galeria/' + file + '" target="_blank" rel="noopener noreferrer" aria-label="Abrir foto em tamanho original: ' + alt + '"><img src="/imagens/galeria/' + file + '" alt="' + alt + '" width="' + dimensions[file][0] + '" height="' + dimensions[file][1] + '" loading="lazy" decoding="async"></a>').join("");
    output = output.replace(/<section class="py-24 bg-background min-h-screen">[\s\S]*?<\/section>/, '<section class="karol-full-gallery" aria-labelledby="karol-full-gallery-title"><div class="karol-full-gallery__shell"><header><a class="karol-full-gallery__back" href="/">Voltar para o início</a><h1 id="karol-full-gallery-title">Galeria da Karol</h1><p>Conheça os registros mais recentes compartilhados pela Karol. Toque em uma foto para abrir em tamanho original.</p></header><div class="karol-full-gallery__grid">' + photos + '</div></div></section>');
  }
  if (route !== "/") return output;

  output = output.replace(/(<picture class="home-hero__media">)/, '<a class="home-hero__logo" href="/" aria-label="Karol Massagem Tântrica — página inicial"><img src="/imagens/hero/karol-logo-site.webp" alt="Karol Massagem Tântrica" width="400" height="400" decoding="async"></a>$1');
  output = output.replace(/(<img class="home-hero__image"[^>]*\balt=")[^"]+"/, '$1Karol em um ambiente de spa à luz de velas"');

  output = output.replace(/<section id="contato"([^>]*)>/, '<section id="contato"$1><picture class="karol-contact-background"><img src="/imagens/hero/karol-contato-final.webp" width="1673" height="706" alt="" loading="lazy" decoding="async"></picture>');

  output = output.replace(/<h2 id="home-about-title">[\s\S]*?<\/h2>/, '<h2 id="home-about-title">Por que eu sou a massagista certa pra você.</h2>');
  output = output.replace(/<section id="faq"[\s\S]*?<\/section>/, section => {
    const questions = [...section.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>/g)].filter(([, question, answer]) => !/lingam/i.test(question + answer));
    const items = questions.map(([, question, answer]) => '<details name="karol-faq"><summary>' + question + '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></summary><div class="karol-faq__answer"><p>' + answer + '</p></div></details>').join("");
    return '<section id="faq" class="karol-faq" aria-labelledby="karol-faq-title"><div class="karol-faq__shell"><header class="karol-faq__intro"><p class="karol-faq__kicker">Tire suas dúvidas</p><h2 id="karol-faq-title">Perguntas<br>frequentes</h2><p>Encontre respostas sobre o atendimento, o espaço no Cambuí e como agendar seu momento com a Karol.</p><a class="karol-solid-button" href="https://wa.me/5519983732331" target="_blank" rel="noopener noreferrer">' + whatsappIcon + ' Fale com a Karol</a></header><div class="karol-faq__list">' + items + '</div></div></section>';
  });


  output = output.replace(/<section id="galeria"[\s\S]*?<\/section>/, `<section id="galeria" class="karol-photo-section" aria-labelledby="karol-gallery-title"><header class="karol-section-heading"><span class="karol-eyebrow">Galeria profissional</span><h2 id="karol-gallery-title">Conheça um pouco mais da Karol</h2><p>Registros compartilhados pela Karol. Deslize pelas fotos e conheça quem vai receber você no Cambuí, em Campinas.</p></header>${carousel(gallery, "galeria", "Galeria de fotos da Karol")}<div class="karol-section-action"><a class="karol-outline-button" href="/galeria/">Ver todas as fotos da galeria <span aria-hidden="true">↗</span></a></div></section>`);
  output = output.replace(/<section id="espaco"[\s\S]*?<\/section>/, `<section id="espaco" class="karol-photo-section karol-photo-section--space" aria-labelledby="karol-space-title"><header class="karol-section-heading"><span class="karol-eyebrow">O ambiente</span><h2 id="karol-space-title">Seu momento de pausa no Cambuí</h2><p>Conheça o espaço privativo de atendimento da Karol em Campinas, preparado para receber você com conforto e discrição.</p></header>${carousel(space, "meu-espaco", "Fotos do ambiente de atendimento")}</section>`);

  const quotes = [
    "Ambiente seguro e muito bem localizado, tudo organizado e acolhedor.",
    "Uma forma de renovar nosso relacionamento... Ele elogiou bastante o atendimento da Karol.",
    "A massagem foi sensacional, a melhor que eu já fiz.",
  ];
  output = output.replace(/<section id="depoimentos"[\s\S]*?<\/section>/, `<section id="depoimentos" class="karol-reviews" aria-labelledby="karol-reviews-title"><div class="karol-reviews__shell"><header class="karol-section-heading"><span class="karol-eyebrow">Experiências compartilhadas</span><h2 id="karol-reviews-title">O que os clientes dizem no Google</h2><p>Opiniões de quem já conhece o atendimento da Karol.</p></header><div class="karol-reviews__summary"><div class="karol-reviews__identity"><img src="/imagens/hero/karol-logo-site.webp" alt="Karol Massagem Tântrica" width="80" height="80" loading="lazy"><div><h3>Karol Massagista</h3><div class="karol-reviews__rating"><strong>5,0</strong><span class="karol-reviews__stars" aria-label="5 de 5 estrelas">★★★★★</span><span>16 avaliações no Google</span></div><span class="karol-reviews__source">Avaliações públicas · Google</span></div></div><div class="karol-reviews__actions"><a class="karol-solid-button" href="https://g.page/r/CXaXmEp3QyR6EBM/review" target="_blank" rel="noopener noreferrer">Avaliar no Google <span aria-hidden="true">↗</span></a><a class="karol-reviews__profile" href="https://share.google/6Wjq6Qx3XE8okqrHv" target="_blank" rel="noopener noreferrer">Ver perfil e todas as avaliações</a></div></div><div class="karol-reviews__grid" tabindex="0" role="region" aria-label="Depoimentos dos clientes; deslize para ver mais">${quotes.map(quote => `<article class="karol-review"><span class="karol-review__quote" aria-hidden="true">“</span><span class="karol-reviews__stars" aria-label="5 de 5 estrelas">★★★★★</span><blockquote><p>“${quote}”</p></blockquote><footer>Trecho de avaliação pública no Google</footer></article>`).join("")}</div><p class="karol-reviews__note">Já conhece o atendimento? Sua avaliação ajuda outras pessoas a escolherem com confiança.</p></div></section>`);
  return output
    .replace(/<img\b[^>]*>/g, image => /\bdecoding=/.test(image) ? image : image.replace("<img", '<img decoding="async"'))
    .replace("</body>", '<script src="/scripts/photo-carousel.js" defer></script></body>');
}
