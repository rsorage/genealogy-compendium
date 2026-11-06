import { useEffect, useState } from 'react';
import { Search, Mail } from 'lucide-react';
import BuscaGlobal from './BuscaGlobal';
import { LeadSubmissionModal } from '../LeadSubmissionModal';

/**
 * Zona 3 do cabeçalho: busca rápida (Ctrl/Cmd+K) e envio de pista.
 * É a única parte interativa do cabeçalho, por isso é uma ilha React separada.
 */
export const AcoesCabecalho: React.FC = () => {
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [contatoAberto, setContatoAberto] = useState(false);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setBuscaAberta((v) => !v);
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <div className="flex items-center gap-3 shrink-0">
      <button
        onClick={() => setBuscaAberta(true)}
        className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-md transition-colors cursor-pointer"
        aria-label="Buscar pessoas, documentos e lugares"
        title="Buscar pessoas, documentos e lugares (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        onClick={() => setContatoAberto(true)}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
        aria-label="Enviar uma pista"
      >
        <Mail className="w-3.5 h-3.5" />
        <span className="hidden sm:inline lg:hidden xl:inline">Enviar uma pista</span>
      </button>

      <BuscaGlobal aberta={buscaAberta} aoFechar={() => setBuscaAberta(false)} />
      <LeadSubmissionModal isOpen={contatoAberto} onClose={() => setContatoAberto(false)} />
    </div>
  );
};

export default AcoesCabecalho;
