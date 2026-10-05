import { useState, useEffect } from 'react';
import { Mail, MapPin, Globe, Send, CheckCircle2, Facebook, Youtube, MessageCircle, ExternalLink } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { SOCIAL_LINKS, fetchSocialSettings, socialLabel } from '@/lib/social';

export default function Contact() {
  const { lang } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  useEffect(() => {
    fetchSocialSettings().then((settings) => {
      const num = settings.social_whatsapp?.replace(/\D/g, '');
      if (num) setWhatsappUrl(`https://wa.me/${num}`);
    });
  }, []);

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

  const socialLinks = [
    { icon: Facebook, href: SOCIAL_LINKS.facebook, label: socialLabel(lang, 'facebook'), color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Youtube, href: SOCIAL_LINKS.youtube, label: socialLabel(lang, 'youtube'), color: 'bg-red-600 hover:bg-red-700' },
    ...(whatsappUrl ? [{ icon: MessageCircle, href: whatsappUrl, label: socialLabel(lang, 'whatsapp'), color: 'bg-emerald-600 hover:bg-emerald-700' }] : []),
    { icon: Mail, href: `mailto:${SOCIAL_LINKS.email}`, label: socialLabel(lang, 'email'), color: 'bg-slate-700 hover:bg-slate-800' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{t(lang, 'contact.title')}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t(lang, 'contact.subtitle')}</p>
        </div>

        {/* Social links bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {socialLinks.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm shadow-sm transition-all ${s.color}`}
              >
                <Icon className="w-4 h-4" />
                {s.label}
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            );
          })}
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
              <h3 className="font-semibold text-slate-900 mb-1">{t(lang, 'social.email')}</h3>
              <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-sm text-blue-600 hover:text-blue-700 transition-colors" dir="ltr">
                {SOCIAL_LINKS.email}
              </a>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Website</h3>
              <p className="text-sm text-slate-600">EFKGOU Online — {t(lang, 'footer.address')}</p>
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
                    {t(lang, 'contact.submit')}
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
