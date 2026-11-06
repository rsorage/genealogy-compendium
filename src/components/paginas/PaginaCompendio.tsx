import { CompendiumOverview } from '../CompendiumOverview';
import { irPara } from '../../lib/navegacao';

/** Página inicial. O conteúdo deste componente ainda é o texto gerado (ver AGENTS.md). */
export default function PaginaCompendio() {
  return (
    <CompendiumOverview
      onNavigateToTree={() => irPara('/arvore/')}
      onNavigateToRecords={() => irPara('/documentos/')}
      onNavigateToRegistrosVistos={() => irPara('/registros-vistos/')}
      onNavigateToQuests={() => irPara('/frentes/')}
      onSelectRecord={() => irPara('/documentos/')}
    />
  );
}
