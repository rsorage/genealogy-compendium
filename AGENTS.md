# Regras deste repositório

Este é o código-fonte de **genealogia.rsorage.com**, o compêndio genealógico das famílias
Sorage (Suraci) e Cardillo. É público; o acervo da pesquisa (`../family-research`) é privado e
**nunca** entra aqui — nem documento, nem ficha, nem caminho de arquivo. Entram só o código do
site e os dados já filtrados pelo exportador.

## Regras de publicação (decididas por Ramon no site anterior; valem aqui)

1. **Nenhum nome de pessoa viva.** Cortes por tipo de registro (26/10/2026): nascimentos e demais
   registros até **1925**; óbitos até **1955**, e só de quem comprovadamente nasceu até 1925.
   Ninguém nascido depois de 1925 é publicado. Exceção única registrada: Ronaldo van Putten de
   Vasconcelos, autor do livro da família Cardillo, pode ser nomeado e ter o livro linkado.
2. **Nenhuma imagem de documento** (14/10/2026). Só trechos transcritos e links para a imagem nos
   portais oficiais aceitos (`PORTAIS_ACEITOS` em `src/content.config.ts`). Cada arquivo tem suas
   regras: o FamilySearch proíbe republicar imagens; o arquivo diocesano de Reggio Calabria pede que
   as cópias não sejam divulgadas.
3. **Nenhum número de documento pessoal, nenhuma causa de morte.**
4. **Transcrição própria.** Não copiar índices do FamilySearch nem de terceiros. Grafias e sinais de
   dúvida («S[uraci?]») ficam como lidos; sobrenomes não são normalizados.
5. **Conclusão sem evidência não entra.** Toda afirmação publicada carrega a firmeza (`certa`,
   `provavel`, `declarada`, `hipotese`) e a base (o documento) — é o campo `base`/`documentos`
   dos esquemas. Jurisdição sempre a vigente na data do evento.
6. O histórico do git é permanente: um arquivo que entre aqui não sai mais. Na dúvida, não commitar.

Estas regras são aplicadas **duas vezes**: no exportador (`scripts/exportar-registros.py`) e nos
esquemas zod de `src/content.config.ts`, que derrubam o `astro build` se um dado as violar.

## Como o conteúdo chega aqui

```
acervo privado (CSV, YAML, fichas)  ──exportador──▶  src/content/*.json  ──astro build──▶  dist/
```

- `npm run exportar` lê o acervo (padrão `../family-research`, ou `--acervo /caminho`) e grava
  `src/content/registros-vistos/{nomes,paginas,meta}.json`. O relatório detalhado (exclusões e
  motivos) vai para o acervo, não para cá.
- `npm run exportar:verificar` confere se os JSON estão atualizados (sai com 1 se não).
- `npm run test:py` roda os testes do exportador (dados fictícios).
- `npm run build` valida e gera o site; `npm run check` faz a checagem de tipos.
- Ninguém edita `src/content/` à mão.

## Estado das vistas (06/11/2026)

| rota | estado | fonte |
|---|---|---|
| `/registros-vistos/` + `/registros-vistos/catalogo/…` | **real** | `01 Indice/registros-vistos/*.csv` via exportador |
| `/` (compêndio) | casca com texto gerado (ficção), `noindex` | — |
| `/arvore/` | casca com dados fictícios (`src/data/genealogyData.ts`), `noindex` | futuro: `persons.yaml` + grafo das fichas |
| `/documentos/` | casca com dados fictícios, `noindex`; o visualizador de imagem **não pode** ir ao ar | futuro: `indice-documentos.csv` + fichas |
| `/atlas/` | casca com rota fictícia, `noindex` | futuro: itinerário real com trechos tracejados para hipóteses; inclui os Vecchia |
| `/frentes/` | casca com dados fictícios, `noindex` | futuro: `BACKLOG.md` + fichas NEG + `03 Correspondencia` |

`src/types/genealogy.ts` e `src/data/*.ts` são o modelo e os dados **gerados pelo Gemini**: tudo
ali é inventado (Fortunato Suraci, Castelnuovo Cilento, vapores Italia e Caffaro, Hospedaria do
Brás, «Cardilho»…). Servem só para manter a casca de pé até cada vista ser ligada aos dados reais;
não corrigir ficção, substituir. As imagens em `public/imagens/` são stock, mantidas por enquanto a
pedido de Ramon; o «retrato de família» não é da família.

O modelo real está em `src/content.config.ts` (coleções `pessoas`, `documentos`, `frentes`,
`itinerario`, ainda vazias). Ao ligar uma vista, retirar o `naoIndexar` da página.

## Convenções

- Português do Brasil em tudo que o visitante lê; resumos em italiano e inglês virão como páginas
  próprias (como no site anterior: `/suraci/it/`, `/suraci/en/`).
- Páginas estáticas com URL própria; interatividade só onde faz diferença (busca, mapa), como ilha
  React. O que o Google precisa ler fica no HTML.
- Sem recursos externos: fontes servidas pelo site (`@fontsource`), nada do Google Fonts.
- Endereços já publicados não mudam. Os do site anterior que ainda precisam de destino quando este
  repositório substituir o atual: `/suraci/`, `/suraci/it/`, `/suraci/en/`, `/cardillo/` (+ `it`,
  `en`), `/historia/`, `/metodo/`, `/catasto-1749.html`.
- Depois de mudar UI: `npm run build`, abrir as páginas alteradas com Playwright em 375, 768 e
  1440 px, conferir overflow, console e rede.
