import { useState } from 'react';
import { Mail, MapPin, Globe, Send, CheckCircle2 } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';

export default function Contact() {
  const { lang } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const { error: err } = await supabase.from('inquiries').insert({
      name: form.get('name') as string,
      email: form.get('email') as string,
      subject: form.get('subject') as string || '',
      message: form.get('message') as string,
    });
    setSubmitting(false);
    if (err) {
      setError(t(lang, 'contact.error'));
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{t(lang, 'contact.title')}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t(lang, 'contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{t(lang, 'footer.contact')}</h3>
              <p className="text-sm text-slate-600">{t(lang, 'footer.address')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
              <p className="text-sm text-slate-600">info@efkgou.edu</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Website</h3>
              <p className="text-sm text-slate-600">www.efkgou.edu</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              {success ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-800">{t(lang, 'contact.success')}</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'contact.name')}</label>
                      <input name="name" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'contact.email')}</label>
                      <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'contact.subject')}</label>
                    <input name="subject" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'contact.message')}</label>
                    <textarea name="message" required rows={5} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none" />
                  </div>
                  {error && <p className="text-sm text-rose-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? '...' : t(lang, 'contact.submit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
