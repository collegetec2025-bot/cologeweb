import { useState } from 'react';
import { GraduationCap, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';

export default function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const { lang } = useLang();
  const { navigate } = useNav();
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    try {
      if (isSignup) {
        const fullName = form.get('full_name') as string;
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (err) throw err;
        await refreshProfile();
        navigate({ name: 'dashboard' });
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        await refreshProfile();
        navigate({ name: 'dashboard' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t(lang, 'auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isSignup ? t(lang, 'auth.signup.title') : t(lang, 'auth.login.title')}
          </h1>
          <p className="text-blue-200/80 text-sm">
            {isSignup ? t(lang, 'auth.signup.subtitle') : t(lang, 'auth.login.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'auth.fullname')}</label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-slate-400" />
                  <input name="full_name" required className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'auth.email')}</label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-slate-400" />
                <input name="email" type="email" required className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'auth.password')}</label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-slate-400" />
                <input name="password" type="password" required minLength={6} className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? '...' : isSignup ? t(lang, 'auth.submit.signup') : t(lang, 'auth.submit.login')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => navigate({ name: isSignup ? 'login' : 'signup' })}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignup ? t(lang, 'auth.switch.login') : t(lang, 'auth.switch.signup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
