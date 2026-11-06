import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  FileText,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Download,
  Mail,
  ChevronRight,
  Info,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
} from 'lucide-react';
import { consultedRecordsDatabase } from '../data/consultedRecordsData';
import { ConsultedRecord, RecordCertaintyDegree, ConsultedRecordType } from '../types/genealogy';
import { HistoricalRecord } from '../types/genealogy';
import { historicalRecordsDatabase } from '../data/genealogyData';

interface RegistrosVistosViewProps {
  onSelectFacsimileRecord?: (record: HistoricalRecord) => void;
  onOpenContactModal: (presetQuery?: string) => void;
}

export const RegistrosVistosView: React.FC<RegistrosVistosViewProps> = ({
  onSelectFacsimileRecord,
  onOpenContactModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'suraci' | 'cardillo' | 'allied'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCertainty, setSelectedCertainty] = useState<string>('all');
  const [selectedCommune, setSelectedCommune] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Communes list for dropdown
  const availableCommunes = useMemo(() => {
    const set = new Set<string>();
    consultedRecordsDatabase.forEach((r) => set.add(r.commune.split('/')[0].trim()));
    return Array.from(set).sort();
  }, []);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return consultedRecordsDatabase.filter((rec) => {
      // Branch filter
      if (selectedBranch !== 'all') {
        if (selectedBranch === 'suraci' && rec.branch !== 'suraci' && rec.branch !== 'both') return false;
        if (selectedBranch === 'cardillo' && rec.branch !== 'cardillo' && rec.branch !== 'both') return false;
        if (selectedBranch === 'allied' && rec.branch !== 'allied') return false;
      }

      // Record Type filter
      if (selectedType !== 'all' && rec.recordType !== selectedType) {
        return false;
      }

      // Certainty filter
      if (selectedCertainty !== 'all' && rec.certaintyDegree !== selectedCertainty) {
        return false;
      }

      // Commune filter
      if (selectedCommune !== 'all' && !rec.commune.toLowerCase().includes(selectedCommune.toLowerCase())) {
        return false;
      }

      // Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = rec.personName.toLowerCase().includes(q);
        const matchSurname = rec.surnameVariant.toLowerCase().includes(q);
        const matchCommune = rec.commune.toLowerCase().includes(q);
        const matchRepo = rec.sourceRepository.toLowerCase().includes(q);
        const matchNotes = rec.researcherNotes.toLowerCase().includes(q);
        const matchYear = rec.year.toString().includes(q);
        const matchParents = (rec.fatherName || '').toLowerCase().includes(q) || (rec.motherName || '').toLowerCase().includes(q);
        const matchWitness = (rec.witnesses || '').toLowerCase().includes(q);

        if (!matchName && !matchSurname && !matchCommune && !matchRepo && !matchNotes && !matchYear && !matchParents && !matchWitness) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedBranch, selectedType, selectedCertainty, selectedCommune]);

  const handleCopyCitation = (rec: ConsultedRecord) => {
    const citation = `${rec.personName} (${rec.year}), ${rec.recordType.toUpperCase()}. ${rec.commune}, ${rec.provinceOrState}. Fonte: ${rec.sourceRepository}, ${rec.callNumber || 's/n'}.`;
    navigator.clipboard.writeText(citation);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Nome / Ato', 'Sobrenome', 'Ano', 'Data', 'Tipo', 'Comuna', 'Grau de Certeza', 'Repositório / Fonte', 'Chamada / Livro', 'Anotações'];
    const rows = filteredRecords.map((r) => [
      `"${r.personName.replace(/"/g, '""')}"`,
      `"${r.surnameVariant}"`,
      r.year,
      `"${r.exactDate || ''}"`,
      `"${r.recordType}"`,
      `"${r.commune}"`,
      `"${r.certaintyDegree}"`,
      `"${r.sourceRepository.replace(/"/g, '""')}"`,
      `"${(r.callNumber || '').replace(/"/g, '""')}"`,
      `"${r.researcherNotes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registros_vistos_sorage_cardillo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCertaintyBadge = (degree: RecordCertaintyDegree) => {
    switch (degree) {
      case 'documentado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Documentado
          </span>
        );
      case 'muito_provavel':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-teal-800">
            <Check className="w-3.5 h-3.5 text-teal-600" />
            Muito Provável
          </span>
        );
      case 'hipotese':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-amber-800">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Hipótese em Estudo
          </span>
        );
      case 'em_aberto':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-blue-800">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Em Aberto
          </span>
        );
      case 'busca_negativa':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-stone-600">
            <XCircle className="w-3.5 h-3.5 text-stone-500" />
            Busca Negativa (Verificado)
          </span>
        );
    }
  };

  const getRecordTypeLabel = (type: ConsultedRecordType) => {
    switch (type) {
      case 'nascimento':
        return 'Nascimento / Nascita';
      case 'matrimonio':
        return 'Casamento / Matrimonio';
      case 'obito':
        return 'Óbito / Morte';
      case 'batismo':
        return 'Batismo Paroquial';
      case 'hospedaria':
        return 'Hospedaria / Matrícula';
      case 'passaporte':
        return 'Lista de Bordo / Passaporte';
      case 'militar':
        return 'Leva Militar / Terras';
      case 'busca_negativa':
        return 'Pesquisa Negativa';
    }
  };

  return (
    <div className="space-y-10 py-6">
      {/* Title & Curatorial Subtitle */}
      <div className="border-b border-[#E7E2D8] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#8C3A27] mb-1">
            Acervo Público de Pesquisa Genealógica
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#1C1917]">
            Registros Vistos &amp; Fontes Consultadas
          </h1>
          <p className="font-editorial text-sm sm:text-base text-[#57534E] mt-1 max-w-2xl">
            Catálogo aberto de cada documento civil, livro paroquial, matrícula de imigração e busca negativa examinados durante a pesquisa das famílias Sorage (Suraci) e Cardillo.
          </p>
        </div>

        {/* Action Controls: Export CSV & Lead */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] bg-white hover:bg-[#F3EFE6] border border-[#D6CEBE] rounded-md transition-colors cursor-pointer shadow-2xs"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => onOpenContactModal('Registros Vistos Inquiry')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors cursor-pointer shadow-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Solicitar Cópia / Informação</span>
          </button>
        </div>
      </div>

      {/* Methodological Context Banner (Inspiração: genealogia.rsorage.com) */}
      <div className="bg-[#FAF7F0] border border-[#E5DFD3] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-sans uppercase tracking-widest font-semibold text-[#8C3A27] flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Por que mantemos o registro de cada documento visto?</span>
          </div>
          <span className="text-[11px] font-mono text-[#78716C]">Metodologia Genealógica Aberta</span>
        </div>
        <p className="font-editorial text-xs sm:text-sm text-[#44403C] leading-relaxed">
          Em pesquisas sérias nos arquivos de Estado da Calábria (como o <strong>Archivio di Stato di Reggio Calabria</strong>, com destaque para a comuna de <strong>Laganadi</strong>), de Salerno (<strong>Castelnuovo Cilento</strong>) e de São Paulo, folheamos milhares de páginas. Manter este índice público permite que outros pesquisadores encontrem ramos colaterais e evita retrabalho registrando inclusive <strong>buscas negativas</strong> (anos folheados termo a termo onde comprovadamente o registro não consta).
        </p>
        <div className="pt-2 border-t border-[#E8E1D5] flex flex-wrap items-center gap-4 text-xs font-sans text-[#78716C]">
          <div><strong className="text-[#1C1917]">{consultedRecordsDatabase.length}</strong> Registros Catalogados</div>
          <span aria-hidden="true">·</span>
          <div><strong className="text-[#8C3A27]">Laganadi (RC)</strong> &amp; <strong className="text-[#2B6CB0]">Castelnuovo Cilento (SA)</strong></div>
          <span aria-hidden="true">·</span>
          <div>Graus de Certeza Rigorosos</div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-[#E7E2D8] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Full-text Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C3A27] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, sobrenome (Suraci, Sorage, Cardillo, Morabito), comuna (Laganadi, Mooca), ano, ou fonte..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#D6CEBE] bg-[#FAF8F5] text-xs sm:text-sm font-sans text-[#1C1917] focus:outline-none focus:border-[#8C3A27] focus:bg-white transition-all placeholder:text-[#A8A29E]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-sans">
          {/* Family Branch */}
          <div>
            <label className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">
              Família / Ramo
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
            >
              <option value="all">Todas as Famílias</option>
              <option value="suraci">Suraci / Sorage (Laganadi &amp; Calábria)</option>
              <option value="cardillo">Cardillo / Cardilo (Cilento &amp; Campânia)</option>
              <option value="allied">Famílias Aliadas (Morabito, Minniti, Esposito)</option>
            </select>
          </div>

          {/* Record Type */}
          <div>
            <label className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">
              Tipo de Documento
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
            >
              <option value="all">Todos os Tipos de Atos</option>
              <option value="nascimento">Nascimentos / Nati</option>
              <option value="matrimonio">Casamentos / Matrimoni</option>
              <option value="obito">Óbitos / Morti</option>
              <option value="batismo">Batismos Paroquiais</option>
              <option value="hospedaria">Hospedaria dos Imigrantes</option>
              <option value="passaporte">Listas de Bordo / Passaportes</option>
              <option value="militar">Leva Militar / Terras</option>
              <option value="busca_negativa">Buscas Negativas (Verificado)</option>
            </select>
          </div>

          {/* Certainty Degree */}
          <div>
            <label className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">
              Grau de Certeza
            </label>
            <select
              value={selectedCertainty}
              onChange={(e) => setSelectedCertainty(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
            >
              <option value="all">Todos os Graus</option>
              <option value="documentado">Documentado (Ancestral Direto)</option>
              <option value="muito_provavel">Muito Provável</option>
              <option value="hipotese">Hipótese em Estudo</option>
              <option value="busca_negativa">Busca Negativa (Verificado)</option>
            </select>
          </div>

          {/* Localidade / Comuna */}
          <div>
            <label className="block text-[11px] font-semibold text-[#57534E] uppercase tracking-wider mb-1">
              Comuna / Localidade
            </label>
            <select
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
            >
              <option value="all">Todas as Comunas</option>
              {availableCommunes.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Reset */}
        {(searchQuery || selectedBranch !== 'all' || selectedType !== 'all' || selectedCertainty !== 'all' || selectedCommune !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs">
            <span className="text-[#57534E]">
              Filtrando: <strong className="text-[#1C1917]">{filteredRecords.length}</strong> documentos encontrados
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('all');
                setSelectedType('all');
                setSelectedCertainty('all');
                setSelectedCommune('all');
              }}
              className="text-[#8C3A27] hover:underline font-semibold cursor-pointer"
            >
              Redefinir Filtros
            </button>
          </div>
        )}
      </div>

      {/* RESULTS COUNT & LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-sans text-[#78716C] px-1">
          <span>
            Exibindo <span className="font-mono font-semibold text-[#1C1917]">{filteredRecords.length}</span> registros arquivísticos
          </span>
          <span className="hidden sm:inline">Clique no registro para expandir transcrição e notas paleográficas</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-[#E7E2D8] rounded-xl p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-[#D6CEBE] mx-auto" />
            <h3 className="font-display text-lg font-semibold text-[#1C1917]">
              Nenhum registro encontrado para estes critérios
            </h3>
            <p className="font-editorial text-xs text-[#57534E] max-w-md mx-auto">
              Tente ampliar sua busca removendo filtros de localidade ou termos específicos. Você também pode enviar uma solicitação diretamente para o pesquisador.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('all');
                setSelectedType('all');
                setSelectedCertainty('all');
                setSelectedCommune('all');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#8C3A27] bg-[#FAF3F0] hover:bg-[#F5E8E4] rounded-md transition-colors cursor-pointer"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const isExpanded = expandedRecordId === record.id;
              const hasFacsimile = record.hasFacsimileAttached;

              return (
                <div
                  key={record.id}
                  className={`bg-white border transition-all rounded-xl overflow-hidden ${
                    isExpanded
                      ? 'border-[#8C3A27] shadow-sm'
                      : 'border-[#E7E2D8] hover:border-[#D6CEBE]'
                  }`}
                >
                  {/* Top Bar Summary Row (Clickable) */}
                  <div
                    onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-[#78716C]">
                        {renderCertaintyBadge(record.certaintyDegree)}
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#1C1917]">
                          {getRecordTypeLabel(record.recordType)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[#8C3A27] font-semibold">
                          {record.year}
                        </span>
                        {record.exactDate && (
                          <span className="text-[#A8A29E]">({record.exactDate})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg sm:text-xl font-semibold text-[#1C1917] truncate">
                          {record.personName}
                        </h3>
                        <span className="text-xs font-sans font-medium px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E7E0D2] text-[#57534E] shrink-0">
                          {record.familyRole}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E] font-sans">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8C3A27]" />
                          <span>{record.commune}, {record.provinceOrState}</span>
                        </span>
                        <span aria-hidden="true" className="text-[#D6CEBE]">/</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#A8A29E]" />
                          <span className="truncate max-w-[260px]">{record.sourceRepository}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right Action Affordances */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F2ECE1]">
                      {hasFacsimile && onSelectFacsimileRecord && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const fac = historicalRecordsDatabase.find(
                              (h) => h.id === record.facsimileRecordId
                            ) || historicalRecordsDatabase[0];
                            onSelectFacsimileRecord(fac);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#8C3A27] hover:bg-[#FAF3F0] rounded border border-[#E8D9CE] transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Ver fac-símile original de alta resolução"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Ver Fac-símile</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCitation(record);
                        }}
                        className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded transition-colors cursor-pointer"
                        title="Copiar citação formatada"
                      >
                        {copiedId === record.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <ChevronRight
                        className={`w-4 h-4 text-[#A8A29E] transition-transform ${
                          isExpanded ? 'rotate-90 text-[#8C3A27]' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Detail Drawer */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-[#F2ECE1] bg-[#FAF8F5] space-y-4 text-xs font-sans animate-fade-in">
                      {/* Call number & Repository strip */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                        <div className="space-y-1">
                          <span className="font-semibold text-[#57534E] uppercase tracking-wider text-[10px] block">
                            Repositório &amp; Fonte Primária:
                          </span>
                          <p className="text-[#1C1917] font-medium">{record.sourceRepository}</p>
                          {record.callNumber && (
                            <p className="font-mono text-[11px] text-[#8C3A27]">
                              Referência / Cota: {record.callNumber}
                            </p>
                          )}
                        </div>

                        {/* Parents / Witnesses */}
                        <div className="space-y-1">
                          <span className="font-semibold text-[#57534E] uppercase tracking-wider text-[10px] block">
                            Filiação e Envolvidos:
                          </span>
                          {record.fatherName && (
                            <p className="text-[#44403C]">
                              <strong className="text-[#1C1917]">Pai:</strong> {record.fatherName}
                            </p>
                          )}
                          {record.motherName && (
                            <p className="text-[#44403C]">
                              <strong className="text-[#1C1917]">Mãe:</strong> {record.motherName}
                            </p>
                          )}
                          {record.spouseName && (
                            <p className="text-[#44403C]">
                              <strong className="text-[#1C1917]">Cônjuge:</strong> {record.spouseName}
                            </p>
                          )}
                          {record.witnesses && (
                            <p className="text-[#78716C] text-[11px]">
                              <strong>Testemunhas:</strong> {record.witnesses}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Researcher's Analysis Notes */}
                      <div className="space-y-1 bg-white p-3.5 rounded-lg border border-[#E7E0D2]">
                        <span className="font-semibold text-[#8C3A27] uppercase tracking-wider text-[10px] block">
                          Anotações do Pesquisador &amp; Análise Crítica:
                        </span>
                        <p className="font-editorial text-sm text-[#292524] leading-relaxed">
                          {record.researcherNotes}
                        </p>
                      </div>

                      {/* Transcription Snippet if available */}
                      {record.transcriptionSnippet && (
                        <div className="space-y-1 bg-[#F5EFEB] p-3 rounded-lg border border-[#E8DDD1]">
                          <span className="font-semibold text-[#57534E] uppercase tracking-wider text-[10px] block">
                            Trecho Paleográfico Transcrito:
                          </span>
                          <p className="font-editorial italic text-xs text-[#292524] whitespace-pre-line leading-relaxed">
                            &ldquo;{record.transcriptionSnippet}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Footer Actions inside expanded drawer */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          {record.externalUrl && (
                            <a
                              href={record.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#8C3A27] hover:underline font-semibold"
                            >
                              <span>Consultar no Portale Antenati / FamilySearch</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onOpenContactModal(`Dúvida sobre registro: ${record.personName} (${record.year})`)}
                            className="inline-flex items-center gap-1 text-[#57534E] hover:text-[#1C1917] font-medium cursor-pointer"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Contatar sobre este documento</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER CALLOUT: CONTRIBUTE A RECORD */}
      <div className="bg-[#F5F0E6] border border-[#E5DFD3] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="font-display text-xl font-semibold text-[#1C1917]">
            Possui um documento ou encontrou um homônimo na sua busca?
          </h3>
          <p className="font-editorial text-xs sm:text-sm text-[#57534E] leading-relaxed">
            Se você está pesquisando as famílias Suraci / Sorage de Laganadi ou Cardillo de Castelnuovo Cilento e encontrou algum ato em cartório ou paróquia, compartilhe sua transcrição para enriquecer nosso banco de dados aberto.
          </p>
        </div>

        <button
          onClick={() => onOpenContactModal('Envio de Novo Registro')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Enviar Registro / Contribuir</span>
        </button>
      </div>
    </div>
  );
};
