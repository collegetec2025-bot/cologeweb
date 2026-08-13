import { useEffect, useState } from 'react';
import {
  Image, Film, FileText, Network, Code2, ScanLine,
  Upload, Search, X, Download, Play,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, type MediaAsset } from '@/lib/supabase';
import { type Lang } from '@/lib/i18n';

const TYPE_CONFIG: Record<string, { icon: typeof Image; label: string; color: string; prefix: string }> = {
  IMG: { icon: Image, label: 'Images', color: 'blue', prefix: 'IMG' },
  VID: { icon: Film, label: 'Videos', color: 'rose', prefix: 'VID' },
  DOC: { icon: FileText, label: 'Documents', color: 'amber', prefix: 'DOC' },
  NET: { icon: Network, label: 'Network', color: 'emerald', prefix: 'NET' },
  COD: { icon: Code2, label: 'Code', color: 'violet', prefix: 'COD' },
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
};

export default function MediaScanner() {
  const { lang } = useLang();
  const { session } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState<MediaAsset | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    const { data } = await supabase.from('media_assets').select('*').order('file_type, file_number');
    setAssets((data as MediaAsset[]) ?? []);
    setLoading(false);
  };

  const filtered = assets.filter((a) => {
    const matchesType = activeType === 'all' || a.file_type === activeType;
    const matchesSearch = !search || a.file_name.toLowerCase().includes(search.toLowerCase()) || (a[`title_${lang}`] ?? a.title_en).toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const isStaff = session.profile?.role === 'instructor' || session.profile?.role === 'admin';

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
              {title(lang)}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle(lang)}
            </p>
          </div>
        </div>
        {isStaff && (
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{uploadLabel(lang)}</span>
          </button>
        )}
      </div>

      {/* Auto-scanner info banner */}
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <ScanLine className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-teal-800 dark:text-teal-300">{scannerInfoTitle(lang)}</p>
          <p className="text-xs text-teal-700 dark:text-teal-400 mt-1">{scannerInfoDesc(lang)}</p>
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveType('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeType === 'all'
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {allLabel(lang)} ({assets.length})
        </button>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
          const count = assets.filter((a) => a.file_type === type).length;
          const c = COLOR_MAP[cfg.color] ?? COLOR_MAP.blue;
          const Icon = cfg.icon;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                activeType === type
                  ? `${c.bg} ${c.text} ${c.border}`
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder(lang)}
          className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ScanLine className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{emptyLabel(lang)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((asset) => {
            const cfg = TYPE_CONFIG[asset.file_type] ?? TYPE_CONFIG.IMG;
            const c = COLOR_MAP[cfg.color] ?? COLOR_MAP.blue;
            const Icon = cfg.icon;
            return (
              <div
                key={asset.id}
                onClick={() => setSelected(asset)}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-800 transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {asset.thumbnail_url ? (
                    <img src={asset.thumbnail_url} alt={asset.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className={`w-full h-full ${c.bg} flex items-center justify-center`}>
                      <Icon className={`w-8 h-8 ${c.text}`} />
                    </div>
                  )}
                  {asset.file_type === 'VID' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                        <Play className="w-5 h-5 text-slate-700 ms-0.5" />
                      </div>
                    </div>
                  )}
                  <span className={`absolute top-2 start-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${c.bg} ${c.text}`}>
                    {asset.file_name}
                  </span>
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {(asset[`title_${lang}`] ?? asset.title_en) || asset.file_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {asset.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen && isStaff && (
        <UploadModal lang={lang} userId={session.user!.id} onClose={() => setUploadOpen(false)} onUploaded={loadAssets} />
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selected.file_name}</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {selected.thumbnail_url && (
                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                  <img src={selected.thumbnail_url} alt={selected.file_name} className="w-full h-full object-cover" />
                </div>
              )}
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                {selected[`title_${lang}`] ?? selected.title_en}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {selected.description_en}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <span>Category: {selected.category}</span>
                <span>Type: {selected.file_type}</span>
              </div>
              {selected.file_url && (
                <a
                  href={selected.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {downloadLabel(lang)}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadModal({
  lang, userId, onClose, onUploaded,
}: {
  lang: Lang;
  userId: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const fileType = form.get('file_type') as string;
    const fileName = form.get('file_name') as string;
    const fileNumber = Number(form.get('file_number'));
    const titleEn = form.get('title_en') as string;
    const titleFa = form.get('title_fa') as string || titleEn;
    const titlePs = form.get('title_ps') as string || titleEn;
    const descEn = form.get('description_en') as string || '';
    const category = form.get('category') as string || 'general';
    const fileUrl = form.get('file_url') as string || '';
    const thumbUrl = form.get('thumbnail_url') as string || '';

    try {
      const { error: err } = await supabase.from('media_assets').insert({
        file_name: fileName,
        file_type: fileType,
        file_number: fileNumber,
        file_url: fileUrl,
        thumbnail_url: thumbUrl,
        title_en: titleEn,
        title_fa: titleFa,
        title_ps: titlePs,
        description_en: descEn,
        category,
        uploaded_by: userId,
      });
      if (err) throw err;
      onUploaded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{uploadTitle(lang)}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
              <select name="file_type" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm">
                <option value="IMG">IMG</option>
                <option value="VID">VID</option>
                <option value="DOC">DOC</option>
                <option value="NET">NET</option>
                <option value="COD">COD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Number</label>
              <input name="file_number" type="number" min={1} max={100} defaultValue={1} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <input name="category" defaultValue="general" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">File Name</label>
            <input name="file_name" required placeholder="IMG_001.jpg" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title (EN)</label>
            <input name="title_en" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="title_fa" placeholder="Title (FA)" className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            <input name="title_ps" placeholder="Title (PS)" className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          </div>
          <textarea name="description_en" placeholder="Description" rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input name="file_url" placeholder="File URL (optional)" className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
            <input name="thumbnail_url" placeholder="Thumbnail URL (optional)" className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {cancelLabel(lang)}
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50">
              {saving ? '...' : saveLabel(lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function title(lang: Lang): string { return { en: 'Media Center & Auto-Scanner', fa: 'مرکز رسانه و اسکنر خودکار', ps: 'د رسنیو مرکز او خودکار سکینر' }[lang]; }
function subtitle(lang: Lang): string { return { en: 'Auto-registered media assets with dynamic DB indexing', fa: 'دارایی‌های رسانه‌ای خودکار با نمایه‌گذاری پویا DB', ps: 'د پوهې ډیټابیس سره د خپلکار ثبت شوي رسنیز شتمنۍ' }[lang]; }
function uploadLabel(lang: Lang): string { return { en: 'Upload Media', fa: 'آپلود رسانه', ps: 'رسنۍ اپلوډ کړئ' }[lang]; }
function scannerInfoTitle(lang: Lang): string { return { en: 'Auto-Scanner Active', fa: 'اسکنر خودکار فعال', ps: 'خودکار سکینر فعال' }[lang]; }
function scannerInfoDesc(lang: Lang): string { return { en: 'Files following IMG_001..100, VID_001..100, DOC_001..100, NET_001..100, COD_001..100 naming conventions are auto-registered, thumbnailed, indexed, and rendered without code changes.', fa: 'فایل‌های پیروی از قراردادهای نام‌گذاری IMG_001..100، VID_001..100، DOC_001..100، NET_001..100، COD_001..100 به‌طور خودکار ثبت، تصویر بندان، نمایه‌گذاری و نمایش داده می‌شوند بدون تغییر کد.', ps: 'د IMG_001..100، VID_001..100، DOC_001..100، NET_001..100، COD_001..100 د نوم‌اېښودنې قراردادونو پیروي کوونکي فایلونه په خپلکار ډول ثبت، تصویر بند، نمایه او بې د کوډ بدلون څخه ښودل کیږي.' }[lang]; }
function allLabel(lang: Lang): string { return { en: 'All', fa: 'همه', ps: 'ټول' }[lang]; }
function searchPlaceholder(lang: Lang): string { return { en: 'Search by file name or title...', fa: 'جستجو بر اساس نام فایل یا عنوان...', ps: 'د فایل نوم یا سرلیک له مخې لټوئ...' }[lang]; }
function emptyLabel(lang: Lang): string { return { en: 'No media assets found.', fa: 'هیچ دارایی رسانه‌ای یافت نشد.', ps: 'هیڅ رسنیزه شتمني ونه موندل شوه.' }[lang]; }
function downloadLabel(lang: Lang): string { return { en: 'Download', fa: 'دانلود', ps: 'ډاونلوډ' }[lang]; }
function uploadTitle(lang: Lang): string { return { en: 'Register New Media Asset', fa: 'ثبت دارایی رسانه‌ای جدید', ps: 'نوې رسنیزه شتمني ثبت کړئ' }[lang]; }
function cancelLabel(lang: Lang): string { return { en: 'Cancel', fa: 'لغو', ps: 'لغوه' }[lang]; }
function saveLabel(lang: Lang): string { return { en: 'Save', fa: 'ذخیره', ps: 'خوندي' }[lang]; }
