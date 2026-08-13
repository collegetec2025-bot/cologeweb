import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MenuKey, MenuItemKey } from '@/lib/menu';

export type Route =
  | { name: 'home' }
  | { name: 'programs' }
  | { name: 'bscs' }
  | { name: 'courses' }
  | { name: 'course'; slug: string }
  | { name: 'dashboard' }
  | { name: 'dashboard-section'; category: MenuKey; item: MenuItemKey }
  | { name: 'portal' }
  | { name: 'about' }
  | { name: 'news' }
  | { name: 'contact' }
  | { name: 'login' }
  | { name: 'signup' };

type Ctx = {
  route: Route;
  navigate: (r: Route) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeCategory: MenuKey | null;
  setActiveCategory: (k: MenuKey | null) => void;
};

const NavContext = createContext<Ctx | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MenuKey | null>(null);

  const navigate = (r: Route) => {
    setRoute(r);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavContext.Provider value={{
      route, navigate,
      sidebarOpen, setSidebarOpen,
      sidebarCollapsed, setSidebarCollapsed,
      activeCategory, setActiveCategory,
    }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
