import { useState, useEffect } from 'react';
import { MessageCircle, Quote, GraduationCap, Facebook, Youtube, Mail } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { type Lang } from '@/lib/i18n';
import { SOCIAL_LINKS, fetchSocialSettings, socialLabel } from '@/lib/social';

const CAMPUS_IMAGE = 'https://images.pexels.com/photos/11932106/pexels-photo-11932106.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const CHANCELLOR_IMAGE = '/folad.svg';

export default function ChancellorProfile() {
  const { lang } = useLang();
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [whatsappDisplay, setWhatsappDisplay] = useState<string>('');

  useEffect(() => {
    fetchSocialSettings().then((settings) => {
      const raw = settings.social_whatsapp || '';
      const num = raw.replace(/\D/g, '');
      if (num) {
        setWhatsappUrl(`https://wa.me/${num}`);
        setWhatsappDisplay(raw);
      }
    });
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Campus backdrop */}
      <div className="absolute inset-0">
        <img src={CAMPUS_IMAGE} alt="EFKGOU Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-800/95" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          {/* Chancellor photo */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="relative">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-gradient-to-br from-blue-600 to-slate-800 flex items-center justify-center">
                <img src={CHANCELLOR_IMAGE} alt={chancellorName(lang)} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white text-blue-700 text-sm font-bold shadow-lg whitespace-nowrap">
                {chancellorName(lang)}
              </div>
            </div>
          </div>

          {/* Welcome message */}
          <div className="lg:col-span-3 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 text-xs font-medium mb-5">
              <GraduationCap className="w-3.5 h-3.5" />
              {chancellorTitle(lang)}
            </div>

            <Quote className="w-10 h-10 text-blue-400/50 mb-4" />

            <h2 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
              {welcomeHeading(lang)}
            </h2>

            <p className="text-blue-100/85 leading-relaxed mb-6 text-lg">
              {welcomeMessage(lang)}
            </p>

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/10 hover:bg-blue-600 flex items-center justify-center text-white transition-all" title={socialLabel(lang, 'facebook')}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/10 hover:bg-red-600 flex items-center justify-center text-white transition-all" title={socialLabel(lang, 'youtube')}>
                <Youtube className="w-5 h-5" />
              </a>
              <a href={`mailto:${SOCIAL_LINKS.email}`} className="w-11 h-11 rounded-xl bg-white/10 hover:bg-slate-600 flex items-center justify-center text-white transition-all" title={socialLabel(lang, 'email')}>
                <Mail className="w-5 h-5" />
              </a>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/10 hover:bg-emerald-600 flex items-center justify-center text-white transition-all" title={socialLabel(lang, 'whatsapp')}>
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                {whatsappLabel(lang)}
                <span className="text-sm font-mono opacity-90" dir="ltr">{whatsappDisplay}</span>
              </a>
            ) : (
              <span className="text-sm text-blue-200/70">
                {whatsappHint(lang)}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function chancellorName(lang: Lang): string {
  return { en: 'Engineer Folad Kabuli', fa: 'انجینر فولاد کابلی', ps: 'انجنیر فولاد کابلي' }[lang];
}
function chancellorTitle(lang: Lang): string {
  return { en: 'Chancellor & Founder', fa: 'رئیس و بنیان‌گذار', ps: 'رئیس او بنسټ ایښودونکی' }[lang];
}
function welcomeHeading(lang: Lang): string {
  return { en: 'A Message from the Chancellor', fa: 'پیام از رئیس دانشگاه', ps: 'د پوهنتون له ریاست څخه پیغام' }[lang];
}
function welcomeMessage(lang: Lang): string {
  return {
    en: 'Dear students and faculty, welcome to Engineer Folad Kabuli Global Online University. We are committed to providing world-class, accessible education to every learner — wherever you are. Our mission is to bridge the gap between talent and opportunity through accredited, multilingual online learning. Together, we build the future of education for Afghanistan and the world.',
    fa: 'دانشجویان و اساتید عزیز، به دانشگاه آنلاین جهانی انجینر فولاد کابلی خوش آمدید. ما متعهد به ارائه آموزش عالی و دسترس‌پذیر برای هر یادگیرنده هستیم — در هر کجا که باشید. مأموریت ما پر کردن شکاف میان استعداد و فرصت از طریق آموزش آنلاین معتبر و چندزبانه است. با هم، آینده آموزش را برای افغانستان و جهان می‌سازیم.',
    ps: 'ګرانو زده‌کوونکو او ښوونکو، د انجنیر فولاد کابلي نړیوال آنلاین پوهنتون ته ښه راغلاست. موږ هر زده‌کوونکي ته د لوړ کیفیت او د لاسرسي وړ زده‌کړې وړاندې کولو ژمن یو — چیرې چې وي. زموږ ماموریت د معتبرې څو ژبنيزې آنلاین زده‌کړې له لارې د استعداد او فرصت تر منځ تشې ډکول دي. په ګډه، موږ د افغانستان او نړۍ لپاره د زده‌کړې راتلونکی جوړوو.',
  }[lang];
}
function whatsappLabel(lang: Lang): string {
  return { en: 'Contact via WhatsApp', fa: 'تماس از طریق واتساپ', ps: 'د واټساپ له لارې اړیکه' }[lang];
}
function whatsappHint(lang: Lang): string {
  return { en: 'Available for student inquiries', fa: 'برای پرسش‌های دانشجویان در دسترس', ps: 'د زده‌کوونکو پوښتنو لپاره شتون لري' }[lang];
}
