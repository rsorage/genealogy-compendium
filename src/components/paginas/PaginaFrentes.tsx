import { useState } from 'react';
import { ResearchQuestLog } from '../ResearchQuestLog';
import { LeadSubmissionModal } from '../LeadSubmissionModal';

/** Frentes de pesquisa, com o formulário de pista pré-preenchido com o código da frente. */
export default function PaginaFrentes() {
  const [frente, setFrente] = useState<string | undefined>(undefined);
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <ResearchQuestLog
        onOpenContactModal={(codigo) => {
          setFrente(codigo);
          setAberto(true);
        }}
      />
      <LeadSubmissionModal isOpen={aberto} onClose={() => setAberto(false)} presetQuestCode={frente} />
    </>
  );
}
