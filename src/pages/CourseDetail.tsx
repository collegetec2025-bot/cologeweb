import { useEffect, useState } from 'react';
import { ArrowLeft, Award, Clock, PlayCircle, BookOpen, FileText, CheckCircle2, Circle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Course, type Lesson, type Assignment } from '@/lib/supabase';
import { localizedCourse, localizedDesc, localizedContent, t } from '@/lib/i18n';

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

export default function CourseDetail({ slug }: { slug: string }) {
  const { lang } = useLang();
  const { navigate } = useNav();
  const { session } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: crs } = await supabase
        .from('courses')
        .select('*, faculty:faculties(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (!crs) { setLoading(false); return; }
      setCourse(crs as Course);

      const [{ data: ls }, { data: as }] = await Promise.all([
        supabase.from('lessons').select('*').eq('course_id', crs.id).order('order_index'),
        supabase.from('assignments').select('*').eq('course_id', crs.id).order('due_date'),
      ]);
      setLessons((ls as Lesson[]) ?? []);
      setAssignments((as as Assignment[]) ?? []);

      if (session.user) {
        const { data: en } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', crs.id)
          .eq('student_id', session.user.id)
          .maybeSingle();
        setEnrolled(!!en);
      }
      setLoading(false);
    })();
  }, [slug, session.user]);

  const handleEnroll = async () => {
    if (!session.user) {
      navigate({ name: 'signup' });
      return;
    }
    if (!course) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('enrollments')
      .insert({ course_id: course.id, student_id: session.user.id });
    if (!error) setEnrolled(true);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate({ name: 'courses' })}
            className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(lang, 'courses.back')}
          </button>
          {course.faculty && (
            <span className="text-sm font-medium text-blue-300">{course.faculty[`name_${lang}`] ?? course.faculty.name_en}</span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">{localizedCourse(lang, course)}</h1>
          <p className="text-lg text-blue-100/80 leading-relaxed mb-6 max-w-3xl">{localizedDesc(lang, course)}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${LEVEL_COLORS[course.level]}`}>
              {t(lang, `courses.level.${course.level}`)}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-blue-200">
              <Award className="w-4 h-4" /> {course.credits} {t(lang, 'courses.credits')}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-blue-200">
              <Clock className="w-4 h-4" /> {course.duration_weeks} {t(lang, 'courses.weeks')}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-blue-200">
              <BookOpen className="w-4 h-4" /> {lessons.length} {t(lang, 'courses.lessons')}
            </span>
          </div>
          <div className="mt-8">
            {enrolled ? (
              <button
                onClick={() => navigate({ name: 'dashboard' })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 shadow-lg transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                {t(lang, 'courses.continue')}
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 shadow-lg transition-all disabled:opacity-50"
              >
                {t(lang, 'courses.enroll')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-blue-600" />
              {t(lang, 'courses.lessons')}
            </h2>
            {lessons.length === 0 ? (
              <p className="text-slate-500">No lessons yet.</p>
            ) : (
              <div className="space-y-3">
                {lessons.map((l, i) => {
                  const isActive = activeLesson === l.id;
                  return (
                    <div key={l.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setActiveLesson(isActive ? null : l.id)}
                        className="flex items-center gap-3 w-full p-4 text-start hover:bg-slate-50 transition-colors"
                      >
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1 font-medium text-slate-800">{l[`title_${lang}`] ?? l.title_en}</span>
                        {l.video_url && <PlayCircle className="w-5 h-5 text-blue-500" />}
                      </button>
                      {isActive && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                          {l.video_url && (
                            <div className="mb-3 aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                              <PlayCircle className="w-12 h-12 text-white/60" />
                            </div>
                          )}
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                            {localizedContent(lang, l) || 'No content available.'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assignments sidebar */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-600" />
              {t(lang, 'courses.assignments')}
            </h2>
            {assignments.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <Circle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No assignments yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-800 mb-1">{a[`title_${lang}`] ?? a.title_en}</h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{a[`description_${lang}`] ?? a.description_en}</p>
                    <div className="flex items-center justify-between text-xs">
                      {a.due_date && (
                        <span className="text-slate-500">{t(lang, 'dash.due')}: {a.due_date}</span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        {a.max_score} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
