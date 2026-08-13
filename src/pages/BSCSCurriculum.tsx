import { useState } from 'react';
import { GraduationCap, BookOpen, Award, Clock, ChevronDown, ChevronRight, Code2 } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { BSCS_CURRICULUM, bscsTitle, type Semester } from '@/lib/menu';
import { type Lang } from '@/lib/i18n';

const TYPE_STYLES: Record<string, string> = {
  core: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  elective: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  lab: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
};

const TYPE_LABELS: Record<string, { en: string; fa: string; ps: string }> = {
  core: { en: 'Core', fa: 'هسته‌ای', ps: 'اصلي' },
  elective: { en: 'Elective', fa: 'اختیاری', ps: 'اختیاري' },
  lab: { en: 'Lab', fa: 'آزمایشگاه', ps: 'ازمایښتګاه' },
};

export default function BSCSCurriculum() {
  const { lang } = useLang();
  const { navigate } = useNav();
  const [expanded, setExpanded] = useState<number | null>(1);

  const totalCredits = BSCS_CURRICULUM.reduce(
    (sum, s) => sum + s.courses.reduce((cs, c) => cs + c.credits, 0), 0
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {bscsTitle(lang)}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {subtitle(lang)}
          </p>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Clock, label: statYears(lang), value: '4' },
            { icon: BookOpen, label: statSemesters(lang), value: '8' },
            { icon: Code2, label: statCourses(lang), value: String(BSCS_CURRICULUM.reduce((s, sem) => s + sem.courses.length, 0)) },
            { icon: Award, label: statCredits(lang), value: String(totalCredits) },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
                <Icon className="w-7 h-7 text-blue-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {(['core', 'elective', 'lab'] as const).map((t) => (
            <span key={t} className={`px-3 py-1 rounded-full text-xs font-semibold ${TYPE_STYLES[t]}`}>
              {TYPE_LABELS[t][lang]}
            </span>
          ))}
        </div>

        {/* Semesters */}
        <div className="space-y-4">
          {BSCS_CURRICULUM.map((sem) => (
            <SemesterCard
              key={sem.semester}
              sem={sem}
              lang={lang}
              isExpanded={expanded === sem.semester}
              onToggle={() => setExpanded(expanded === sem.semester ? null : sem.semester)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate({ name: 'signup' })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg transition-all"
          >
            <GraduationCap className="w-5 h-5" />
            {enrollCta(lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function SemesterCard({
  sem, lang, isExpanded, onToggle,
}: {
  sem: Semester;
  lang: Lang;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const semCredits = sem.courses.reduce((s, c) => s + c.credits, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex items-center gap-4 w-full p-5 text-start hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center text-white font-bold flex-shrink-0">
          {sem.semester}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {semLabel(lang)} {sem.semester}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {yearLabel(lang)} {sem.year} · {sem.courses.length} {coursesLabel(lang)} · {semCredits} {creditsLabel(lang)}
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 rtl:rotate-180" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-5 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sem.courses.map((c) => (
              <div
                key={c.code}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {c.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_STYLES[c.type]}`}>
                    {TYPE_LABELS[c.type][lang]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {c[`title_${lang}`] ?? c.title_en}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {c.credits} {creditsLabel(lang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function subtitle(lang: Lang): string {
  return {
    en: 'A complete 8-semester Bachelor of Science in Computer Science program with international accreditation standards.',
    fa: 'برنامه کامل ۸ ترم کارشناسی علوم کامپیوتر با استانداردهای اعتبارسنجی بین‌المللی.',
    ps: 'د نړیوال باور وړتیا معیارونو سره د کمپیوتر سائنس کې د بشپړ ۸ سمسترو لیسانس پروګرام.',
  }[lang];
}
function statYears(lang: Lang): string { return { en: 'Years', fa: 'سال‌ها', ps: 'کلونه' }[lang]; }
function statSemesters(lang: Lang): string { return { en: 'Semesters', fa: 'ترم‌ها', ps: 'سمسترونه' }[lang]; }
function statCourses(lang: Lang): string { return { en: 'Courses', fa: 'دروس', ps: 'دروس' }[lang]; }
function statCredits(lang: Lang): string { return { en: 'Credits', fa: 'واحدها', ps: 'کرډیټونه' }[lang]; }
function semLabel(lang: Lang): string { return { en: 'Semester', fa: 'ترم', ps: 'سمستر' }[lang]; }
function yearLabel(lang: Lang): string { return { en: 'Year', fa: 'سال', ps: 'کال' }[lang]; }
function coursesLabel(lang: Lang): string { return { en: 'Courses', fa: 'دروس', ps: 'دروس' }[lang]; }
function creditsLabel(lang: Lang): string { return { en: 'cr', fa: 'واحد', ps: 'کرډیټ' }[lang]; }
function enrollCta(lang: Lang): string { return { en: 'Enroll in BSCS Program', fa: 'ثبت‌نام در برنامه BSCS', ps: 'په BSCS پروګرام کې نوم ولیکئ' }[lang]; }
