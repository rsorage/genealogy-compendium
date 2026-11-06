import React from 'react';
import { MigrationTimeline } from '../MigrationTimeline';
import { irPara } from '../../lib/navegacao';

/** Atlas da migração. */
export default function PaginaAtlas() {
  return <MigrationTimeline onSelectRecord={(r) => irPara(`/documentos/?registro=${encodeURIComponent(r.id)}`)} />;
}
