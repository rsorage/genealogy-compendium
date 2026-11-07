import { useEffect, useState } from 'react';
import { Search, Mail } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { LeadSubmissionModal } from '../LeadSubmissionModal';

/**
 * Zone 3 of the header: quick search (Ctrl/Cmd+K) and lead submission.
 * The only interactive part of the header, hence a separate React island.
 */
export const HeaderActions: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex items-center gap-3 shrink-0">
      <button
        onClick={() => setSearchOpen(true)}
        className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-md transition-colors cursor-pointer"
        aria-label="Buscar pessoas, documentos e lugares"
        title="Buscar pessoas, documentos e lugares (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        onClick={() => setContactOpen(true)}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
        aria-label="Enviar uma pista"
      >
        <Mail className="w-3.5 h-3.5" />
        <span className="hidden sm:inline lg:hidden xl:inline">Enviar uma pista</span>
      </button>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <LeadSubmissionModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
};

export default HeaderActions;
