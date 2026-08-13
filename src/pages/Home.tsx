import { useEffect, useRef, useState } from 'react';
import { GraduationCap, BookOpen, Users, Globe2, ArrowRight, Sparkles, MonitorPlay } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { t } from '@/lib/i18n';
import HeroCarousel from '@/components/HeroCarousel';
import ProgramsPreview from '@/components/ProgramsPreview';
import NewsEvents from '@/components/NewsEvents';
import ChancellorProfile from '@/components/ChancellorProfile';
import AICenter from '@/components/AICenter';
import AcademicContentGenerator from '@/components/AcademicContentGenerator';
import ClassroomModal from '@/components/ClassroomModal';

function useCounter(target: number, durationMs: number, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, start]);
  return value;
}

export default function Home() {
  const { lang } = useLang();
  const { navigate } = useNav();
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [classroomOpen, setClassroomOpen] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setStatsVisible(true),
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const stats = [
    { icon: Users, value: useCounter(12450, 1500, statsVisible), label: t(lang, 'hero.stat.students') },
    { icon: BookOpen, value: useCounter(180, 1500, statsVisible), label: t(lang, 'hero.stat.courses') },
    { icon: GraduationCap, value: useCounter(6, 1200, statsVisible), label: t(lang, 'hero.stat.faculties') },
    { icon: Globe2, value: useCounter(34, 1500, statsVisible), label: t(lang, 'hero.stat.countries') },
  ];

  return (
    <div>
      {/* 12-slide hero carousel */}
      <HeroCarousel />

      {/* Stats bar */}
      <section ref={statsRef} className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <Icon className="w-7 h-7 text-blue-500 mb-3" />
                  <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value.toLocaleString()}+</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs preview */}
      <ProgramsPreview />

      {/* Live Classroom CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-5">
            <MonitorPlay className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">{classroomCtaTitle(lang)}</h2>
          <p className="text-blue-100 text-lg mb-8">{classroomCtaDesc(lang)}</p>
          <button
            onClick={() => setClassroomOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 shadow-lg transition-all"
          >
            <MonitorPlay className="w-5 h-5" />
            {classroomCtaButton(lang)}
          </button>
        </div>
      </section>

      {/* News & Events */}
      <NewsEvents />

      {/* Chancellor Profile */}
      <ChancellorProfile />

      {/* AI Center */}
      <AICenter />

      {/* Academic Content Generator */}
      <AcademicContentGenerator />

      {/* Final CTA */}
      <section className="py-16 bg-slate-900 dark:bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t(lang, 'hero.enroll')}</h2>
          <p className="text-slate-300 text-lg mb-8">{t(lang, 'hero.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate({ name: 'signup' })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg transition-all"
            >
              {t(lang, 'hero.enroll')}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate({ name: 'courses' })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition-all"
            >
              {t(lang, 'nav.courses')}
            </button>
          </div>
        </div>
      </section>

      {classroomOpen && <ClassroomModal onClose={() => setClassroomOpen(false)} />}
    </div>
  );
}

function classroomCtaTitle(lang: string): string {
  return { en: 'Join Our Live Classroom', fa: 'به کلاس زنده ما بپیوندید', ps: 'زموږ ژوندي ټولګي سره یوځای شئ' }[lang as 'en' | 'fa' | 'ps'] ?? 'Join Our Live Classroom';
}
function classroomCtaDesc(lang: string): string {
  return { en: 'Attend live sessions via Zoom, Google Meet, Microsoft Teams, or WebRTC with weekly schedules.', fa: 'در جلسات زنده از طریق Zoom، Google Meet، Microsoft Teams یا WebRTC با برنامه‌های هفتگی شرکت کنید.', ps: 'د اونیزې مهالویش سره د Zoom، Google Meet، Microsoft Teams یا WebRTC له لارې په ژوندیو غونډو کې برخه واخلئ.' }[lang as 'en' | 'fa' | 'ps'] ?? 'Attend live sessions via Zoom, Google Meet, Microsoft Teams, or WebRTC with weekly schedules.';
}
function classroomCtaButton(lang: string): string {
  return { en: 'Enter Classroom', fa: 'ورود به کلاس', ps: 'ټولګي ته ننوځئ' }[lang as 'en' | 'fa' | 'ps'] ?? 'Enter Classroom';
}
