import { useEffect, useState } from 'react';
import {
  LifeBuoy, Plus, X, Clock, AlertCircle, CheckCircle2, MessageSquare,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ticketService } from '@/lib/services';
import type { SupportTicket } from '@/lib/supabase';
import { type Lang } from '@/lib/i18n';

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  medium: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  high: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  urgent: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
};

const STATUS_STYLES: Record<string, { bg: string; icon: typeof Clock }> = {
  open: { bg: 'bg-blue-100 dark:bg-blue-950/40', icon: Clock },
  in_progress: { bg: 'bg-amber-100 dark:bg-amber-950/40', icon: AlertCircle },
  resolved: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', icon: CheckCircle2 },
  closed: { bg: 'bg-slate-100 dark:bg-slate-800', icon: CheckCircle2 },
};

export default function TicketsView() {
  const { lang } = useLang();
  const { session } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!session.user) { setLoading(false); return; }
    (async () => {
      try {
        const isStaff = session.profile?.role === 'instructor' || session.profile?.role === 'admin';
        const data = isStaff ? await ticketService.getAllTickets() : await ticketService.getStudentTickets(session.user!.id);
        setTickets(data);
      } catch { /* RLS */ }
      setLoading(false);
    })();
  }, [session.user, session.profile]);

  const isStaff = session.profile?.role === 'instructor' || session.profile?.role === 'admin';
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-8 h-8 border-3 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 flex items-center justify-center shadow-md">
            <LifeBuoy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{title(lang)}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{openCount} {openLabel(lang)}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-fuchsia-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{newTicket(lang)}</span>
        </button>
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{emptyTickets(lang)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const st = STATUS_STYLES[t.status] ?? STATUS_STYLES.open;
            const StIcon = st.icon;
            return (
              <div key={t.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <StIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-400">{t.ticket_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[t.priority] ?? PRIORITY_STYLES.medium}`}>
                        {t.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.bg}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{t.subject}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{t.description}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && session.user && (
        <CreateTicketModal
          lang={lang}
          userId={session.user.id}
          isStaff={isStaff}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            if (session.user) {
              const fetch = isStaff ? ticketService.getAllTickets() : ticketService.getStudentTickets(session.user.id);
              fetch.then(setTickets).catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
}

function CreateTicketModal({
  lang, userId, isStaff, onClose, onCreated,
}: {
  lang: Lang;
  userId: string;
  isStaff: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      await ticketService.createTicket({
        student_id: userId,
        subject: form.get('subject') as string,
        description: form.get('description') as string,
        priority: (form.get('priority') as SupportTicket['priority']) ?? 'medium',
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{newTicket(lang)}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{subjectLabel(lang)}</label>
            <input name="subject" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{descriptionLabel(lang)}</label>
            <textarea name="description" required rows={4} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{priorityLabel(lang)}</label>
            <select name="priority" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-fuchsia-600 text-white font-semibold hover:bg-fuchsia-700 transition-colors disabled:opacity-50">
              {saving ? '...' : submitLabel(lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function title(lang: Lang): string { return { en: 'Support Tickets', fa: 'تیکت‌های پشتیبانی', ps: 'د ملاتړ ټیکټونه' }[lang]; }
function openLabel(lang: Lang): string { return { en: 'open tickets', fa: 'تیکت‌های باز', ps: 'پرانیستي ټیکټونه' }[lang]; }
function newTicket(lang: Lang): string { return { en: 'New Ticket', fa: 'تیکت جدید', ps: 'نوی ټیکټ' }[lang]; }
function emptyTickets(lang: Lang): string { return { en: 'No support tickets found.', fa: 'تیکت پشتیبانی یافت نشد.', ps: 'هیڅ د ملاتړ ټیکټ ونه موندل شو.' }[lang]; }
function subjectLabel(lang: Lang): string { return { en: 'Subject', fa: 'موضوع', ps: 'موضوع' }[lang]; }
function descriptionLabel(lang: Lang): string { return { en: 'Description', fa: 'توضیحات', ps: 'تشریح' }[lang]; }
function priorityLabel(lang: Lang): string { return { en: 'Priority', fa: 'اولویت', ps: 'لومړیتوب' }[lang]; }
function submitLabel(lang: Lang): string { return { en: 'Submit Ticket', fa: 'ارسال تیکت', ps: 'ټیکټ وسپارئ' }[lang]; }
