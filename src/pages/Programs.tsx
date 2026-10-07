import { useEffect, useState } from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { supabase, type Faculty, type Course } from '@/lib/supabase';
import { localized, localizedDesc, localizedCourse, t } from '@/lib/i18n';

const FACULTY_ICONS: Record<string, string> = {
  Cpu: '💻', Network: '🌐', Code: '⚡', Languages: '🗣️', Shield: '🛡️', BarChart3: '📊', BookOpen: '📖',
};

const COLOR_MAP: Record<string, { gradient: string; text: string; bg: string }> = {
  blue: { gradient: 'from-blue-500 to-blue-700', text: 'text-blue-600', bg: 'bg-blue-50' },
  emerald: { gradient: 'from-emerald-500 to-emerald-700', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  amber: { gradient: 'from-amber-500 to-amber-700', text: 'text-amber-600', bg: 'bg-amber-50' },
  rose: { gradient: 'from-rose-500 to-rose-700', text: 'text-rose-600', bg: 'bg-rose-50' },
  slate: { gradient: 'from-slate-600 to-slate-800', text: 'text-slate-700', bg: 'bg-slate-100' },
  violet: { gradient: 'from-violet-500 to-violet-700', text: 'text-violet-600', bg: 'bg-violet-50' },
};

export default function Programs() {
  const { lang } = useLang();
  const { navigate } = useNav();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courseCounts, setCourseCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const [{ data: facs }, { data: courses }] = await Promise.all([
        supabase.from('faculties').select('*').order('name_en'),
        supabase.from('courses').select('id, faculty_id'),
      ]);
      if (facs) setFaculties(facs as Faculty[]);
      const counts: Record<string, number> = {};
      (courses as Course[] | null)?.forEach((c) => {
        if (c.faculty_id) counts[c.faculty_id] = (counts[c.faculty_id] ?? 0) + 1;
      });
      setCourseCounts(counts);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{t(lang, 'programs.title')}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t(lang, 'programs.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faculties.map((f) => {
            const c = COLOR_MAP[f.color] ?? COLOR_MAP.blue;
            const count = courseCounts[f.id] ?? 0;
            return (
              <div key={f.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                <div className={`bg-gradient-to-br ${c.gradient} p-8 text-white`}>
                  <div className="text-4xl mb-4">{FACULTY_ICONS[f.icon] ?? '🎓'}</div>
                  <h2 className="text-2xl font-bold mb-2">{localized(lang, f)}</h2>
                  <p className="text-white/80 text-sm leading-relaxed">{localizedDesc(lang, f)}</p>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {count} {t(lang, 'nav.courses').toLowerCase()}
                  </span>
                  <button
                    onClick={() => navigate({ name: 'courses' })}
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.text} hover:opacity-80`}
                  >
                    {t(lang, 'programs.explore')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* BSCS Program CTA */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 lg:p-12 text-white text-center">
          <GraduationCap className="w-12 h-12 text-blue-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">{bscsCtaTitle(lang)}</h2>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">{bscsCtaDesc(lang)}</p>
          <button
            onClick={() => navigate({ name: 'bscs' })}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 shadow-lg transition-all"
          >
            <GraduationCap className="w-5 h-5" />
            {bscsCtaButton(lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function bscsCtaTitle(lang: string): string {
  return { en: 'BSCS 4-Year International Program', fa: 'برنامه ۴ ساله بین‌المللی BSCS', ps: 'د ۴ کلن نړیوال BSCS پروګرام' }[lang as 'en' | 'fa' | 'ps'] ?? 'BSCS 4-Year International Program';
}
function bscsCtaDesc(lang: string): string {
  return { en: 'Explore the complete 8-semester Bachelor of Science in Computer Science curriculum aligned with international standards.', fa: 'نصاب کامل ۸ ترم کارشناسی علوم کامپیوتر هم‌سو با استانداردهای بین‌المللی را کشف کنید.', ps: 'د نړیوالو معیارونو سره سمون خوړلی د بشپړ ۸ سمسترو کمپیوتر سائنس لیسانس نصاب وپلټئ.' }[lang as 'en' | 'fa' | 'ps'] ?? 'Explore the complete 8-semester BSCS curriculum.';
}
function bscsCtaButton(lang: string): string {
  return { en: 'View Curriculum', fa: 'مشاهده نصاب', ps: 'نصاب وګورئ' }[lang as 'en' | 'fa' | 'ps'] ?? 'View Curriculum';
}
