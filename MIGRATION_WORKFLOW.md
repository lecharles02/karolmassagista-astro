# Migracao Incremental para Componentes

Esta base foi reconstruida em modo 1:1 para preservar SEO.

Para evitar risco, a refatoracao para componentes deve ser feita pagina por pagina.

## Fluxo recomendado

1. Escolha uma rota.
2. Execute o script de extracao:
   - `node scripts/extract-page.mjs /depoimentos/`
3. Rode build:
   - `npm run build`
4. Compare a saida da rota no preview.
5. Se estiver OK, siga para a proxima rota.

## Rotas sugeridas para comecar

- /depoimentos/
- /galeria/
- /sobre-karol-massagista/

Depois avance para paginas de servico e, por ultimo, home e blog.

## Regra de seguranca SEO

- Nao alterar URL, canonical, title, description e JSON-LD na mesma etapa da extracao estrutural.
- Sempre validar build antes de commitar.
