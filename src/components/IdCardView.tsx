import { useEffect, useState } from 'react';
import { CreditCard, Download, User, Mail, Calendar, BookOpen } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile, Enrollment, Course } from '@/lib/supabase';
import { type Lang } from '@/lib/i18n';

export default function IdCardView() {
  const { lang } = useLang();
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<(Enrollment & { course: Course })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session.user) { setLoading(false); return; }
    (async () => {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user!.id)
          .single();
        setProfile(prof as Profile);

        const { data: enrs } = await supabase
          .from('enrollments')
          .select('*, course:courses(*)')
          .eq('student_id', session.user!.id);
        setEnrollments((enrs as (Enrollment & { course: Course })[]) ?? []);
      } catch { /* RLS */ }
      setLoading(false);
    })();
  }, [session.user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        {noProfile(lang)}
      </div>
    );
  }

  const studentId = `EFKGOU-${profile.id.slice(0, 8).toUpperCase()}`;
  const initials = profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const activeCount = enrollments.length;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-md">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{title(lang)}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle(lang)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ID Card */}
        <div className="lg:sticky lg:top-4 self-start">
          <div className="relative w-full max-w-sm mx-auto aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900">
            {/* Card pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border-4 border-white" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full border-4 border-white" />
            </div>

            {/* Header */}
            <div className="relative p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-violet-200">EFKGOU</div>
                  <div className="text-[10px] text-violet-300">{uniName(lang)}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Student info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold truncate">{profile.full_name}</div>
                  <div className="text-xs text-violet-200 capitalize">{profile.role}</div>
                  <div className="text-xs text-violet-300 font-mono mt-0.5">{studentId}</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-violet-200">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{session.user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-violet-200">
                  <Calendar className="w-3 h-3" />
                  <span>{enrolledLabel(lang)}: {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-violet-200">
                  <BookOpen className="w-3 h-3" />
                  <span>{activeCount} {coursesLabel(lang)}</span>
                </div>
              </div>

              {/* QR placeholder */}
              <div className="absolute bottom-4 right-4 w-12 h-12 rounded-lg bg-white/90 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-px p-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-sm ${i % 2 === 0 ? 'bg-violet-900' : 'bg-white'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-4 w-full max-w-sm mx-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloadCard(lang)}
          </button>
        </div>

        {/* Enrolled courses */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{enrolledCourses(lang)}</h3>
          {enrollments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">{noCourses(lang)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {enrollments.map((e) => (
                <div key={e.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {e.course?.[`title_${lang}`] ?? e.course?.title_en ?? '—'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {e.course?.credits ?? 0} {creditsLabel(lang)} · {progressLabel(lang)} {e.progress ?? 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function title(lang: Lang): string { return { en: 'Student ID Card', fa: 'کارت شناسایی دانشجو', ps: 'د زده‌کوونکي د پیژندلو کارت' }[lang]; }
function subtitle(lang: Lang): string { return { en: 'Your digital student identification', fa: 'کارت شناسایی دیجیتال دانشجویی شما', ps: 'ستاسو ډیجیټل د زده‌کوونکي پیژندنه' }[lang]; }
function uniName(lang: Lang): string { return { en: 'Engineer Folad Kabuli Global Online University', fa: 'دانشگاه آنلاین جهانی انجینر فولاد کابلی', ps: 'د انجنیر فولاد کابلي نړیوال آنلاین پوهنتون' }[lang]; }
function enrolledLabel(lang: Lang): string { return { en: 'Enrolled', fa: 'ثبت‌نام', ps: 'نوم لیکل شوی' }[lang]; }
function coursesLabel(lang: Lang): string { return { en: 'courses', fa: 'دروس', ps: 'دروس' }[lang]; }
function downloadCard(lang: Lang): string { return { en: 'Download / Print ID Card', fa: 'دانلود / چاپ کارت شناسایی', ps: 'د پیژندلو کارت ډاونلوډ / چاپ' }[lang]; }
function enrolledCourses(lang: Lang): string { return { en: 'Enrolled Courses', fa: 'دروس ثبت‌نام‌شده', ps: 'نوم لیکنه شوي درسونه' }[lang]; }
function noCourses(lang: Lang): string { return { en: 'No active course enrollments.', fa: 'ثبت‌نام درس فعالی وجود ندارد.', ps: 'هیڅ فعال درس نوم لیکنه نشته.' }[lang]; }
function noProfile(lang: Lang): string { return { en: 'Profile not found. Please sign in.', fa: 'پروفایل یافت نشد. لطفاً وارد شوید.', ps: 'پروفایل ونه موندل شو. مهرباني وکړئ ننوځئ.' }[lang]; }
function progressLabel(lang: Lang): string { return { en: 'Progress', fa: 'پیشرفت', ps: 'پرمختګ' }[lang]; }
function creditsLabel(lang: Lang): string { return { en: 'cr', fa: 'واحد', ps: 'کرډیټ' }[lang]; }
