/**
 * Modelo de dados do site = contrato entre o acervo privado e as páginas públicas.
 *
 * Tudo em `src/content/` é GERADO pelo exportador (`scripts/exportar-registros.py`)
 * a partir do acervo; nada aqui é editado à mão. Os esquemas abaixo fazem duas coisas:
 *
 *  1. descrevem o formato (e geram os tipos TypeScript usados pelas páginas);
 *  2. são a GUARDA DE PRIVACIDADE no build: um dado fora das regras do site — ano
 *     além do corte, link fora dos portais oficiais, caminho de arquivo, número de
 *     documento pessoal — derruba o `astro build` em vez de ir para o ar.
 *
 * As regras de publicação estão em AGENTS.md e vieram do site anterior
 * (genealogia-website), decididas por Ramon em 14/10 e 26/10/2026.
 */
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

// ---------------------------------------------------------------- cortes e portais

/** Nascimentos e demais registros: 100 anos. */
export const CORTE_GERAL = 1925;
/** Óbitos: 70 anos, desde que a pessoa tenha nascido até 1925. */
export const CORTE_OBITOS = 1955;

/** Só se publica link para imagem em portal oficial, e só nestes caminhos. */
export const PORTAIS_ACEITOS: Record<string, { rotulo: string; prefixos: string[] }> = {
  'www.familysearch.org': { rotulo: 'FamilySearch', prefixos: ['/ark:/61903/', '/search/film/'] },
  'antenati.cultura.gov.it': { rotulo: 'Portale Antenati', prefixos: ['/ark:/'] },
  'www.archiviodiocesanoreggiobova.it': {
    rotulo: 'Arquivo Diocesano de Reggio Calabria–Bova',
    prefixos: ['/photo_details/', '/wp-content/uploads/wp_photo_seller/', '/consultazione-registri-parrocchiali/'],
  },
  'www.gazzettaufficiale.it': { rotulo: 'Gazzetta Ufficiale', prefixos: ['/eli/'] },
};

// ---------------------------------------------------------------- guardas elementares

/** Padrões que nunca podem aparecer num campo publicado (a mesma varredura do exportador). */
const PRIVADO = /(?:\/Users\/|\/home\/|file:\/\/|\b(?:CPF|RG)\s*[:=]|\d{3}\.\d{3}\.\d{3}-\d{2})/i;

/** Texto livre que vai para a página: sem caminhos locais nem identificadores pessoais. */
export const textoPublico = z.string().refine((v) => !PRIVADO.test(v), {
  message: 'campo contém caminho local ou identificador pessoal; revisar a linha no acervo',
});

/** URL de imagem num portal oficial aceito. */
export const urlPortal = z
  .string()
  .url()
  .refine(
    (v) => {
      try {
        const u = new URL(v);
        const portal = PORTAIS_ACEITOS[u.hostname];
        return u.protocol === 'https:' && !!portal && portal.prefixos.some((p) => u.pathname.startsWith(p));
      } catch {
        return false;
      }
    },
    { message: 'link fora dos portais oficiais aceitos' },
  );

export const Firmeza = z.enum(['certa', 'provavel', 'declarada', 'hipotese']);
export const Leitura = z.string().regex(/^(certa|provável|duvidosa)(?:$| \()/, 'grau de leitura não reconhecido');
export const Linha = z.enum(['suraci', 'cardillo', 'marsicano', 'vecchia', 'rede']);

const anoPublicavel = z.number().int().min(1000).max(CORTE_OBITOS);

/** Um intervalo [inicio, fim] respeita o corte do seu tipo. */
function dentroDoCorte(d: { inicio: number; fim: number; tipo: string }): boolean {
  const limite = d.tipo === 'Óbitos' ? CORTE_OBITOS : CORTE_GERAL;
  return d.inicio <= d.fim && d.fim <= limite;
}

// ---------------------------------------------------------------- registros vistos (REAL)

/**
 * Uma ocorrência: um nome lido numa imagem de livro, com o papel que exerce no ato.
 * Vem de `01 Indice/registros-vistos/linhas-transcritas.csv`, já filtrado pelo exportador.
 */
const registrosNomes = defineCollection({
  loader: file('src/content/registros-vistos/nomes.json'),
  schema: z
    .object({
      id: z.string().regex(/^L-\d+$/),
      nome: textoPublico.min(1),
      sobrenome: textoPublico,
      pai: textoPublico,
      mae: textoPublico,
      conjuge_nome: textoPublico,
      conjuge_sobrenome: textoPublico,
      comune: textoPublico.min(1),
      serie: textoPublico.min(1),
      ano: textoPublico,
      parte: textoPublico,
      num_atto: textoPublico,
      data_evento: textoPublico,
      imagem: textoPublico,
      papel: textoPublico,
      papeis: z.array(textoPublico).min(1),
      leitura: Leitura,
      conferencia: textoPublico,
      nota: textoPublico,
      url: urlPortal,
      portal: textoPublico,
      url_alternativa: urlPortal.optional(),
      portal_alternativo: textoPublico.optional(),
      inicio: anoPublicavel,
      fim: anoPublicavel,
      tipo: textoPublico,
      ato_id: z.string().regex(/^(A-[a-f0-9]{16})?$/),
      paginas: z.array(z.string().regex(/^P-[a-f0-9]{16}$/)),
    })
    .strict()
    .refine(dentroDoCorte, { message: 'ocorrência fora do corte de publicação do seu tipo' }),
});

/**
 * Uma página consultada: uma imagem aberta num portal, com a cobertura da leitura.
 * Vem de `mapa-imagens.csv`. A descrição é estrutural (sem nomes copiados do campo livre).
 */
const registrosPaginas = defineCollection({
  loader: file('src/content/registros-vistos/paginas.json'),
  schema: z
    .object({
      id: z.string().regex(/^P-[a-f0-9]{16}$/),
      comune: textoPublico.min(1),
      serie: textoPublico.min(1),
      ano: textoPublico,
      parte: textoPublico,
      imagem: textoPublico,
      colecao: textoPublico,
      volume_ou_waypoint: textoPublico,
      dgs_ou_manifest: textoPublico,
      paginas_impressas: textoPublico,
      cobertura: z.enum(['lida inteira', 'procurada', 'cabeçalho']),
      coberturas: z.array(z.enum(['lida inteira', 'procurada', 'cabeçalho'])).min(1),
      url: urlPortal,
      portal: textoPublico,
      inicio: anoPublicavel,
      fim: anoPublicavel,
      tipo: textoPublico,
      descricao: textoPublico,
      consultado_em: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
      anotacoes: z.number().int().min(1),
      nomes_transcritos: z.number().int().min(0),
    })
    .strict()
    .refine(dentroDoCorte, { message: 'página fora do corte de publicação do seu tipo' }),
});

/** Metadados da exportação (cortes vigentes, data da última consulta). */
const exportacao = defineCollection({
  loader: file('src/content/registros-vistos/meta.json'),
  schema: z
    .object({
      versao: z.literal(1),
      cortes: z.object({
        nascimentos_e_demais: z.literal(CORTE_GERAL),
        obitos: z.literal(CORTE_OBITOS),
        nascidos_ate: z.literal(CORTE_GERAL),
      }),
      ultima_consulta: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),
      gerado_em: z.string(),
      totais: z.object({ nomes: z.number().int(), paginas: z.number().int() }),
    })
    .strict(),
});

// ---------------------------------------------------------------- próximas fases (CONTRATO)
// Esquemas definidos agora para fixar o formato; os arquivos ainda estão vazios ([]).
// Serão preenchidos por módulos do exportador nas fases Pessoas/Documentos, Frentes e Atlas.

/** Referência a um documento do acervo pelo seu id público (IT-SOR-001, BR-CAR-004, NEG-018…). */
const idDocumento = z.string().regex(/^(IT|BR|UY|US)-[A-Z]{3}-\d{3}[a-z]?$|^NEG-\d{3}$/);

/** Uma data como o acervo a escreve: ISO completa, só o ano, aproximada («~1736») ou janela («1802-09-19/1816-02-14»). */
const dataAcervo = z.string().regex(/^(~?\d{4}(-\d{2}(-\d{2})?)?|\d{4}(-\d{2}(-\d{2})?)?\/\d{4}(-\d{2}(-\d{2})?)?|<\d{4}(-\d{2}(-\d{2})?)?|>\d{4}(-\d{2}(-\d{2})?)?)$/);

function anoDe(data: string): number | null {
  const m = data.match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}

/** Um fato datado com a firmeza e a base que o sustentam — a regra do acervo: conclusão sem evidência não entra. */
const evento = z
  .object({
    data: dataAcervo.optional(),
    lugar: textoPublico.optional(),
    /** Jurisdição vigente NA DATA do evento (regra de 14/09/2026), não a atual. */
    jurisdicao: textoPublico.optional(),
    firmeza: Firmeza,
    base: textoPublico.min(1),
    documentos: z.array(idDocumento),
  })
  .strict();

/** Aresta do grafo de evidências: quem é pai, mãe ou cônjuge de quem, segundo qual ato. */
const relacao = z
  .object({
    tipo: z.enum(['pai', 'mae', 'conjuge']),
    pessoa: z.string().regex(/^P-[a-z0-9-]+$/),
    firmeza: Firmeza,
    documentos: z.array(idDocumento).min(1),
    justificativa: textoPublico.optional(),
  })
  .strict();

const pessoas = defineCollection({
  loader: file('src/content/pessoas.json'),
  schema: z
    .object({
      id: z.string().regex(/^P-[a-z0-9-]+$/),
      nome_exibicao: textoPublico.min(1),
      nomes_alternativos: z.array(textoPublico),
      sexo: z.enum(['M', 'F', '?']),
      linha: Linha,
      nascimento: evento.optional(),
      morte: evento.optional(),
      ocupacao: textoPublico.optional(),
      familysearch: z.string().regex(/^[A-Z0-9]{4}-[A-Z0-9]{3}$/).optional(),
      resumo: textoPublico,
      relacoes: z.array(relacao),
    })
    .strict()
    // Ninguém nascido depois de 1925 é publicado; sem data de nascimento, a pessoa só entra
    // se tiver morte documentada (o exportador decide; aqui é a última barreira).
    .refine((p) => !p.nascimento?.data || (anoDe(p.nascimento.data) ?? 0) <= CORTE_GERAL, {
      message: 'pessoa nascida depois do corte de 1925',
    })
    .refine((p) => p.nascimento?.data || p.morte?.data, { message: 'pessoa sem nenhuma data: impossível aplicar o corte' }),
});

/** Nota de leitura paleográfica: a palavra, como se leu, e o CONTROLE que testou a leitura. */
const notaLeitura = z
  .object({
    termo: textoPublico.min(1),
    leitura: textoPublico.min(1),
    controle: textoPublico.optional(),
    nota: textoPublico,
  })
  .strict();

const documentos = defineCollection({
  loader: file('src/content/documentos.json'),
  schema: z
    .object({
      id: idDocumento,
      titulo: textoPublico.min(1),
      tipo: z.enum([
        'nascita', 'battesimo', 'matrimonio', 'pubblicazioni', 'processetti', 'morte', 'sepoltura',
        'catasto', 'stato_delle_anime', 'lista_di_leva', 'cittadinanza',
        'nascimento', 'casamento', 'obito', 'hospedaria', 'lista_de_bordo', 'certidao', 'correspondencia', 'outro',
      ]),
      data_documento: dataAcervo,
      lugar: textoPublico.min(1),
      jurisdicao: textoPublico.optional(),
      repositorio: textoPublico.min(1),
      referencia: textoPublico,
      /** Link para a imagem no portal oficial; vazio quando o documento veio por correspondência. */
      url: urlPortal.optional(),
      pessoas: z.array(z.string().regex(/^P-[a-z0-9-]+$/)),
      resumo: textoPublico,
      /** Só trechos transcritos — nenhuma imagem é publicada (regra de 14/10/2026). */
      trechos: z.array(
        z.object({ original: textoPublico.min(1), traducao: textoPublico.optional(), nota: textoPublico.optional() }).strict(),
      ),
      notas_leitura: z.array(notaLeitura),
    })
    .strict()
    .refine((d) => (anoDe(d.data_documento) ?? 0) <= (d.tipo === 'morte' || d.tipo === 'obito' || d.tipo === 'sepoltura' ? CORTE_OBITOS : CORTE_GERAL), {
      message: 'documento fora do corte de publicação do seu tipo',
    }),
});

const frentes = defineCollection({
  loader: file('src/content/frentes.json'),
  schema: z
    .object({
      id: z.string().regex(/^[A-Z]\d+(\.\d+)?$/),
      linha: Linha,
      titulo: textoPublico.min(1),
      estado: z.enum(['resolvida', 'em_andamento', 'aguardando_arquivo', 'muro']),
      pessoa_alvo: z.string().regex(/^P-[a-z0-9-]+$/).optional(),
      comune: textoPublico.optional(),
      hipotese: textoPublico,
      achados: textoPublico,
      consultas: z.array(
        z
          .object({
            instituicao: textoPublico.min(1),
            data: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
            estado: z.enum(['enviado', 'em_busca', 'documento_encontrado', 'certidao_negativa', 'sem_resposta']),
          })
          .strict(),
      ),
      buscas_negativas: z.array(z.string().regex(/^NEG-\d{3}$/)),
      proximos_passos: textoPublico,
      atualizado_em: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .strict(),
});

const itinerario = defineCollection({
  loader: file('src/content/itinerario.json'),
  schema: z
    .object({
      id: z.string().regex(/^E-[a-z0-9-]+$/),
      linha: Linha,
      ordem: z.number().int().min(1),
      periodo: textoPublico.min(1),
      titulo: textoPublico.min(1),
      lugar: textoPublico.min(1),
      coordenadas: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }).strict(),
      /** O mapa desenha traço cheio o documentado e tracejado o resto. */
      firmeza: z.enum(['documentado', 'provavel', 'hipotese']),
      narrativa: textoPublico,
      documentos: z.array(idDocumento),
      contexto_historico: textoPublico.optional(),
    })
    .strict(),
});

export const collections = {
  registrosNomes,
  registrosPaginas,
  exportacao,
  pessoas,
  documentos,
  frentes,
  itinerario,
};
