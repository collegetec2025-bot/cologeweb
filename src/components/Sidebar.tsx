import { useState } from 'react';
import {
  ChevronDown, ChevronRight, PanelLeftClose, PanelLeft, X,
  GraduationCap, LogOut, Home,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';
import { MENU, COLOR_CLASSES, menuLabel, type MenuKey } from '@/lib/menu';
import { t } from '@/lib/i18n';

export default function Sidebar() {
  const { lang, dir } = useLang();
  const { session, signOut } = useAuth();
  const {
    navigate, route,
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    activeCategory, setActiveCategory,
  } = useNav();
  const [search, setSearch] = useState('');

  const isOnDashboard = route.name === 'dashboard' || route.name === 'dashboard-section';

  const toggleCategory = (key: MenuKey) => {
    setActiveCategory(activeCategory === key ? null : key);
  };

  const handleItemClick = (category: MenuKey, item: string) => {
    navigate({ name: 'dashboard-section', category, item: item as never });
  };

  const filteredMenu = MENU.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => {
      if (!search) return true;
      const label = menuLabel(lang, item.key).toLowerCase();
      const catLabel = menuLabel(lang, cat.key).toLowerCase();
      return label.includes(search.toLowerCase()) || catLabel.includes(search.toLowerCase());
    }),
  })).filter((cat) => cat.items.length > 0);

  const collapseIcon = dir === 'rtl' ? (sidebarCollapsed ? PanelLeft : PanelLeftClose) : (sidebarCollapsed ? PanelLeft : PanelLeftClose);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 z-50 lg:z-30
          h-screen flex-shrink-0
          bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800
          flex flex-col
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
          ${sidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${dir === 'rtl' ? (sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0') : ''}
        `}
      >
        {/* Logo header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={() => navigate({ name: 'home' })}
            className="flex items-center gap-2.5 flex-1 min-w-0"
          >
            <img src="/logo.svg" alt="EFKGOU" className="w-9 h-9 rounded-lg shadow-sm flex-shrink-0" />
            {!sidebarCollapsed && (
              <div className="text-start min-w-0">
                <div className="text-sm font-bold text-slate-800 dark:text-white truncate">EFKGOU</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t(lang, 'footer.tagline')}</div>
              </div>
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(lang, 'courses.search')}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {/* Home link */}
          <button
            onClick={() => navigate({ name: 'home' })}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors
              ${route.name === 'home'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
            `}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{t(lang, 'nav.home')}</span>}
          </button>

          {/* Dashboard link */}
          <button
            onClick={() => navigate({ name: 'dashboard' })}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors
              ${isOnDashboard && route.name === 'dashboard'
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
            `}
          >
            <GraduationCap className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{t(lang, 'dash.title')}</span>}
          </button>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          {/* Categories */}
          {filteredMenu.map((cat) => {
            const colors = COLOR_CLASSES[cat.color] ?? COLOR_CLASSES.blue;
            const isActiveCat = activeCategory === cat.key;
            const isOnSection = route.name === 'dashboard-section' && route.category === cat.key;
            const CatIcon = cat.icon;

            return (
              <div key={cat.key} className="mb-0.5">
                <button
                  onClick={() => toggleCategory(cat.key)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isOnSection
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <CatIcon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-start truncate">{menuLabel(lang, cat.key)}</span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isActiveCat ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* Items */}
                {isActiveCat && !sidebarCollapsed && (
                  <div className="mt-1 mb-2 ps-4 space-y-0.5 animate-slide-in">
                    {cat.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isOnItem = route.name === 'dashboard-section' && route.item === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleItemClick(cat.key, item.key)}
                          className={`
                            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                            ${isOnItem
                              ? `${colors.bg} ${colors.text} font-medium`
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'}
                          `}
                        >
                          <ItemIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{menuLabel(lang, item.key)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex-shrink-0">
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-2"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-5 h-5 flex-shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5 flex-shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* User */}
          {session.user && !sidebarCollapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {(session.profile?.full_name || session.user.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  {session.profile?.full_name || 'User'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {session.user.email}
                </div>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title={t(lang, 'nav.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
