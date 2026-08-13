import { useEffect, useState, useRef } from 'react';
import {
  BookOpen, Award, TrendingUp, CheckCircle2, Clock, Users,
  GraduationCap, Calendar, FileText, Trophy, Bell,
  ArrowRight, PlayCircle, ChevronRight, Activity,
  type LucideIcon,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Enrollment, type Course, type Assignment } from '@/lib/supabase';
import { localizedCourse, t } from '@/lib/i18n';
import { MENU, COLOR_CLASSES, menuLabel, type MenuKey, type MenuItemKey } from '@/lib/menu';
import DashboardSectionContent from '@/components/DashboardSectionContent';

function useCounter(target: number, start: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return val;
}

export default function Dashboard() {
  const { lang } = useLang();
  const { navigate, route } = useNav();
  const { session } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setStatsVisible(true), { threshold: 0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!session.user) { setLoading(false); return; }
    (async () => {
      const { data: ens } = await supabase
        .from('enrollments')
        .select('*, course:courses(*)')
        .eq('student_id', session.user!.id)
        .order('enrolled_at', { ascending: false });
      setEnrollments((ens as Enrollment[]) ?? []);

      const ids = ((ens as Enrollment[]) ?? []).map((e) => e.course_id);
      if (ids.length) {
        const { data: asgns } = await supabase
          .from('assignments')
          .select('*')
          .in('course_id', ids)
          .order('due_date');
        setAllAssignments((asgns as Assignment[]) ?? []);
      }
      setLoading(false);
    })();
  }, [session.user]);

  if (!session.user) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t(lang, 'nav.login')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t(lang, 'auth.login.subtitle')}</p>
          <button
            onClick={() => navigate({ name: 'login' })}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {t(lang, 'nav.login')}
          </button>
        </div>
      </div>
    );
  }

  // Render section content if on a dashboard-section route
  if (route.name === 'dashboard-section') {
    return <DashboardSectionContent category={route.category} item={route.item} />;
  }

  const completed = enrollments.filter((e) => e.progress >= 100).length;
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress ?? 0), 0) / enrollments.length)
    : 0;

  const stats: { icon: LucideIcon; value: string | number; label: string; color: string; countTarget?: number }[] = [
    { icon: BookOpen, value: useCounter(enrollments.length, statsVisible), label: t(lang, 'dash.mycourses'), color: 'blue', countTarget: enrollments.length },
    { icon: TrendingUp, value: `${useCounter(avgProgress, statsVisible)}%`, label: t(lang, 'dash.progress'), color: 'emerald' },
    { icon: CheckCircle2, value: useCounter(completed, statsVisible), label: t(lang, 'dash.completed'), color: 'amber' },
    { icon: Award, value: useCounter(allAssignments.length, statsVisible), label: t(lang, 'dash.assignments'), color: 'rose' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          {t(lang, 'dash.welcome')}, {session.profile?.full_name || session.user.email}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{t(lang, 'dash.overview')}</p>
      </div>

      {/* Stats grid */}
      <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          const c = COLOR_CLASSES[s.color] ?? COLOR_CLASSES.blue;
          return (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${c.text}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t(lang, 'dash.mycourses')}</h2>
            <button
              onClick={() => navigate({ name: 'courses' })}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:opacity-80"
            >
              {t(lang, 'dash.browse')}
            </button>
          </div>
          {enrollments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">{t(lang, 'dash.empty')}</p>
              <button
                onClick={() => navigate({ name: 'courses' })}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                {t(lang, 'dash.browse')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 4).map((e) => {
                const c = e.course as unknown as Course;
                if (!c) return null;
                return (
                  <div
                    key={e.id}
                    onClick={() => navigate({ name: 'course', slug: c.slug })}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {localizedCourse(lang, c)}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                            style={{ width: `${e.progress ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                          {Math.round(e.progress ?? 0)}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 rtl:rotate-180" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming assignments */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t(lang, 'dash.assignments')}</h2>
            {allAssignments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No assignments due.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {allAssignments.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">
                        {a[`title_${lang}`] ?? a.title_en}
                      </div>
                      {a.due_date && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t(lang, 'dash.due')}: {a.due_date}
                        </div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex-shrink-0">
                      {a.max_score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick access tiles */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t(lang, 'dash.overview')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {MENU.slice(0, 4).map((cat) => {
                const c = COLOR_CLASSES[cat.color] ?? COLOR_CLASSES.blue;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => navigate({ name: 'dashboard-section', category: cat.key, item: cat.items[0].key })}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-start hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-2.5`}>
                      <Icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {menuLabel(lang, cat.key)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="space-y-4">
            {[
              { icon: PlayCircle, text: 'Completed lesson 3 of Introduction to Programming', time: '2 hours ago', color: 'blue' },
              { icon: FileText, text: 'Submitted assignment: Python Basics', time: '1 day ago', color: 'amber' },
              { icon: Trophy, text: 'Earned certificate: Computer Networks Fundamentals', time: '3 days ago', color: 'emerald' },
              { icon: Users, text: 'Joined new course: Machine Learning Foundations', time: '5 days ago', color: 'violet' },
            ].map((act, i) => {
              const Icon = act.icon;
              const c = COLOR_CLASSES[act.color] ?? COLOR_CLASSES.blue;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${c.text}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{act.text}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{act.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
