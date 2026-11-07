import { CompendiumOverview } from '../CompendiumOverview';
import { goTo } from '../../lib/navigation';

/** Home page. The content of this component is still the generated text (see AGENTS.md). */
export default function CompendiumPage() {
  return (
    <CompendiumOverview
      onNavigateToTree={() => goTo('/arvore/')}
      onNavigateToRecords={() => goTo('/documentos/')}
      onNavigateToRegistrosVistos={() => goTo('/registros-vistos/')}
      onNavigateToQuests={() => goTo('/frentes/')}
      onSelectRecord={() => goTo('/documentos/')}
    />
  );
}
