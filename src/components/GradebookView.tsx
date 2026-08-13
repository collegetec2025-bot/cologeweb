import { useEffect, useState } from 'react';
import { Award, TrendingUp, Plus, X, BookOpen } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { gradebookService, calculateCGPA, calculateLetterGrade, gradePoints } from '@/lib/services';
import type { Grade, Course } from '@/lib/supabase';
import { type Lang, t } from '@/lib/i18n';

const STATUS_COLORS: Record<string, string> = {
  A: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  B: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  C: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  D: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
  F: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
};

export default function GradebookView() {
  const { lang } = useLang();
  const { session } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!session.user) { setLoading(false); return; }
    (async () => {
      try {
        const data = await gradebookService.getStudentGrades(session.user!.id);
        setGrades(data);
      } catch { /* RLS will handle */ }
      setLoading(false);
    })();
  }, [session.user]);

  const cgpa = calculateCGPA(grades);
  const isStaff = session.profile?.role === 'instructor' || session.profile?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-md">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{title(lang)}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle(lang)}</p>
          </div>
        </div>
        {isStaff && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{addGrade(lang)}</span>
          </button>
        )}
      </div>

      {/* CGPA card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-200 mb-1">{currentCGPA(lang)}</p>
            <div className="text-5xl font-bold tabular-nums">{cgpa.toFixed(2)}</div>
            <p className="text-sm text-blue-300 mt-2">{grades.length} {gradesLabel(lang)}</p>
          </div>
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-blue-300" />
          </div>
        </div>
      </div>

      {/* Grades table */}
      {grades.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{emptyGrades(lang)}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3">{courseLabel(lang)}</th>
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3 hidden sm:table-cell">{assignmentLabel(lang)}</th>
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3">{scoreLabel(lang)}</th>
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3">{gradeLabel(lang)}</th>
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3 hidden md:table-cell">{pointsLabel(lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {grades.map((g) => {
                const course = g.course as unknown as Course | undefined;
                const letter = g.letter_grade || calculateLetterGrade(g.score, g.max_score);
                return (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {course ? (course[`title_${lang}`] ?? course.title_en) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell truncate">
                      {g.assignment ? (g.assignment[`title_${lang}`] ?? g.assignment.title_en) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                      {g.score}/{g.max_score}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[letter] ?? STATUS_COLORS.F}`}>
                        {letter}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 tabular-nums hidden md:table-cell">
                      {gradePoints(letter).toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && isStaff && session.user && (
        <AddGradeModal
          lang={lang}
          graderId={session.user.id}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            gradebookService.getStudentGrades(session.user!.id).then(setGrades).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

function AddGradeModal({
  lang, graderId, onClose, onSaved,
}: {
  lang: Lang;
  graderId: string;
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
      await gradebookService.createGrade({
        student_id: form.get('student_id') as string,
        course_id: form.get('course_id') as string,
        score: Number(form.get('score')),
        max_score: Number(form.get('max_score')) || 100,
        feedback_en: form.get('feedback_en') as string,
        graded_by: graderId,
      });
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{addGrade(lang)}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Student ID</label>
            <input name="student_id" required placeholder="UUID" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Course ID</label>
            <input name="course_id" required placeholder="UUID" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Score</label>
              <input name="score" type="number" min={0} required defaultValue={85} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max Score</label>
              <input name="max_score" type="number" min={1} defaultValue={100} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            </div>
          </div>
          <textarea name="feedback_en" placeholder="Feedback (optional)" rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50">
              {saving ? '...' : 'Save Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function title(lang: Lang): string { return { en: 'Gradebook', fa: 'دفتر نمرات', ps: 'د نومرو کتاب' }[lang]; }
function subtitle(lang: Lang): string { return { en: 'View grades and CGPA calculation', fa: 'مشاهده نمرات و محاسبه CGPA', ps: 'نمرې او د CGPA محاسبه وګورئ' }[lang]; }
function currentCGPA(lang: Lang): string { return { en: 'Current CGPA', fa: 'CGPA فعلی', ps: 'اوسنی CGPA' }[lang]; }
function gradesLabel(lang: Lang): string { return { en: 'grades recorded', fa: 'نمرات ثبت‌شده', ps: 'ثبت شوي نمرې' }[lang]; }
function emptyGrades(lang: Lang): string { return { en: 'No grades recorded yet.', fa: 'هنوز نمره‌ای ثبت نشده است.', ps: 'تر اوسه هیڅ نمره ثبت نه ده.' }[lang]; }
function addGrade(lang: Lang): string { return { en: 'Add Grade', fa: 'افزودن نمره', ps: 'نمره ورکړئ' }[lang]; }
function courseLabel(lang: Lang): string { return { en: 'Course', fa: 'دروس', ps: 'دروس' }[lang]; }
function assignmentLabel(lang: Lang): string { return { en: 'Assignment', fa: 'تکلیف', ps: 'ټولګه' }[lang]; }
function scoreLabel(lang: Lang): string { return { en: 'Score', fa: 'نمره', ps: 'نمره' }[lang]; }
function gradeLabel(lang: Lang): string { return { en: 'Grade', fa: 'درجه', ps: 'درجه' }[lang]; }
function pointsLabel(lang: Lang): string { return { en: 'Points', fa: 'امتیاز', ps: 'نقطې' }[lang]; }
