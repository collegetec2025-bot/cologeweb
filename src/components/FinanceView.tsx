import { useEffect, useState } from 'react';
import {
  Wallet, Receipt, CreditCard, Gift, Plus, X, CheckCircle2, Clock,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { financeService } from '@/lib/services';
import type { Invoice, Payment, Scholarship } from '@/lib/supabase';
import { type Lang } from '@/lib/i18n';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', icon: Clock },
  paid: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
  overdue: { bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', icon: Clock },
  cancelled: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: X },
  completed: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
  active: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', icon: Gift },
  awarded: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
};

type Tab = 'invoices' | 'payments' | 'scholarships';

export default function FinanceView() {
  const { lang } = useLang();
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!session.user) { setLoading(false); return; }
    (async () => {
      try {
        const isStaff = session.profile?.role === 'instructor' || session.profile?.role === 'admin';
        const invs = isStaff ? await financeService.getAllInvoices() : await financeService.getStudentInvoices(session.user!.id);
        setInvoices(invs);
        const pays = await financeService.getPayments();
        setPayments(pays);
        const schs = isStaff ? await financeService.getScholarships() : await financeService.getScholarships(session.user!.id);
        setScholarships(schs);
      } catch { /* RLS */ }
      setLoading(false);
    })();
  }, [session.user, session.profile]);

  const isStaff = session.profile?.role === 'instructor' || session.profile?.role === 'admin';
  const totalDue = invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const totalScholarships = scholarships.filter((s) => s.status === 'active' || s.status === 'awarded').reduce((s, sc) => s + Number(sc.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{title(lang)}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle(lang)}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{outstandingLabel(lang)}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">${totalDue.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{totalPaidLabel(lang)}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">${totalPaid.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{scholarshipTotalLabel(lang)}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">${totalScholarships.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        {([
          { key: 'invoices', icon: Receipt, label: invoicesTab(lang) },
          { key: 'payments', icon: CreditCard, label: paymentsTab(lang) },
          { key: 'scholarships', icon: Gift, label: scholarshipsTab(lang) },
        ] as { key: Tab; icon: typeof Receipt; label: string }[]).map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === tb.key ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'invoices' && (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
              <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{emptyInvoices(lang)}</p>
            </div>
          ) : (
            invoices.map((inv) => {
              const st = STATUS_STYLES[inv.status] ?? STATUS_STYLES.pending;
              const StIcon = st.icon;
              return (
                <div key={inv.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">{inv.invoice_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                        <StIcon className="w-3 h-3 inline mr-1" />{inv.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {inv.description_en || inv.invoice_number}
                      {inv.due_date && ` · ${dueLabel(lang)}: ${inv.due_date}`}
                    </p>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">${Number(inv.amount).toFixed(2)}</div>
                    {inv.status === 'pending' && session.user && (
                      <button
                        onClick={() => setShowPay(inv)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:opacity-80 mt-1"
                      >
                        {payNow(lang)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-3">
          {payments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
              <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{emptyPayments(lang)}</p>
            </div>
          ) : (
            payments.map((p) => {
              const st = STATUS_STYLES[p.status] ?? STATUS_STYLES.completed;
              const StIcon = st.icon;
              return (
                <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.payment_method}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                        <StIcon className="w-3 h-3 inline mr-1" />{p.status}
                      </span>
                    </div>
                    {p.transaction_id && <p className="text-xs text-slate-400 mt-1 font-mono">{p.transaction_id}</p>}
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">${Number(p.amount).toFixed(2)}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'scholarships' && (
        <div className="space-y-3">
          {scholarships.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
              <Gift className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{emptyScholarships(lang)}</p>
            </div>
          ) : (
            scholarships.map((sc) => {
              const st = STATUS_STYLES[sc.status] ?? STATUS_STYLES.active;
              const StIcon = st.icon;
              return (
                <div key={sc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sc[`name_${lang}`] ?? sc.name_en}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                        <StIcon className="w-3 h-3 inline mr-1" />{sc.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{new Date(sc.awarded_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">${Number(sc.amount).toFixed(2)}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPay && session.user && (
        <PaymentModal
          lang={lang}
          invoice={showPay}
          userId={session.user.id}
          onClose={() => setShowPay(null)}
          onPaid={() => {
            setShowPay(null);
            if (session.user) {
              financeService.getStudentInvoices(session.user.id).then(setInvoices).catch(() => {});
              financeService.getPayments().then(setPayments).catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
}

function PaymentModal({
  lang, invoice, userId, onClose, onPaid,
}: {
  lang: Lang;
  invoice: Invoice;
  userId: string;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [method, setMethod] = useState<'card' | 'bank_transfer' | 'cash'>('card');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setSaving(true);
    setError('');
    try {
      await financeService.recordPayment({
        invoice_id: invoice.id,
        student_id: userId,
        amount: Number(invoice.amount),
        payment_method: method,
        transaction_id: `TXN-${Date.now().toString().slice(-8)}`,
      });
      onPaid();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{payInvoice(lang)}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">{invoice.invoice_number}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">${Number(invoice.amount).toFixed(2)}</div>
          </div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{paymentMethodLabel(lang)}</label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['card', 'bank_transfer', 'cash'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  method === m
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {m === 'card' ? 'Card' : m === 'bank_transfer' ? 'Bank' : 'Cash'}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
          <button
            onClick={handlePay}
            disabled={saving}
            className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? '...' : `${confirmPay(lang)} $${Number(invoice.amount).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function title(lang: Lang): string { return { en: 'Finance & Payments', fa: 'مالی و پرداخت‌ها', ps: 'مالي او تادیات' }[lang]; }
function subtitle(lang: Lang): string { return { en: 'Manage invoices, payments, and scholarships', fa: 'مدیریت فاکتورها، پرداخت‌ها و بورسیه‌ها', ps: 'د فاکتورونو، تادیاتو او بورسونو مدیریت' }[lang]; }
function outstandingLabel(lang: Lang): string { return { en: 'Outstanding', fa: 'قابل پرداخت', ps: 'تادیات' }[lang]; }
function totalPaidLabel(lang: Lang): string { return { en: 'Total Paid', fa: 'مجموع پرداخت‌شده', ps: 'ټوله تادیه شوي' }[lang]; }
function scholarshipTotalLabel(lang: Lang): string { return { en: 'Scholarships', fa: 'بورسیه‌ها', ps: 'بورسونه' }[lang]; }
function invoicesTab(lang: Lang): string { return { en: 'Invoices', fa: 'فاکتورها', ps: 'فاکتورونه' }[lang]; }
function paymentsTab(lang: Lang): string { return { en: 'Payments', fa: 'پرداخت‌ها', ps: 'تادیات' }[lang]; }
function scholarshipsTab(lang: Lang): string { return { en: 'Scholarships', fa: 'بورسیه‌ها', ps: 'بورسونه' }[lang]; }
function emptyInvoices(lang: Lang): string { return { en: 'No invoices found.', fa: 'فاکتوری یافت نشد.', ps: 'هیڅ فاکتور ونه موندل شو.' }[lang]; }
function emptyPayments(lang: Lang): string { return { en: 'No payments recorded.', fa: 'پرداشتی ثبت نشده.', ps: 'هیڅ تادیه ثبت نه ده.' }[lang]; }
function emptyScholarships(lang: Lang): string { return { en: 'No scholarships found.', fa: 'بورسیه‌ای یافت نشد.', ps: 'هیڅ بورس ونه موندل شو.' }[lang]; }
function payNow(lang: Lang): string { return { en: 'Pay Now', fa: 'پرداخت اکنون', ps: 'همدا اوس تادیه' }[lang]; }
function payInvoice(lang: Lang): string { return { en: 'Pay Invoice', fa: 'پرداخت فاکتور', ps: 'د فاکتور تادیه' }[lang]; }
function paymentMethodLabel(lang: Lang): string { return { en: 'Payment Method', fa: 'روش پرداخت', ps: 'د تادیې طریقه' }[lang]; }
function confirmPay(lang: Lang): string { return { en: 'Confirm Payment', fa: 'تایید پرداخت', ps: 'د تادیې تایید' }[lang]; }
function dueLabel(lang: Lang): string { return { en: 'Due', fa: 'سررسید', ps: 'د سررسید نیټه' }[lang]; }
