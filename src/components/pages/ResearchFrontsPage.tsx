import { useState } from 'react';
import { ResearchQuestLog } from '../ResearchQuestLog';
import { LeadSubmissionModal } from '../LeadSubmissionModal';

/** Research fronts, with the lead form pre-filled with the front's code. */
export default function ResearchFrontsPage() {
  const [front, setFront] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ResearchQuestLog
        onOpenContactModal={(code) => {
          setFront(code);
          setOpen(true);
        }}
      />
      <LeadSubmissionModal isOpen={open} onClose={() => setOpen(false)} presetQuestCode={front} />
    </>
  );
}
