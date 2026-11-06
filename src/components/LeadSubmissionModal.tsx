import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2, Paperclip, MessageSquare } from 'lucide-react';

interface LeadSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetQuestCode?: string;
}

export const LeadSubmissionModal: React.FC<LeadSubmissionModalProps> = ({
  isOpen,
  onClose,
  presetQuestCode,
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [familyBranch, setFamilyBranch] = useState<'suraci' | 'cardillo' | 'both'>('both');
  const [relatedQuest, setRelatedQuest] = useState(presetQuestCode || '');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful submission and prepare direct mailto option
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  const mailtoLink = `mailto:RSorage@gmail.com?subject=${encodeURIComponent(
    `[Genealogy Lead] ${senderName} regarding ${familyBranch} branch`
  )}&body=${encodeURIComponent(
    `Dear R. Sorage,\n\nName: ${senderName}\nEmail: ${senderEmail}\nBranch: ${familyBranch}\nQuest Reference: ${relatedQuest}\n\nLead Details:\n${message}\n`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-[#FBF9F5] border border-[#E7E2D8] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FAF7F0] px-6 py-4 border-b border-[#E7E2D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#8C3A27]" />
            <span className="font-display text-lg font-semibold text-[#1C1917]">
              Submit Family Clue or Document
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-display text-2xl font-semibold text-[#1C1917]">
                Thank you, {senderName}!
              </h3>
              <p className="font-editorial text-sm text-[#57534E] leading-relaxed max-w-sm mx-auto">
                Your notes have been recorded for the Suraci &amp; Cardillo research archives.
              </p>
              <div className="bg-[#F5F0E6] p-3.5 rounded-lg border border-[#E5DFD3] text-xs text-[#57534E] font-sans">
                <span>Direct Researcher Contact: </span>
                <strong className="text-[#1C1917]">RSorage@gmail.com</strong>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={mailtoLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#8C3A27] hover:bg-[#722F20] rounded-md transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send via Email Client</span>
                </a>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-white border border-[#D6CEBE] rounded-md transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="bg-[#F4EFE6] p-3 rounded-md border border-[#E7E0D2] text-[#57534E] leading-relaxed">
                Connect directly with researcher <strong className="text-[#1C1917]">R. Sorage</strong> to submit certified copies, oral histories, photo scans, or collaborative findings.
              </div>

              <div>
                <label className="block font-semibold text-[#292524] mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Cardillo Rossi"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#292524] mb-1">
                    Your Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#292524] mb-1">
                    Family Branch of Interest
                  </label>
                  <select
                    value={familyBranch}
                    onChange={(e) => setFamilyBranch(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
                  >
                    <option value="both">Both Families (Unified)</option>
                    <option value="suraci">Suraci / Sorage (Calabria)</option>
                    <option value="cardillo">Cardillo / Cardilo (Campania)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#292524] mb-1">
                  Specific Quest Code or Ancestor Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. QST-RC-01 or Fortunato Suraci"
                  value={relatedQuest}
                  onChange={(e) => setRelatedQuest(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#292524] mb-1">
                  Your Clue, Record Details, or Family Recollection
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share any names, birth dates, communes, church parishes, immigration dates, or old letters you have..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#D6CEBE] bg-white text-[#1C1917] focus:outline-none focus:border-[#8C3A27]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#342F2C] rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Archive</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
