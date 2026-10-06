import { useState, useEffect } from 'react';
import { Mail, MapPin, Globe, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav, type Route } from '@/context/NavContext';
import { t } from '@/lib/i18n';
import { SOCIAL_LINKS, fetchSocialSettings, socialLabel } from '@/lib/social';

export default function Footer() {
  const { lang } = useLang();
  const { navigate } = useNav();
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  useEffect(() => {
    fetchSocialSettings().then((settings) => {
      const num = settings.social_whatsapp?.replace(/\D/g, '');
      if (num) setWhatsappUrl(`https://wa.me/${num}`);
    });
  }, []);

  const links: { label: string; route: Route }[] = [
    { label: t(lang, 'nav.home'), route: { name: 'home' } },
    { label: t(lang, 'nav.programs'), route: { name: 'programs' } },
    { label: t(lang, 'nav.courses'), route: { name: 'courses' } },
    { label: t(lang, 'nav.media'), route: { name: 'media' } },
    { label: t(lang, 'nav.about'), route: { name: 'about' } },
    { label: t(lang, 'nav.contact'), route: { name: 'contact' } },
  ];

  const socials = [
    { icon: Facebook, href: SOCIAL_LINKS.facebook, label: socialLabel(lang, 'facebook'), color: 'hover:bg-blue-600' },
    { icon: Youtube, href: SOCIAL_LINKS.youtube, label: socialLabel(lang, 'youtube'), color: 'hover:bg-red-600' },
    ...(whatsappUrl ? [{ icon: MessageCircle, href: whatsappUrl, label: socialLabel(lang, 'whatsapp'), color: 'hover:bg-emerald-600' }] : []),
    { icon: Mail, href: `mailto:${SOCIAL_LINKS.email}`, label: socialLabel(lang, 'email'), color: 'hover:bg-slate-600' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="EFKGOU Logo" className="w-10 h-10 rounded-xl shadow-md" />
              <div>
                <div className="text-sm font-bold text-white">EFKGOU</div>
                <div className="text-[10px] text-slate-400 leading-tight max-w-[200px]">{t(lang, 'footer.tagline')}</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {t(lang, 'hero.subtitle')}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t(lang, 'footer.quicklinks')}</h4>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.label}>
                  <button onClick={() => navigate(l.route)} className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t(lang, 'footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                {t(lang, 'footer.address')}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href={`mailto:${SOCIAL_LINKS.email}`} className="hover:text-blue-400 transition-colors" dir="ltr">
                  {SOCIAL_LINKS.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-slate-400">EFKGOU Online</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t(lang, 'footer.follow')}</h4>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 ${s.color} hover:text-white transition-all`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Engineer Folad Kabuli Global Online University. {t(lang, 'footer.rights')}
        </div>
      </div>
    </footer>
  );
}
