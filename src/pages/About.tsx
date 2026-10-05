import { Target, Eye, GraduationCap, Award, Globe, Users, Facebook, Youtube, Mail } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';
import { SOCIAL_LINKS, socialLabel } from '@/lib/social';

export default function About() {
  const { lang } = useLang();

  const values = [
    { icon: Globe, title: t(lang, 'about.vision.title'), body: t(lang, 'about.vision.body') },
    { icon: Target, title: t(lang, 'about.mission.title'), body: t(lang, 'about.mission.body') },
  ];

  const socials = [
    { icon: Facebook, href: SOCIAL_LINKS.facebook, label: socialLabel(lang, 'facebook') },
    { icon: Youtube, href: SOCIAL_LINKS.youtube, label: socialLabel(lang, 'youtube') },
    { icon: Mail, href: `mailto:${SOCIAL_LINKS.email}`, label: socialLabel(lang, 'email') },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="w-14 h-14 text-blue-300 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t(lang, 'about.title')}</h1>
          <p className="text-lg text-blue-100/80 leading-relaxed">{t(lang, 'about.subtitle')}</p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-1 flex justify-center">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-200 shadow-xl bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center">
                <img src="/folad.svg" alt={t(lang, 'about.founder.name')} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{t(lang, 'about.founder.title')}</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-4">{t(lang, 'about.founder.name')}</h2>
              <p className="text-slate-600 leading-relaxed text-lg">{t(lang, 'about.founder.bio')}</p>
              <div className="flex items-center gap-3 mt-6">
                {socials.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-600 hover:text-white flex items-center justify-center transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{v.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: '12,450+', label: t(lang, 'hero.stat.students') },
              { icon: Award, value: '180+', label: t(lang, 'hero.stat.courses') },
              { icon: GraduationCap, value: '6', label: t(lang, 'hero.stat.faculties') },
              { icon: Globe, value: '34', label: t(lang, 'hero.stat.countries') },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label}>
                  <Icon className="w-8 h-8 text-blue-200 mx-auto mb-3" />
                  <div className="text-3xl font-bold">{s.value}</div>
                  <div className="text-sm text-blue-200/80 mt-1">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
