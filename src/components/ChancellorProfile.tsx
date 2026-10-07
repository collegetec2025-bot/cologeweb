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
  return { en: 'Engineer Folad Kabuli', fa: 'انجنیر فولاد کابلی', ps: 'انجنیر فولاد کابلي' }[lang];
}
function chancellorTitle(lang: Lang): string {
  return { en: 'Founder & Rector', fa: 'بنیان‌گذار و رئیس', ps: 'بنسټګر او رئیس' }[lang];
}
function welcomeHeading(lang: Lang): string {
  return { en: 'Message from the Founder and Rector', fa: 'پیام بنیان‌گذار و رئیس پوهنتون', ps: 'د بنسټګر او رئیس پیغام' }[lang];
}
function welcomeMessage(lang: Lang): string {
  return {
    en: 'Engineer Folad Kabuli is an educator and engineer committed to expanding access to quality higher education for learners across Afghanistan and the Afghan diaspora. Through his vision for accessible, multilingual online learning, he established EFKGOU — Engineer Folad Kabuli Global Online University — with the aim of connecting talent with educational opportunity. EFKGOU aspires to create an inclusive learning environment where students can develop their knowledge, practical skills, critical thinking, and professional potential, regardless of where they live. We welcome learners who share our commitment to knowledge, personal development, and a better future through education.',
    fa: 'انجنیر فولاد کابلی، آموزگار و انجنیر، متعهد به گسترش دسترسی به آموزش عالی باکیفیت برای دانشجویان در سراسر افغانستان و جامعه افغان‌های مقیم خارج از کشور است. او با چشم‌انداز فراهم‌سازی آموزش آنلاینِ قابل‌دسترس و چندزبانه، پوهنتون آنلاین جهانی انجنیر فولاد کابلی (EFKGOU) را بنیان گذاشت تا زمینه پیوند میان استعداد و فرصت‌های آموزشی را فراهم سازد. EFKGOU در پی ایجاد محیطی فراگیر برای یادگیری است؛ محیطی که در آن دانشجویان بتوانند، بدون توجه به محل زندگی خود، دانش، مهارت‌های عملی، تفکر انتقادی و توانایی‌های مسلکی خویش را توسعه دهند. از همه علاقه‌مندان دانش، رشد فردی و ساختن آینده‌ای بهتر از راه آموزش استقبال می‌کنیم.',
    ps: 'انجنیر فولاد کابلي یو ښوونکی او انجنیر دی چې په ټول افغانستان او بهر مېشتو افغانانو کې د باکیفیته لوړو زده‌کړو د لاسرسي پراختیا ته ژمن دی. هغه د لاسرسي وړ او څوژبي آنلاین زده‌کړو د خپل لیدلوري له مخې د انجنیر فولاد کابلي نړیوال آنلاین پوهنتون (EFKGOU) بنسټ کېښود، څو استعدادونه له تعلیمي فرصتونو سره ونښلوي. EFKGOU هڅه کوي داسې ټول‌شموله زده‌کړیز چاپېریال رامنځته کړي چې زده‌کوونکي وکولای شي، د خپل استوګنځي له موقعیت پرته، خپله پوهه، عملي مهارتونه، انتقادي فکر او مسلکي وړتیاوې پیاوړې کړي. موږ هغو ټولو زده‌کوونکو ته ښه راغلاست وایو چې د پوهې، شخصي پرمختګ او د زده‌کړې له لارې د ښه راتلونکي جوړولو ژمنتیا لري.',
  }[lang];
}
function whatsappLabel(lang: Lang): string {
  return { en: 'Contact via WhatsApp', fa: 'تماس از طریق واتساپ', ps: 'د واټساپ له لارې اړیکه' }[lang];
}
function whatsappHint(lang: Lang): string {
  return { en: 'Available for student inquiries', fa: 'برای پرسش‌های دانشجویان در دسترس', ps: 'د زده‌کوونکو پوښتنو لپاره شتون لري' }[lang];
}
