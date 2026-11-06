# genealogia-compendium

Código-fonte de **https://genealogia.rsorage.com** — o compêndio genealógico das famílias
**Sorage** (Suraci, de Laganadi, na Calábria) e **Cardillo** (de Battaglia di Casaletto Spartano,
na província de Salerno), imigrantes italianos em Carangola e Patrocínio do Muriaé, Minas Gerais.

Site estático gerado com [Astro](https://astro.build): cada pessoa, documento e recorte do catálogo
tem endereço próprio; a busca e o mapa são ilhas React. O conteúdo vem de um acervo privado por um
exportador que aplica as regras de publicação; o build valida tudo de novo antes de gerar as páginas.
As regras estão em [`AGENTS.md`](AGENTS.md).

## Desenvolvimento

```bash
npm install
npm run exportar          # lê ../family-research e grava src/content/registros-vistos/*.json
npm run dev               # http://localhost:4321
npm run build && npm run preview
npm run check             # tipos
npm run test:py           # testes do exportador
```

## Estrutura

| caminho | o que é |
|---|---|
| `src/pages/` | as rotas: `/`, `/pessoas/` (+ uma por pessoa), `/arvore/`, `/registros-vistos/` (+ `catalogo/…` e `dados/*.json`), `/documentos/` (+ uma por documento), `/busca/indice.json`, `/atlas/`, `/frentes/` |
| `src/content.config.ts` | o modelo de dados e as guardas de privacidade (zod) |
| `src/content/` | dados gerados pelo exportador — não editar à mão |
| `src/components/site/` | cabeçalho, rodapé e ações (busca, pista) |
| `src/components/registros/` | a vista Registros vistos (busca, listagens, páginas do catálogo) |
| `src/components/pessoas/`, `arvore/`, `documentos/` | cartões, selos de firmeza, a ilha da árvore e a lista filtrável de documentos |
| `src/components/paginas/` | os invólucros das vistas ainda ligadas aos dados fictícios |
| `src/components/*.tsx`, `src/data/`, `src/types/` | a casca gerada pelo Gemini, com dados de exemplo (ver AGENTS.md) |
| `src/lib/` | utilidades: navegação, agrupamento e endereços do catálogo |
| `scripts/exportar-registros.py` | exportador dos registros vistos; `scripts/registros-vistos/notas-publicas.json` são as notas revisadas |
| `scripts/exportar-pessoas-documentos.py` | exportador de pessoas e documentos (persons.yaml + blocos YAML das fichas) |
| `tests/` | testes do exportador |
| `public/` | `CNAME`, `robots.txt`, favicon, imagem de compartilhamento, imagens |
