import { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Clock, Award, ChevronRight } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { supabase, type Course, type Faculty } from '@/lib/supabase';
import { localizedCourse, localizedDesc, t } from '@/lib/i18n';

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

export default function Courses() {
  const { lang } = useLang();
  const { navigate } = useNav();
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: crs }, { data: facs }] = await Promise.all([
        supabase.from('courses').select('*, faculty:faculties(*)').eq('published', true).order('title_en'),
        supabase.from('faculties').select('*').order('name_en'),
      ]);
      setCourses((crs as Course[]) ?? []);
      setFaculties((facs as Faculty[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const title = localizedCourse(lang, c).toLowerCase();
      const desc = localizedDesc(lang, c).toLowerCase();
      const matchesSearch = !search || title.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
      const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
      const matchesFaculty = facultyFilter === 'all' || c.faculty_id === facultyFilter;
      return matchesSearch && matchesLevel && matchesFaculty;
    });
  }, [courses, search, levelFilter, facultyFilter, lang]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{t(lang, 'courses.title')}</h1>
          <p className="text-lg text-slate-600">{t(lang, 'courses.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(lang, 'courses.search')}
                className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="ps-9 pe-8 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white appearance-none cursor-pointer"
                >
                  <option value="all">{t(lang, 'courses.filter.level')}: {t(lang, 'courses.filter.all')}</option>
                  <option value="beginner">{t(lang, 'courses.level.beginner')}</option>
                  <option value="intermediate">{t(lang, 'courses.level.intermediate')}</option>
                  <option value="advanced">{t(lang, 'courses.level.advanced')}</option>
                </select>
              </div>
              <select
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white cursor-pointer"
              >
                <option value="all">{t(lang, 'courses.filter.faculty')}: {t(lang, 'courses.filter.all')}</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f[`name_${lang}`] ?? f.name_en}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-32 bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">{t(lang, 'courses.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate({ name: 'course', slug: c.slug })}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex flex-col"
              >
                <div className="h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-slate-700 flex items-center justify-center relative">
                  <span className="text-4xl opacity-30">📚</span>
                  <span className={`absolute top-3 end-3 px-2.5 py-1 rounded-full text-xs font-semibold ${LEVEL_COLORS[c.level]}`}>
                    {t(lang, `courses.level.${c.level}`)}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {c.faculty && (
                    <span className="text-xs font-medium text-blue-600 mb-2">{c.faculty[`name_${lang}`] ?? c.faculty.name_en}</span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {localizedCourse(lang, c)}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2 flex-1">
                    {localizedDesc(lang, c)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {c.credits} {t(lang, 'courses.credits')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {c.duration_weeks} {t(lang, 'courses.weeks')}
                    </span>
                  </div>
                  <button className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors">
                    {t(lang, 'courses.view')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
