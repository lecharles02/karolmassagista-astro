import fs from 'node:fs';
import path from 'node:path';

const directory = path.resolve('reports/seo-2026-10-08/correcoes');
const before = JSON.parse(fs.readFileSync(path.join(directory, 'before.json'), 'utf8'));
const after = JSON.parse(fs.readFileSync(path.join(directory, 'after.json'), 'utf8'));
const coverage = JSON.parse(fs.readFileSync(path.join(directory, 'gsc-urls.json'), 'utf8'));
const tests = JSON.parse(fs.readFileSync(path.join(directory, 'tests.json'), 'utf8'));
const lighthouse = JSON.parse(fs.readFileSync(path.join(directory, 'lighthouse-producao-mobile.json'), 'utf8'));
const bytes = page => page.resources.reduce((sum, resource) => sum + resource.bytes, 0);
const kb = number => (number / 1000).toFixed(1).replace('.', ',') + ' kB';
const performance = before.map(old => {
  const current = after.find(page => page.route === old.route);
  return `| \`${old.route}\` | ${kb(bytes(old))} | ${kb(bytes(current))} | ${((1 - bytes(current) / bytes(old)) * 100).toFixed(1).replace('.', ',')}% |`;
}).join('\n');
const urls = coverage.coverage.map(page => `| \`${page.route}\` | ${page.live.at(-1).status} | ${page.local.at(-1).status} | ${page.inSitemap ? 'Sim' : 'Não'} | ${page.noindex ? 'Sim' : 'Não'} | ${page.incomingPages} |`).join('\n');
const report = `# Correções de SEO aplicadas — 8 de outubro de 2026

As alterações estão no projeto e no build em \`dist/\`. Esta entrega não foi publicada no domínio de produção. O servidor de revisão está disponível em http://localhost:4323/.

## Status das prioridades autorizadas

| Ordem | Resultado nesta entrega | Dependência restante |
| --- | --- | --- |
| 1 | ${tests.redirects.length} regras estáticas válidas para Cloudflare; mesma lógica de redirecionamento usada no middleware local e em Pages Functions. Testados GET, HEAD, barra final, HTTPS, www, preservação de query string, destino existente e ausência de loop. | Publicação e acesso à hospedagem/DNS do domínio para fazer o www alcançar o projeto. |
| 2 | Scripts inertes text/partytown substituídos pela inicialização padrão gtag, com carregamento assíncrono. ${tests.analytics.requests.length} page_view observados nas seis navegações verificadas. Integração Partytown removida da configuração e das dependências. | Conferir a propriedade GA4 em Tempo real/DebugView após publicar. Nos testes funcionais, os pedidos de coleta foram interceptados para não registrar as navegações de teste na propriedade. |
| 3 | O 404 informado, /massagista-em-campinas/, agora responde localmente com 301 para a página inicial, que responde 200. As duas URLs do blog normalizam para barra final sem loop. | Validar em produção e depois no GSC. A terceira URL de erro de redirecionamento ainda não foi enviada. |
| 4 | Retiradas as notas e contagens conflitantes de avaliações, os relatos sem fonte verificável e os schemas Review/AggregateRating. Home e página de avaliações apontam para a fonte original no Google. Retirados endereço detalhado, CEP e coordenadas não confirmados de entidades aninhadas. Corrigidas referências ao serviço removido nos metadados da home, serviços e catálogo estruturado. | Confirmar o total e os relatos autênticos antes de voltar a exibi-los. |
| 5 | Removidas alegações de prevenção de prostatite, redução de cortisol em 30%, efeitos hormonais, cura de bloqueios, controle de ejaculação e ausência de contraindicações. Removidas afirmações não confirmadas de certificação, especialização, tempo de experiência e 700+ clientes. A página sobre próstata ganhou enquadramento informativo e fonte de saúde. | Comprovação documental de formação e experiência para inserir essas informações novamente. Revisão qualificada de eventual conteúdo clínico futuro. |
| 6 | Retirado o preload da antiga imagem do hero das 28 páginas internas onde aparecia sem uso. Os dois preloads responsivos do hero atual foram preservados. | Repetir a conferência no domínio depois da publicação. |
| 7 | Logo responsivo com versões de 96 e 192 px; variantes de 480 e 800 px para 14 imagens secundárias, com srcset e sizes. Fontes atuais preservadas, com font-display: swap e preload das fontes realmente utilizadas. Lighthouse mobile do build de produção: performance ${Math.round(lighthouse.categories.performance.score * 100)}. | Comparação no domínio e dados de Core Web Vitals após publicação. |
| 8 | As 15 URLs únicas foram conferidas: todas retornam 200, constam no sitemap, não têm noindex e recebem ao menos um link interno. Os três H1 regionais passaram a informar claramente que o atendimento acontece no Cambuí. | Inspeção individual e recrawl no GSC; a ausência de bloqueio técnico não garante indexação. |
| 9 | Não foram feitas consolidações de URLs, mudanças de estratégia de palavras-chave ou criação de artigos nesta entrega. | Análise posterior de consulta × página e decisão editorial, conforme combinado. |

## Redirecionamentos informados pelo GSC

| URL | Produção observada hoje | Projeto corrigido |
| --- | --- | --- |
| /massagista-em-campinas/ | 404 | 301 → / → 200 |
| /blog/homens-casados-massagem-tantrica | 308 → versão com barra → 200 | 301 → versão com barra → 200 |
| /blog/massagem-prostatica-saude | 308 → versão com barra → 200 | 301 → versão com barra → 200 |

As duas URLs de blog já funcionam no site publicado na verificação de hoje. O erro listado no GSC pode refletir um rastreamento anterior; não foi observado loop atual nessas URLs. Um 308 permanente é válido e não precisa ser convertido em 301 para resolver SEO.

O domínio www responde 404 em HTTP e HTTPS. A conexão Cloudflare disponível não contém a zona karolmassagista.com.br nem um projeto Pages associado ao domínio. A regra de código está preparada, mas ela só terá efeito quando o hostname alcançar o projeto correto. Não houve alteração de DNS nem criação de projeto na conta errada.

O arquivo _redirects anterior misturava sintaxe Netlify (301!) e regra de domínio com Cloudflare Pages. O arquivo novo usa códigos numéricos e caminhos suportados. Regras de domínio ficam na Function; o arquivo estático também funciona quando as Functions não participam da entrega de uma rota. Conforme a [documentação do Cloudflare](https://developers.cloudflare.com/pages/configuration/redirects/), _redirects não se aplica a requisições atendidas por Functions.

## Peso medido no mobile

Medição em Chrome, viewport 375 × 812, escala 1, contexto novo por página, com rolagem para acionar imagens lazy. Valores correspondem à soma de encodedBodySize dos recursos do próprio site: imagens, CSS, fontes e JS local. Não incluem o HTML, o overhead da transferência, scripts externos nem o payload da tag Google. O GA4 passou a carregar nesta entrega e seu peso externo deve ser considerado na medição de produção.

| Página | Antes | Depois | Redução de recursos locais |
| --- | ---: | ---: | ---: |
${performance}

Logo original: 79.216 bytes. Versão de 96 px: 8.454 bytes (89,3% menor). Versão de 192 px: 26.602 bytes (66,4% menor). O navegador seleciona a versão adequada ao tamanho e à densidade da tela. As fotos originais foram preservadas para abertura em tamanho completo.

A estimativa anterior de 329 kB por visita referia-se ao arquivo observado no site publicado. Na versão local anterior desta entrega, o mesmo caminho de imagem já tinha um arquivo menor, de 20.374 bytes; por isso a redução medida localmente não deve ser confundida com a estimativa do domínio publicado.

Esses percentuais representam redução de bytes, não previsão de crescimento em tráfego ou posicionamento.

### Lighthouse mobile do build de produção

Medição em ${lighthouse.finalDisplayedUrl}, usando Lighthouse ${lighthouse.lighthouseVersion}, perfil mobile e throttling simulado. Esta é uma medição de laboratório da home, não um dado de usuários reais do domínio. A tag Google carregou no teste. O resultado automático não confirma indexação nem crescimento em rankings.

| Categoria | Nota |
| --- | ---: |
| Performance | ${Math.round(lighthouse.categories.performance.score * 100)} |
| SEO | ${Math.round(lighthouse.categories.seo.score * 100)} |
| Acessibilidade | ${Math.round(lighthouse.categories.accessibility.score * 100)} |
| Boas práticas | ${Math.round(lighthouse.categories['best-practices'].score * 100)} |

FCP: ${lighthouse.audits['first-contentful-paint'].displayValue}. LCP: ${lighthouse.audits['largest-contentful-paint'].displayValue}. TBT: ${lighthouse.audits['total-blocking-time'].displayValue}. CLS: ${lighthouse.audits['cumulative-layout-shift'].displayValue}.

Oportunidades residuais registradas pelo Lighthouse: contraste em alguns textos, CSS externo com economia estimada de 70 ms, seleção/tamanho de algumas imagens em maior densidade de tela e código não utilizado da tag Google. A meta de performance 90+ foi atendida na medição, preservando a composição visual atual.

## As 15 URLs descobertas sem indexação

| Caminho | HTTP publicado | HTTP local | Sitemap | Noindex | Páginas com link interno |
| --- | ---: | ---: | --- | --- | ---: |
${urls}

N/D em “último rastreamento” não comprova que uma página foi rejeitada por conteúdo. Mantive as URLs publicadas nesta etapa e registrei o inventário para revisão editorial posterior. Não criei redirecionamentos, noindex ou exclusões sem uma justificativa por página.

## Validações e arquivos de entrega

- Build de produção concluído: 32 arquivos de página, incluindo a página 404; 31 URLs públicas no sitemap.
- Validação de SEO: 31 páginas, zero erros. Verificadas canonicals, títulos e descrições sociais, um H1 por página, JSON-LD, recursos locais e variantes responsivas.
- ${tests.redirects.length} regras aprovadas na lógica compartilhada e no middleware Functions, incluindo GET/HEAD e query string. Três URLs exatas do GSC também testadas via HTTP no servidor local.
- Seis páginas sem overflow em 375 px; home sem overflow em 1440 px.
- Perguntas frequentes expande e recolhe; galeria conserva dez imagens, foto solicitada em sexto, movimento automático e botão manual.
- Schemas de FAQ que não correspondiam ao conteúdo visível foram retirados; o bloco de perguntas frequentes permanece acessível no HTML.
- Fontes e composição visual atuais da landing page preservadas.

Evidências: ${[['testes','tests.json'], ['URLs do GSC','gsc-urls.json'], ['antes','before.json'], ['depois','after.json'], ['mobile','home-mobile.png'], ['desktop','home-desktop.png'], ['avaliações','avaliacoes-mobile.png'], ['Lighthouse completo','lighthouse-producao-mobile.html']].map(([name,file]) => `[${name}](<${directory.replaceAll('\\', '/')}/${file}>)`).join(', ')}.

Código principal: config/redirects.mjs, scripts/generate-redirects.mjs, src/middleware.ts, functions/_middleware.js e src/lib/technical-seo.ts. Build: dist/. Para publicação via Cloudflare Pages, o build estático e as Functions precisam ser entregues pelo fluxo de deploy correto; não basta presumir que um upload só de dist incluirá functions/.

## Passos para encerrar em produção

1. Acessar a conta/projeto que hospeda karolmassagista.com.br e publicar a entrega revisada, incluindo Functions quando usadas no projeto.
2. Associar/corrigir o www e conferir seu redirecionamento preservando caminho e parâmetros.
3. Reexecutar os testes no domínio publicado, incluindo a ausência do preload antigo.
4. Conferir page_view no GA4 em Tempo real/DebugView e validar os erros resolvidos no GSC.
5. Inspecionar as 15 URLs individualmente no GSC, acompanhando rastreamento e indexação; uma solicitação não garante inclusão no índice.
6. Enviar a terceira URL de erro de redirecionamento e confirmar avaliações/formação quando esses dados estiverem disponíveis.

A inicialização do Analytics segue o [padrão gtag documentado pelo Google](https://developers.google.com/tag-platform/gtagjs/configure). A referência de saúde usada para corrigir o enquadramento do artigo é o [NIDDK/NIH](https://www.niddk.nih.gov/health-information/urologic-diseases/prostate-problems/prostatitis-inflammation-prostate).
`;
fs.writeFileSync(path.join(directory, 'resultado.md'), report);
console.log(path.join(directory, 'resultado.md'));
