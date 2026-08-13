import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { t, type Lang } from '@/lib/i18n';

type Slide = {
  image: string;
  titleKey: string;
  descKey: string;
  ctaKey: string;
  ctaRoute: 'signup' | 'courses' | 'programs' | 'contact';
  badge: string;
};

const SLIDES: Slide[] = [
  { image: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.cs.title', descKey: 'slide.cs.desc', ctaKey: 'hero.enroll', ctaRoute: 'signup', badge: '💻' },
  { image: 'https://images.pexels.com/photos/9275222/pexels-photo-9275222.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.cyber.title', descKey: 'slide.cyber.desc', ctaKey: 'hero.explore', ctaRoute: 'programs', badge: '🛡️' },
  { image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.ai.title', descKey: 'slide.ai.desc', ctaKey: 'hero.enroll', ctaRoute: 'signup', badge: '🤖' },
  { image: 'https://images.pexels.com/photos/37730212/pexels-photo-37730212.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.network.title', descKey: 'slide.network.desc', ctaKey: 'hero.explore', ctaRoute: 'programs', badge: '🌐' },
  { image: 'https://images.pexels.com/photos/16313664/pexels-photo-16313664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.graphic.title', descKey: 'slide.graphic.desc', ctaKey: 'hero.enroll', ctaRoute: 'courses', badge: '🎨' },
  { image: 'https://images.pexels.com/photos/13745480/pexels-photo-13745480.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.english.title', descKey: 'slide.english.desc', ctaKey: 'hero.enroll', ctaRoute: 'courses', badge: '🗣️' },
  { image: 'https://images.pexels.com/photos/1181738/pexels-photo-1181738.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.business.title', descKey: 'slide.business.desc', ctaKey: 'hero.explore', ctaRoute: 'programs', badge: '📊' },
  { image: 'https://images.pexels.com/photos/5212666/pexels-photo-5212666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.lms.title', descKey: 'slide.lms.desc', ctaKey: 'hero.enroll', ctaRoute: 'signup', badge: '🎓' },
  { image: 'https://images.pexels.com/photos/5225982/pexels-photo-5225982.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.library.title', descKey: 'slide.library.desc', ctaKey: 'hero.explore', ctaRoute: 'courses', badge: '📚' },
  { image: 'https://images.pexels.com/photos/11932106/pexels-photo-11932106.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.campus.title', descKey: 'slide.campus.desc', ctaKey: 'hero.enroll', ctaRoute: 'signup', badge: '🏛️' },
  { image: 'https://images.pexels.com/photos/29229903/pexels-photo-29229903.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.graduation.title', descKey: 'slide.graduation.desc', ctaKey: 'hero.enroll', ctaRoute: 'signup', badge: '🏆' },
  { image: 'https://images.pexels.com/photos/8566470/pexels-photo-8566470.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', titleKey: 'slide.research.title', descKey: 'slide.research.desc', ctaKey: 'hero.explore', ctaRoute: 'programs', badge: '🔬' },
];

export default function HeroCarousel() {
  const { lang } = useLang();
  const { navigate } = useNav();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const slide = SLIDES[current];
  const dir = lang === 'en' ? 'ltr' : 'rtl';

  return (
    <section
      className="relative overflow-hidden bg-slate-900 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[480px] sm:h-[560px] lg:h-[640px]">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-800/90 z-10" />
            <img src={s.image} alt="" className="w-full h-full object-cover" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium mb-6 animate-fade-in">
                <Sparkles className="w-3.5 h-3.5" />
                {t(lang, 'footer.tagline')}
              </div>
              <div className="text-5xl mb-4">{slide.badge}</div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] mb-4 tracking-tight">
                {slideTitle(lang, slide.titleKey)}
              </h1>
              <p className="text-lg sm:text-xl text-blue-100/90 leading-relaxed mb-8 max-w-xl">
                {slideTitle(lang, slide.descKey)}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate({ name: slide.ctaRoute })}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
                >
                  {t(lang, slide.ctaKey)}
                </button>
                <button
                  onClick={() => navigate({ name: 'courses' })}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-500/20 border border-blue-400/40 text-white font-semibold hover:bg-blue-500/30 transition-all backdrop-blur-sm"
                >
                  {t(lang, 'nav.courses')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-4' : 'left-4'} z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors`}
        >
          {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <button
          onClick={next}
          className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-4' : 'right-4'} z-30 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors`}
        >
          {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-6 end-6 z-30 text-sm text-white/60 tabular-nums">
          {current + 1} / {SLIDES.length}
        </div>
      </div>
    </section>
  );
}

function slideTitle(lang: Lang, key: string): string {
  const dict = SLIDE_DICTS[lang];
  return (dict && dict[key]) || key;
}

const enSlides: Record<string, string> = {
  'slide.cs.title': 'Computer Science',
  'slide.cs.desc': 'Master programming, algorithms, and software engineering with hands-on projects.',
  'slide.cyber.title': 'Cyber Security',
  'slide.cyber.desc': 'Learn ethical hacking, threat modeling, and defensive security from industry experts.',
  'slide.ai.title': 'Artificial Intelligence',
  'slide.ai.desc': 'Explore machine learning, neural networks, and the future of intelligent systems.',
  'slide.network.title': 'Networking',
  'slide.network.desc': 'Design, configure, and secure modern computer networks and infrastructure.',
  'slide.graphic.title': 'Graphic Design',
  'slide.graphic.desc': 'Photoshop, Illustrator, and branding — unleash your creative potential.',
  'slide.english.title': 'English Language',
  'slide.english.desc': 'IELTS, TOEFL, and spoken English courses for academic and professional success.',
  'slide.business.title': 'Business & Management',
  'slide.business.desc': 'Entrepreneurship, finance, and leadership skills for the modern economy.',
  'slide.lms.title': 'Learning Management System',
  'slide.lms.desc': 'A complete online learning platform with live classes and digital resources.',
  'slide.library.title': 'Digital Library',
  'slide.library.desc': 'Access thousands of e-books, journals, and research papers anytime.',
  'slide.campus.title': 'Campus & Community',
  'slide.campus.desc': 'Join a vibrant community of learners from across Afghanistan and the world.',
  'slide.graduation.title': 'Graduation & Careers',
  'slide.graduation.desc': 'Earn accredited certificates and degrees recognized by employers worldwide.',
  'slide.research.title': 'Research & Innovation',
  'slide.research.desc': 'Engage in cutting-edge research with faculty and international partners.',
};

const faSlides: Record<string, string> = {
  'slide.cs.title': 'علوم کامپیوتر',
  'slide.cs.desc': 'برنامه‌نویسی، الگوریتم و مهندسی نرم‌افزار را با پروژه‌های عملی یاد بگیرید.',
  'slide.cyber.title': 'امنیت سایبری',
  'slide.cyber.desc': 'هک اخلاقی، مدل‌سازی تهدید و امنیت تدافعی را از متخصصان صنعت بیاموزید.',
  'slide.ai.title': 'هوش مصنوعی',
  'slide.ai.desc': 'یادگیری ماشین، شبکه‌های عصبی و آینده سیستم‌های هوشمند را کشف کنید.',
  'slide.network.title': 'شبکه',
  'slide.network.desc': 'شبکه‌های رایانه‌ای نوین را طراحی، پیکربندی و امن کنید.',
  'slide.graphic.title': 'طراحی گرافیک',
  'slide.graphic.desc': 'فتوشاپ، ایلوستریتور و برندینگ — پتانسیل خلاقانه خود را آزاد کنید.',
  'slide.english.title': 'زبان انگلیسی',
  'slide.english.desc': 'دوره‌های IELTS، TOEFL و انگلیسی گفتاری برای موفقیت آکادمیک و حرفه‌ای.',
  'slide.business.title': 'تجارت و مدیریت',
  'slide.business.desc': 'کارآفرینی، مالی و مهارت‌های رهبری برای اقتصاد مدرن.',
  'slide.lms.title': 'سیستم مدیریت یادگیری',
  'slide.lms.desc': 'پلتفرم کامل یادگیری آنلاین با کلاس‌های زنده و منابع دیجیتال.',
  'slide.library.title': 'کتابخانه دیجیتال',
  'slide.library.desc': 'به هزاران کتاب الکترونیکی، ژورنال و مقاله پژوهشی دسترسی داشته باشید.',
  'slide.campus.title': 'محوطه و جامعه',
  'slide.campus.desc': 'به جامعه پویای یادگیرندگان از سراسر افغانستان و جهان بپیوندید.',
  'slide.graduation.title': 'فراغت و مسیر شغلی',
  'slide.graduation.desc': 'گواهینامه‌ها و مدارک معتبر شناخته‌شده توسط کارفرمایان جهان کسب کنید.',
  'slide.research.title': 'پژوهش و نوآوری',
  'slide.research.desc': 'در پژوهش‌های پیشرفته با اساتید و شرکای بین‌المللی مشارکت کنید.',
};

const psSlides: Record<string, string> = {
  'slide.cs.title': 'د کمپیوتر سائنس',
  'slide.cs.desc': 'د عملي پروژو سره پروګرام کول، الګوریتمونه او د سافټویر انجنیري زده کړئ.',
  'slide.cyber.title': 'سایبري امنیت',
  'slide.cyber.desc': 'د صنعت متخصصینو څخه اخلاقي هک، د ګواښ ماډل جوړول او دفاعي امنیت زده کړئ.',
  'slide.ai.title': 'مصنوعي هوښیارتیا',
  'slide.ai.desc': 'د ماشین زده کول، عصبي شبکې او د هوښیارو سیسټمونو راتلونکی کشف کړئ.',
  'slide.network.title': 'شبکه',
  'slide.network.desc': 'عصري کمپیوتري شبکې ډیزاین، ترتیب او امنیت کړئ.',
  'slide.graphic.title': 'د گرافیک ډیزاین',
  'slide.graphic.desc': 'فوتوشاپ، ایلوستریټر او برانډینگ — خپله نوښتګره وړتیا آزاد کړئ.',
  'slide.english.title': 'د انګلیسي ژبه',
  'slide.english.desc': 'د علمي او مسلکي بریالیتوب لپاره د IELTS، TOEFL او ویلې انګلیسي کورسونه.',
  'slide.business.title': 'بزنس او مدیریت',
  'slide.business.desc': 'د عصري اقتصاد لپاره کارپالنه، مالي او د مشرۍ مهارتونه.',
  'slide.lms.title': 'د زده‌کړې مدیریت سیسټم',
  'slide.lms.desc': 'د ژوندیو ټولګیو او ډیجیټلي سرچینو سره بشپړ آنلاین زده‌کړې پلیټفارم.',
  'slide.library.title': 'ډیجیټلي کتابتون',
  'slide.library.desc': 'په هر وخت کې زرګونه ای-کتابونه، ژورنالونه او څیړنیزې مقالې ته لاسرسی.',
  'slide.campus.title': 'پوهنتون او ټولنه',
  'slide.campus.desc': 'د افغانستان او نړۍ څخه د زده‌کوونکو ژوندۍ ټولنې سره یوځای شئ.',
  'slide.graduation.title': 'د فراغت او مسلک',
  'slide.graduation.desc': 'د نړۍ کارموندونکو لخوا پیژندل شوي معتبر تصدیق‌لیکونه او سندونه ترلاسه کړئ.',
  'slide.research.title': 'څیړنه او نوښت',
  'slide.research.desc': 'د ښوونکو او نړیوالو شریکانو سره په پرمختللو څیړنو کې برخه واخلئ.',
};

const SLIDE_DICTS: Record<Lang, Record<string, string>> = {
  en: enSlides,
  fa: faSlides,
  ps: psSlides,
};
