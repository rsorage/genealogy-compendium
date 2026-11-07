# genealogy-compendium

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
npm run export            # lê ../family-research e grava src/content/*.json e src/content/records/*.json
npm run export:check      # confere se os JSON estão atualizados
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
| `src/components/records/` | a vista Registros vistos (busca, listagens) |
| `src/components/persons/`, `tree/`, `documents/` | cartões, selos de firmeza, a ilha da árvore e a lista filtrável de documentos |
| `src/components/pages/` | os invólucros das vistas ainda ligadas aos dados fictícios |
| `src/components/*.tsx`, `src/data/`, `src/types/` | a casca gerada pelo Gemini, com dados de exemplo (ver AGENTS.md) |
| `src/lib/` | utilidades: navegação, lugares, rótulos de pessoas e documentos, agrupamento e endereços do catálogo |
| `scripts/export_records.py` | exportador dos registros vistos; `scripts/records/public-notes.json` são as notas revisadas |
| `scripts/export_persons_documents.py` | exportador de pessoas e documentos (persons.yaml + blocos YAML das fichas) |
| `tests/` | testes do exportador |
| `public/` | `CNAME`, `robots.txt`, favicon, imagem de compartilhamento, imagens |

## Convenção de idioma

Código em inglês — identificadores, nomes de arquivo, chaves dos JSON exportados, comentários, flags de linha de comando.
Em português fica só o que o visitante lê (textos das páginas, rótulos) e os endereços públicos (`/pessoas/`, `/arvore/`,
`/registros-vistos/dados/nomes.json`), que são conteúdo e não mudam. Os valores de vocabulário do acervo passam como
estão (`certain|stated|probable|doubtful`, `record_type`, graus de leitura).
