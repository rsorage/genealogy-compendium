import { useEffect, useState } from 'react';
import { HistoricalRecordsViewer } from '../HistoricalRecordsViewer';
import { historicalRecordsDatabase } from '../../data/genealogyData';
import type { HistoricalRecord } from '../../types/genealogy';
import { irPara, parametroDaUrl } from '../../lib/navegacao';

/** Documentos. Abre `?registro=<id>` quando chega por link. */
export default function PaginaDocumentos() {
  const [inicial, setInicial] = useState<HistoricalRecord | null | undefined>(undefined);

  useEffect(() => {
    const id = parametroDaUrl('registro');
    setInicial(id ? historicalRecordsDatabase.find((r) => r.id === id) ?? null : null);
  }, []);

  // Espera ler a URL antes de montar, para que o registro pedido seja o inicial.
  if (inicial === undefined) return <div className="py-10" aria-busy="true" />;

  return (
    <HistoricalRecordsViewer
      initialRecord={inicial}
      onSelectPersonById={(id) => irPara(`/arvore/?pessoa=${encodeURIComponent(id)}`)}
    />
  );
}
