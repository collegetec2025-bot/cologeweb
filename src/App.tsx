import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { NavProvider, useNav } from '@/context/NavContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import DashboardNav from '@/components/DashboardNav';
import Home from '@/pages/Home';
import Programs from '@/pages/Programs';
import BSCSCurriculum from '@/pages/BSCSCurriculum';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import Dashboard from '@/pages/Dashboard';
import Portal from '@/pages/Portal';
import About from '@/pages/About';
import News from '@/pages/News';
import MediaLibrary from '@/pages/MediaLibrary';
import Contact from '@/pages/Contact';
import Auth from '@/pages/Auth';

function isDashboardRoute(name: string) {
  return name === 'dashboard' || name === 'dashboard-section';
}

function Pages() {
  const { route } = useNav();

  const showChrome = route.name !== 'login' && route.name !== 'signup';
  const isDashboard = isDashboardRoute(route.name);

  const render = () => {
    switch (route.name) {
      case 'home': return <Home />;
      case 'programs': return <Programs />;
      case 'bscs': return <BSCSCurriculum />;
      case 'courses': return <Courses />;
      case 'course': return <CourseDetail slug={route.slug} />;
      case 'dashboard': return <Dashboard />;
      case 'dashboard-section': return <Dashboard />;
      case 'portal': return <Portal />;
      case 'about': return <About />;
      case 'news': return <News />;
      case 'media': return <MediaLibrary />;
      case 'contact': return <Contact />;
      case 'login': return <Auth mode="login" />;
      case 'signup': return <Auth mode="signup" />;
      default: return <Home />;
    }
  };

  if (isDashboard) {
    return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNav />
          <main className="flex-1 overflow-y-auto">{render()}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {showChrome && <Header />}
      <main className="flex-1">{render()}</main>
      {showChrome && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NavProvider>
            <Pages />
          </NavProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
