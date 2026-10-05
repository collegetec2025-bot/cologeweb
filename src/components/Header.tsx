import { useState } from 'react';
import { GraduationCap, Menu, X, Globe, LogIn, LogOut, LayoutDashboard, Shield, Moon, Sun } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useNav, type Route } from '@/context/NavContext';
import { t, LANGS, type Lang } from '@/lib/i18n';

export default function Header() {
  const { lang, setLang, dir } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { session, signOut } = useAuth();
  const { route, navigate } = useNav();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isAuthed = !!session.user;
  const isInstructor = session.profile?.role === 'instructor' || session.profile?.role === 'admin';

  const navItems: { label: string; route: Route }[] = [
    { label: t(lang, 'nav.home'), route: { name: 'home' } },
    { label: t(lang, 'nav.programs'), route: { name: 'programs' } },
    { label: t(lang, 'nav.courses'), route: { name: 'courses' } },
    { label: t(lang, 'nav.news'), route: { name: 'news' } },
    { label: t(lang, 'nav.media'), route: { name: 'media' } },
    { label: t(lang, 'nav.about'), route: { name: 'about' } },
    { label: t(lang, 'nav.contact'), route: { name: 'contact' } },
  ];

  const isActive = (r: Route) => r.name === route.name;

  const go = (r: Route) => {
    navigate(r);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => go({ name: 'home' })} className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="EFKGOU" className="w-10 h-10 rounded-xl shadow-md group-hover:shadow-lg transition-shadow" />
            <div className="text-start">
              <div className="text-sm font-bold text-slate-800 dark:text-white leading-tight">EFKGOU</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{t(lang, 'footer.tagline')}</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item.route)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.route)
                    ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title={t(lang, 'darkmode')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{LANGS.find((l) => l.code === lang)?.label}</span>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className={`absolute top-full mt-1 ${dir === 'rtl' ? 'left-0' : 'right-0'} bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[140px] z-20`}>
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code as Lang);
                          setLangOpen(false);
                        }}
                        className={`w-full text-start px-4 py-2 text-sm transition-colors ${
                          lang === l.code ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Auth buttons */}
            {isAuthed ? (
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => go({ name: 'dashboard' })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">{t(lang, 'nav.dashboard')}</span>
                </button>
                {isInstructor && (
                  <button
                    onClick={() => go({ name: 'portal' })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden md:inline">{t(lang, 'nav.portal')}</span>
                  </button>
                )}
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => go({ name: 'login' })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  {t(lang, 'nav.login')}
                </button>
                <button
                  onClick={() => go({ name: 'signup' })}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors dark:hover:bg-blue-500"
                >
                  {t(lang, 'nav.signup')}
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => go(item.route)}
                className={`block w-full text-start px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.route) ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              {isAuthed ? (
                <>
                  <button onClick={() => go({ name: 'dashboard' })} className="flex items-center gap-2 w-full text-start px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <LayoutDashboard className="w-4 h-4" /> {t(lang, 'nav.dashboard')}
                  </button>
                  {isInstructor && (
                    <button onClick={() => go({ name: 'portal' })} className="flex items-center gap-2 w-full text-start px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Shield className="w-4 h-4" /> {t(lang, 'nav.portal')}
                    </button>
                  )}
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 w-full text-start px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                    <LogOut className="w-4 h-4" /> {t(lang, 'nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => go({ name: 'login' })} className="flex items-center gap-2 w-full text-start px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <LogIn className="w-4 h-4" /> {t(lang, 'nav.login')}
                  </button>
                  <button onClick={() => go({ name: 'signup' })} className="block w-full text-center px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500">
                    {t(lang, 'nav.signup')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
