import { MigrationTimeline } from '../MigrationTimeline';
import { goTo } from '../../lib/navigation';

/** Migration atlas (still the generated placeholder, see AGENTS.md). */
export default function AtlasPage() {
  return <MigrationTimeline onSelectRecord={() => goTo('/documentos/')} />;
}
