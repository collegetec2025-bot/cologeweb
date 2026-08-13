import { useEffect, useState } from 'react';
import { Plus, BookOpen, Users, TrendingUp, X, FileText, PlayCircle, ChevronRight } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Course, type Faculty, type Lesson, type Assignment, type Enrollment } from '@/lib/supabase';
import { localizedCourse, localizedDesc, t } from '@/lib/i18n';

type ModalKind = 'course' | 'lesson' | 'assignment' | null;

export default function Portal() {
  const { lang } = useLang();
  const { navigate } = useNav();
  const { session } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [enrollmentsByCourse, setEnrollmentsByCourse] = useState<Record<string, Enrollment[]>>({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalKind>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [lessonsByCourse, setLessonsByCourse] = useState<Record<string, Lesson[]>>({});
  const [assignmentsByCourse, setAssignmentsByCourse] = useState<Record<string, Assignment[]>>({});

  const isInstructor = session.profile?.role === 'instructor' || session.profile?.role === 'admin';

  useEffect(() => {
    if (!session.user || !isInstructor) { setLoading(false); return; }
    (async () => {
      const [{ data: crs }, { data: facs }] = await Promise.all([
        supabase.from('courses').select('*, faculty:faculties(*)').eq('instructor_id', session.user!.id).order('created_at', { ascending: false }),
        supabase.from('faculties').select('*').order('name_en'),
      ]);
      const courseList = (crs as Course[]) ?? [];
      setCourses(courseList);
      setFaculties((facs as Faculty[]) ?? []);

      if (courseList.length) {
        const ids = courseList.map((c) => c.id);
        const [{ data: ens }, { data: ls }, { data: asgns }] = await Promise.all([
          supabase.from('enrollments').select('*, course:courses(*)').in('course_id', ids),
          supabase.from('lessons').select('*').in('course_id', ids).order('order_index'),
          supabase.from('assignments').select('*').in('course_id', ids).order('due_date'),
        ]);
        const enMap: Record<string, Enrollment[]> = {};
        (ens as Enrollment[])?.forEach((e) => {
          (enMap[e.course_id] ??= []).push(e);
        });
        setEnrollmentsByCourse(enMap);
        const lMap: Record<string, Lesson[]> = {};
        (ls as Lesson[])?.forEach((l) => { (lMap[l.course_id] ??= []).push(l); });
        setLessonsByCourse(lMap);
        const aMap: Record<string, Assignment[]> = {};
        (asgns as Assignment[])?.forEach((a) => { (aMap[a.course_id] ??= []).push(a); });
        setAssignmentsByCourse(aMap);
      }
      setLoading(false);
    })();
  }, [session.user, isInstructor]);

  if (!session.user || !isInstructor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t(lang, 'nav.portal')}</h2>
          <p className="text-slate-500 mb-6">{t(lang, 'auth.login.subtitle')}</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalStudents = Object.values(enrollmentsByCourse).flat().length;
  const avgProgress = (() => {
    const all = Object.values(enrollmentsByCourse).flat();
    if (!all.length) return 0;
    return Math.round(all.reduce((s, e) => s + (e.progress ?? 0), 0) / all.length);
  })();

  const stats = [
    { icon: BookOpen, value: courses.length, label: t(lang, 'portal.mycourses'), color: 'text-blue-600 bg-blue-50' },
    { icon: Users, value: totalStudents, label: t(lang, 'portal.students'), color: 'text-emerald-600 bg-emerald-50' },
    { icon: TrendingUp, value: `${avgProgress}%`, label: t(lang, 'portal.avgprogress'), color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{t(lang, 'portal.title')}</h1>
            <p className="text-slate-600">{t(lang, 'portal.subtitle')}</p>
          </div>
          <button
            onClick={() => { setSelectedCourse(null); setModal('course'); }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            {t(lang, 'portal.newcourse')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Course list */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">{t(lang, 'portal.empty')}</p>
            <button
              onClick={() => { setSelectedCourse(null); setModal('course'); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t(lang, 'portal.newcourse')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((c) => {
              const ens = enrollmentsByCourse[c.id] ?? [];
              const avg = ens.length ? Math.round(ens.reduce((s, e) => s + (e.progress ?? 0), 0) / ens.length) : 0;
              const isExpanded = expandedCourse === c.id;
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {c.faculty && (
                          <span className="text-xs font-medium text-blue-600">{c.faculty[`name_${lang}`] ?? c.faculty.name_en}</span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{localizedCourse(lang, c)}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">{localizedDesc(lang, c)}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {ens.length} {t(lang, 'portal.enrolled')}</span>
                          <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {avg}% {t(lang, 'portal.avgprogress')}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{t(lang, `courses.level.${c.level}`)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setExpandedCourse(isExpanded ? null : c.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
                        >
                          {isExpanded ? 'Hide' : 'Manage'}
                          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          onClick={() => { setSelectedCourse(c); setModal('lesson'); }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-sm font-medium text-slate-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> {t(lang, 'portal.newlesson')}
                        </button>
                        <button
                          onClick={() => { setSelectedCourse(c); setModal('assignment'); }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-sm font-medium text-slate-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> {t(lang, 'portal.newassignment')}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                            <PlayCircle className="w-4 h-4 text-blue-500" /> {t(lang, 'courses.lessons')}
                          </h4>
                          <div className="space-y-2">
                            {(lessonsByCourse[c.id] ?? []).map((l, i) => (
                              <div key={l.id} className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                <span className="text-slate-400 me-2">{i + 1}.</span>
                                {l[`title_${lang}`] ?? l.title_en}
                              </div>
                            ))}
                            {!(lessonsByCourse[c.id] ?? []).length && <p className="text-sm text-slate-400">No lessons yet.</p>}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-amber-500" /> {t(lang, 'courses.assignments')}
                          </h4>
                          <div className="space-y-2">
                            {(assignmentsByCourse[c.id] ?? []).map((a) => (
                              <div key={a.id} className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                {a[`title_${lang}`] ?? a.title_en}
                                {a.due_date && <span className="text-xs text-slate-400 ms-2">— {a.due_date}</span>}
                              </div>
                            ))}
                            {!(assignmentsByCourse[c.id] ?? []).length && <p className="text-sm text-slate-400">No assignments yet.</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <PortalModal
          kind={modal}
          course={selectedCourse}
          faculties={faculties}
          lang={lang}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); window.location.reload(); }}
        />
      )}
    </div>
  );
}

function PortalModal({
  kind, course, faculties, lang, onClose, onSaved,
}: {
  kind: Exclude<ModalKind, null>;
  course: Course | null;
  faculties: Faculty[];
  lang: ReturnType<typeof useLang>['lang'];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      if (kind === 'course') {
        const titleEn = form.get('title_en') as string;
        const slug = (titleEn || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const { error: err } = await supabase.from('courses').insert({
          instructor_id: session.user!.id,
          faculty_id: form.get('faculty_id') || null,
          slug,
          title_en: titleEn,
          title_fa: form.get('title_fa') as string || titleEn,
          title_ps: form.get('title_ps') as string || titleEn,
          description_en: form.get('description_en') as string || '',
          description_fa: form.get('description_fa') as string || '',
          description_ps: form.get('description_ps') as string || '',
          level: form.get('level') || 'beginner',
          credits: Number(form.get('credits')) || 3,
          duration_weeks: Number(form.get('duration_weeks')) || 12,
          published: true,
        });
        if (err) throw err;
      } else if (kind === 'lesson' && course) {
        const titleEn = form.get('title_en') as string;
        const { data: existing } = await supabase
          .from('lessons').select('id').eq('course_id', course.id);
        const { error: err } = await supabase.from('lessons').insert({
          course_id: course.id,
          title_en: titleEn,
          title_fa: form.get('title_fa') as string || titleEn,
          title_ps: form.get('title_ps') as string || titleEn,
          content_en: form.get('content_en') as string || '',
          content_fa: form.get('content_fa') as string || '',
          content_ps: form.get('content_ps') as string || '',
          video_url: form.get('video_url') as string || '',
          order_index: (existing?.length ?? 0) + 1,
        });
        if (err) throw err;
      } else if (kind === 'assignment' && course) {
        const titleEn = form.get('title_en') as string;
        const { error: err } = await supabase.from('assignments').insert({
          course_id: course.id,
          title_en: titleEn,
          title_fa: form.get('title_fa') as string || titleEn,
          title_ps: form.get('title_ps') as string || titleEn,
          description_en: form.get('description_en') as string || '',
          description_fa: form.get('description_fa') as string || '',
          description_ps: form.get('description_ps') as string || '',
          due_date: form.get('due_date') as string || null,
          max_score: Number(form.get('max_score')) || 100,
        });
        if (err) throw err;
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  const title = kind === 'course' ? t(lang, 'portal.createcourse')
    : kind === 'lesson' ? t(lang, 'portal.newlesson')
    : t(lang, 'portal.newassignment');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {(kind === 'course') && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'portal.course.faculty')}</label>
                <select name="faculty_id" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm">
                  <option value="">—</option>
                  {faculties.map((f) => <option key={f.id} value={f.id}>{f[`name_${lang}`] ?? f.name_en}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'portal.course.title')} (EN)</label>
                <input name="title_en" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="title_fa" placeholder="Title (FA)" className="px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                <input name="title_ps" placeholder="Title (PS)" className="px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
              </div>
              <textarea name="description_en" placeholder={t(lang, 'portal.course.description')} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'portal.course.level')}</label>
                  <select name="level" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm">
                    <option value="beginner">{t(lang, 'courses.level.beginner')}</option>
                    <option value="intermediate">{t(lang, 'courses.level.intermediate')}</option>
                    <option value="advanced">{t(lang, 'courses.level.advanced')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'portal.course.credits')}</label>
                  <input name="credits" type="number" defaultValue={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'portal.course.weeks')}</label>
                  <input name="duration_weeks" type="number" defaultValue={12} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                </div>
              </div>
            </>
          )}

          {(kind === 'lesson' || kind === 'assignment') && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{kind === 'lesson' ? t(lang, 'portal.lesson.title') : t(lang, 'portal.assignment.title')} (EN)</label>
                <input name="title_en" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="title_fa" placeholder="Title (FA)" className="px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                <input name="title_ps" placeholder="Title (PS)" className="px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
              </div>
              {kind === 'lesson' ? (
                <>
                  <textarea name="content_en" placeholder={t(lang, 'portal.lesson.content')} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                  <input name="video_url" placeholder={t(lang, 'portal.lesson.video')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                </>
              ) : (
                <>
                  <textarea name="description_en" placeholder={t(lang, 'portal.assignment.desc')} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'portal.assignment.due')}</label>
                      <input name="due_date" type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'portal.assignment.maxscore')}</label>
                      <input name="max_score" type="number" defaultValue={100} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm" />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              {t(lang, 'portal.cancel')}
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? '...' : t(lang, 'portal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
