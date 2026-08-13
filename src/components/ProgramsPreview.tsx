import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { supabase, type Faculty } from '@/lib/supabase';
import { localized, localizedDesc, t } from '@/lib/i18n';

const FACULTY_ICONS: Record<string, string> = {
  Cpu: '💻', Network: '🌐', Code: '⚡', Languages: '🗣️', Shield: '🛡️', BarChart3: '📊',
};

const COLOR_MAP: Record<string, { gradient: string; text: string }> = {
  blue: { gradient: 'from-blue-500 to-blue-700', text: 'text-blue-600' },
  emerald: { gradient: 'from-emerald-500 to-emerald-700', text: 'text-emerald-600' },
  amber: { gradient: 'from-amber-500 to-amber-700', text: 'text-amber-600' },
  rose: { gradient: 'from-rose-500 to-rose-700', text: 'text-rose-600' },
  slate: { gradient: 'from-slate-600 to-slate-800', text: 'text-slate-700' },
  violet: { gradient: 'from-violet-500 to-violet-700', text: 'text-violet-600' },
};

export default function ProgramsPreview() {
  const { lang } = useLang();
  const { navigate } = useNav();
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('faculties').select('*').order('name_en');
      if (data) setFaculties(data as Faculty[]);
    })();
  }, []);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{t(lang, 'programs.title')}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t(lang, 'programs.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties.map((f) => {
            const c = COLOR_MAP[f.color] ?? COLOR_MAP.blue;
            return (
              <div
                key={f.id}
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer"
                onClick={() => navigate({ name: 'courses' })}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {FACULTY_ICONS[f.icon] ?? '🎓'}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{localized(lang, f)}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{localizedDesc(lang, f)}</p>
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${c.text}`}>
                  {t(lang, 'programs.explore')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
