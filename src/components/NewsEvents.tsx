import { useEffect, useState } from 'react';
import { Calendar, MapPin, X, ArrowRight, Newspaper } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { supabase, type NewsEvent } from '@/lib/supabase';
import { t, type Lang } from '@/lib/i18n';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  news: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'News' },
  event: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Event' },
  announcement: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Announcement' },
};

export default function NewsEvents() {
  const { lang } = useLang();
  const [items, setItems] = useState<NewsEvent[]>([]);
  const [selected, setSelected] = useState<NewsEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('news_events')
        .select('*')
        .order('event_date', { ascending: false })
        .limit(6);
      setItems((data as NewsEvent[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const localizedTitle = (item: NewsEvent) => item[`title_${lang}`] ?? item.title_en;
  const localizedContent = (item: NewsEvent) => item[`content_${lang}`] ?? item.content_en;

  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">
            <Newspaper className="w-4 h-4" />
            EFKGOU
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {newsTitle(lang)}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {newsSubtitle(lang)}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-100 dark:bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const cat = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.news;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={localizedTitle(item)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-slate-700 flex items-center justify-center">
                        <Newspaper className="w-10 h-10 text-white/40" />
                      </div>
                    )}
                    <div className={`absolute top-3 end-3 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.bg} ${cat.text}`}>
                      {cat.label}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    {item.event_date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.event_date}
                        {item.location && (
                          <>
                            <span className="mx-1">·</span>
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{item.location}</span>
                          </>
                        )}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {localizedTitle(item)}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 flex-1">
                      {localizedContent(item)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 mt-4 group-hover:gap-2 transition-all">
                      {readMore(lang)}
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 overflow-hidden rounded-t-2xl">
              {selected.cover_image && (
                <img src={selected.cover_image} alt={localizedTitle(selected)} className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 end-4 w-9 h-9 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${CATEGORY_STYLES[selected.category]?.bg ?? ''} ${CATEGORY_STYLES[selected.category]?.text ?? ''}`}>
                {CATEGORY_STYLES[selected.category]?.label ?? 'News'}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {localizedTitle(selected)}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                {selected.event_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {selected.event_date}
                  </span>
                )}
                {selected.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {selected.location}
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {localizedContent(selected)}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function newsTitle(lang: Lang): string {
  return { en: 'Upcoming Events & Announcements', fa: 'رویدادهای پیش رو و اطلایه‌ها', ps: 'راتلونکې پیښې او اعلانونه' }[lang];
}
function newsSubtitle(lang: Lang): string {
  return {
    en: 'Stay informed about university news, faculty events, and important announcements.',
    fa: 'از اخبار دانشگاه، رویدادهای دانشکده و اطلایه‌های مهم مطلع بمانید.',
    ps: 'د پوهنتون خبرونو، د پوهنځي پیښو او مهمو اعلانونو څخه باخبر اوسئ.',
  }[lang];
}
function readMore(lang: Lang): string {
  return { en: 'Read more', fa: 'بیشتر بخوانید', ps: 'نور ولولئ' }[lang];
}
