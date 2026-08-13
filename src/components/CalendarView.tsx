import { useEffect, useState } from 'react';
import { CalendarDays, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { academicService, auditService } from '@/lib/services';
import type { CalendarEvent } from '@/lib/supabase';
import { type Lang } from '@/lib/i18n';

const EVENT_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  semester_start: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  semester_end: { bg: 'bg-slate-50 dark:bg-slate-800/40', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-500' },
  exam: { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  holiday: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  event: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  deadline: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
};

const MONTH_NAMES: Record<string, string[]> = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  fa: ['جنوری','فبروری','مارچ','اپریل','می','جون','جولای','اگست','سپتمبر','اکتوبر','نومبر','دسمبر'],
  ps: ['جنوري','فبروري','مارچ','اپریل','می','جون','جولای','اگست','سپتمبر','اکتوبر','نومبر','دسمبر'],
};

const DAY_NAMES: Record<string, string[]> = {
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  fa: ['یک','دو','سه','چهار','پنج','جمعه','شنبه'],
  ps: ['یک','دوه','درې','څلور','پنځه','جمعه','شنبه'],
};

export default function CalendarView() {
  const { lang } = useLang();
  const { session } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await academicService.getCalendarEvents();
        setEvents(data);
      } catch { /* RLS */ }
      setLoading(false);
    })();
  }, []);

  const isStaff = session.profile?.role === 'instructor' || session.profile?.role === 'admin';

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const d = e.start_date;
    if (!eventsByDate.has(d)) eventsByDate.set(d, []);
    eventsByDate.get(d)!.push(e);
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{title(lang)}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle(lang)}</p>
          </div>
        </div>
        {isStaff && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{addEvent(lang)}</span>
          </button>
        )}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {MONTH_NAMES[lang]?.[month] ?? MONTH_NAMES.en[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
          {(DAY_NAMES[lang] ?? DAY_NAMES.en).map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase py-3">
              {d}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = eventsByDate.get(dateStr) ?? [];
            const isToday = dateStr === todayStr;
            return (
              <div
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-slate-100 dark:border-slate-800 p-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                  isToday ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((e) => {
                    const st = EVENT_STYLES[e.event_type] ?? EVENT_STYLES.event;
                    return (
                      <div key={e.id} className={`text-[10px] px-1.5 py-0.5 rounded-md truncate ${st.bg} ${st.text} ${st.border} border`}>
                        {e[`title_${lang}`] ?? e.title_en}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-slate-400 px-1">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{upcomingLabel(lang)}</h3>
        <div className="space-y-2">
          {loading ? (
            <div className="text-sm text-slate-400 p-4 text-center">{loadingLabel(lang)}</div>
          ) : events.filter((e) => e.start_date >= todayStr).slice(0, 5).map((e) => {
            const st = EVENT_STYLES[e.event_type] ?? EVENT_STYLES.event;
            return (
              <div key={e.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${st.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{e[`title_${lang}`] ?? e.title_en}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{e.start_date}{e.end_date ? ` → ${e.end_date}` : ''}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                  {e.event_type.replace('_', ' ')}
                </span>
              </div>
            );
          })}
          {!loading && events.filter((e) => e.start_date >= todayStr).length === 0 && (
            <div className="text-sm text-slate-400 p-4 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">{noUpcoming(lang)}</div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAdd && isStaff && session.user && (
        <AddEventModal
          lang={lang}
          userId={session.user.id}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            academicService.getCalendarEvents().then(setEvents).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

function AddEventModal({
  lang, userId, onClose, onSaved,
}: {
  lang: Lang;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const { error: err } = await supabase.from('academic_calendar').insert({
        title_en: form.get('title_en') as string,
        title_fa: (form.get('title_fa') as string) || (form.get('title_en') as string),
        title_ps: (form.get('title_ps') as string) || (form.get('title_en') as string),
        event_type: form.get('event_type') as string,
        start_date: form.get('start_date') as string,
        end_date: (form.get('end_date') as string) || null,
        description_en: (form.get('description_en') as string) || '',
      });
      if (err) throw err;
      await auditService.log({ user_id: userId, action: 'calendar.create', entity_type: 'academic_calendar' });
      onSaved();
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{addEvent(lang)}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title (EN)</label>
            <input name="title_en" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="title_fa" placeholder="Title (FA)" className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            <input name="title_ps" placeholder="Title (PS)" className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Event Type</label>
            <select name="event_type" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm">
              <option value="semester_start">Semester Start</option>
              <option value="semester_end">Semester End</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="event">Event</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
              <input name="start_date" type="date" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date</label>
              <input name="end_date" type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            </div>
          </div>
          <textarea name="description_en" placeholder="Description" rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {saving ? '...' : saveLabel(lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function title(lang: Lang): string { return { en: 'Academic Calendar', fa: 'تقویم آکادمیک', ps: 'اکاډمیک کلیز' }[lang]; }
function subtitle(lang: Lang): string { return { en: 'Semester schedules, exams, and holidays', fa: 'برنامه ترم‌ها، امتحانات و تعطیلات', ps: 'د سمسترونو، ازموینو او رخصتیو مهالویش' }[lang]; }
function addEvent(lang: Lang): string { return { en: 'Add Event', fa: 'افزودن رویداد', ps: 'پیښه اضافه کړئ' }[lang]; }
function upcomingLabel(lang: Lang): string { return { en: 'Upcoming Events', fa: 'رویدادهای پیش‌رو', ps: 'راتلونکې پیښې' }[lang]; }
function loadingLabel(lang: Lang): string { return { en: 'Loading...', fa: 'در حال بارگذاری...', ps: 'د بارولو په حال کې...' }[lang]; }
function noUpcoming(lang: Lang): string { return { en: 'No upcoming events.', fa: 'رویداد پیش‌رو‌ای وجود ندارد.', ps: 'هیڅ راتلونکې پیښه نشته.' }[lang]; }
function saveLabel(lang: Lang): string { return { en: 'Save', fa: 'ذخیره', ps: 'خوندي' }[lang]; }
