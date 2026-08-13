import { useState } from 'react';
import {
  Menu, Globe, Moon, Sun, LogOut, User, ChevronDown,
  Bell, Search, GraduationCap, LayoutDashboard,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';
import { LANGS, t, type Lang } from '@/lib/i18n';

export default function DashboardNav() {
  const { lang, setLang, dir } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { session, signOut } = useAuth();
  const { navigate, setSidebarOpen, route } = useNav();
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const pageTitle = (() => {
    if (route.name === 'dashboard') return t(lang, 'dash.title');
    if (route.name === 'dashboard-section') {
      return t(lang, 'dash.overview');
    }
    return t(lang, 'dash.title');
  })();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo (mobile) */}
        <button
          onClick={() => navigate({ name: 'home' })}
          className="lg:hidden flex items-center gap-2"
        >
          <img src="/logo.svg" alt="EFKGOU" className="w-8 h-8 rounded-lg shadow-sm" />
        </button>

        {/* Page title */}
        <h1 className="text-lg font-bold text-slate-800 dark:text-white flex-1 truncate">
          {pageTitle}
        </h1>

        {/* Search (desktop) */}
        <div className="hidden md:flex relative">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t(lang, 'courses.search')}
            className="w-48 lg:w-64 ps-9 pe-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={t(lang, 'darkmode')}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span className="hidden sm:inline">{LANGS.find((l) => l.code === lang)?.label}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className={`absolute top-full mt-1 ${dir === 'rtl' ? 'left-0' : 'right-0'} bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[140px] z-20`}>
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as Lang); setLangOpen(false); }}
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

        {/* User menu */}
        {session.user ? (
          <div className="relative">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-2 p-1 pe-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white text-sm font-semibold">
                {(session.profile?.full_name || session.user.email || '?').charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className={`absolute top-full mt-1 ${dir === 'rtl' ? 'left-0' : 'right-0'} bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[200px] z-20`}>
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {session.profile?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {session.user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => { navigate({ name: 'dashboard' }); setUserOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t(lang, 'nav.dashboard')}
                  </button>
                  <button
                    onClick={() => { setUserOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t(lang, 'nav.logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate({ name: 'login' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t(lang, 'nav.login')}</span>
          </button>
        )}
      </div>
    </header>
  );
}
