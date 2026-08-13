import { GraduationCap, Mail, MapPin, Globe } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav, type Route } from '@/context/NavContext';
import { t } from '@/lib/i18n';

export default function Footer() {
  const { lang } = useLang();
  const { navigate } = useNav();

  const links: { label: string; route: Route }[] = [
    { label: t(lang, 'nav.home'), route: { name: 'home' } },
    { label: t(lang, 'nav.programs'), route: { name: 'programs' } },
    { label: t(lang, 'nav.courses'), route: { name: 'courses' } },
    { label: t(lang, 'nav.about'), route: { name: 'about' } },
    { label: t(lang, 'nav.contact'), route: { name: 'contact' } },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">EFKGOU</div>
                <div className="text-[10px] text-slate-400">{t(lang, 'footer.tagline')}</div>
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
                <MapPin className="w-4 h-4 text-blue-400" />
                {t(lang, 'footer.address')}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                info@efkgou.edu
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                www.efkgou.edu
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Engineer Folad Kabuli Global Online University. {t(lang, 'footer.rights')}
        </div>
      </div>
    </footer>
  );
}
