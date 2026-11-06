import React, { useEffect, useState } from 'react';
import { FamilyTreeExplorer } from '../FamilyTreeExplorer';
import { AncestorDossierModal } from '../AncestorDossierModal';
import { peopleDatabase } from '../../data/genealogyData';
import type { Person } from '../../types/genealogy';
import { irPara, parametroDaUrl } from '../../lib/navegacao';

/** Árvores de linhagem. Abre o dossiê de `?pessoa=<id>` quando chega por link. */
export default function PaginaArvore() {
  const [selecionada, setSelecionada] = useState<Person | null>(null);

  useEffect(() => {
    const id = parametroDaUrl('pessoa');
    if (id) setSelecionada(peopleDatabase.find((p) => p.id === id) ?? null);
  }, []);

  const selecionarPorId = (id: string) => {
    const pessoa = peopleDatabase.find((p) => p.id === id);
    if (pessoa) setSelecionada(pessoa);
  };

  return (
    <>
      <FamilyTreeExplorer onSelectPerson={setSelecionada} />
      <AncestorDossierModal
        person={selecionada}
        onClose={() => setSelecionada(null)}
        onSelectPersonById={selecionarPorId}
        onSelectRecord={(r) => irPara(`/documentos/?registro=${encodeURIComponent(r.id)}`)}
      />
    </>
  );
}
