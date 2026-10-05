import { useState, useEffect, useCallback } from 'react';
import { X, Upload, Trash2, Play, ImageIcon, Video, Filter } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t, type Lang } from '@/lib/i18n';

type MediaItem = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  caption_en: string;
  caption_fa: string;
  caption_ps: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  sort_order: number;
};

type VideoItem = {
  id: string;
  title_en: string;
  title_fa: string;
  title_ps: string;
  description_en: string;
  description_fa: string;
  description_ps: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  published: boolean;
};

const CATEGORIES = [
  'university', 'leadership', 'education', 'computer-science', 'it-networking',
  'cctv-security', 'cybersecurity', 'ai', 'graphic-design', 'online-classes',
  'events', 'videos',
];

function catLabel(lang: Lang, cat: string): string {
  const labels: Record<string, Record<string, string>> = {
    en: {
      university: 'University', leadership: 'Rector / Leadership', education: 'Education',
      'computer-science': 'Computer Science', 'it-networking': 'IT & Networking',
      'cctv-security': 'CCTV & Smart Security', cybersecurity: 'Cybersecurity',
      ai: 'Artificial Intelligence', 'graphic-design': 'Graphic Design',
      'online-classes': 'Online Classes', events: 'Events', videos: 'Videos',
    },
    fa: {
      university: 'دانشگاه', leadership: 'رهبر / رئیس', education: 'آموزش',
      'computer-science': 'علوم کامپیوتر', 'it-networking': 'فناوری اطلاعات و شبکه',
      'cctv-security': 'دوربین مداربسته و امنیت', cybersecurity: 'امنیت سایبری',
      ai: 'هوش مصنوعی', 'graphic-design': 'طراحی گرافیک',
      'online-classes': 'کلاس‌های آنلاین', events: 'رویدادها', videos: 'ویدیوها',
    },
    ps: {
      university: 'پوهنتون', leadership: 'رئیس / مشرتوب', education: 'زده‌کړه',
      'computer-science': 'کمپیوټر ساینس', 'it-networking': 'آیټي او شبکه',
      'cctv-security': 'سیسيټي‌وی او امنیت', cybersecurity: 'سایبر امنیت',
      ai: 'مصنوعي هوش', 'graphic-design': 'ګرافیک ډیزاین',
      'online-classes': 'آنلاین ټولګي', events: 'پیښې', videos: 'ویډیوګانې',
    },
  };
  return labels[lang]?.[cat] ?? labels.en[cat] ?? cat;
}

function locTitle(lang: Lang, item: { title_en: string; title_fa: string; title_ps: string }): string {
  return item[`title_${lang}`] || item.title_en;
}

function locDesc(lang: Lang, item: Record<string, string>): string {
  return item[`description_${lang}`] || item[`caption_${lang}`] || item.description_en || item.caption_en || '';
}

export default function MediaLibrary() {
  const { lang } = useLang();
  const { session } = useAuth();
  const isAdmin = session.profile?.role === 'admin' || session.profile?.role === 'instructor';

  const [tab, setTab] = useState<'images' | 'videos'>('images');
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [videoPlayer, setVideoPlayer] = useState<VideoItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadImages = useCallback(async () => {
    const { data } = await supabase.from('gallery_images').select('*').order('sort_order');
    setImages((data as MediaItem[]) ?? []);
  }, []);

  const loadVideos = useCallback(async () => {
    const { data } = await supabase.from('video_gallery').select('*').eq('published', true).order('sort_order');
    setVideos((data as VideoItem[]) ?? []);
  }, []);

  useEffect(() => {
    Promise.all([loadImages(), loadVideos()]).then(() => setLoading(false));
  }, [loadImages, loadVideos]);

  const filteredImages = activeCat === 'all' ? images : images.filter((i) => i.category === activeCat);
  const filteredVideos = activeCat === 'all' ? videos : videos.filter((v) => v.category === activeCat);

  const handleDeleteImage = async (id: string) => {
    if (!confirm(t(lang, 'media.delete.confirm'))) return;
    await supabase.from('gallery_images').delete().eq('id', id);
    loadImages();
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm(t(lang, 'media.delete.confirm'))) return;
    await supabase.from('video_gallery').delete().eq('id', id);
    loadVideos();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-3">{t(lang, 'media.title')}</h1>
          <p className="text-lg text-blue-100/80">{t(lang, 'media.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('images')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                tab === 'images' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              {t(lang, 'media.images')}
            </button>
            <button
              onClick={() => setTab('videos')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                tab === 'videos' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Video className="w-4 h-4" />
              {t(lang, 'media.videos')}
            </button>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {t(lang, 'media.upload')}
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 me-2">
            <Filter className="w-4 h-4" />
          </span>
          <button
            onClick={() => setActiveCat('all')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCat === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t(lang, 'media.all')}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCat === cat ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {catLabel(lang, cat)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : tab === 'images' ? (
          filteredImages.length === 0 ? (
            <div className="text-center py-20 text-slate-400">{t(lang, 'media.empty')}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((img) => (
                <div key={img.id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => setLightbox(img)}>
                    {img.thumbnail_url || img.image_url ? (
                      <img src={img.thumbnail_url || img.image_url} alt={locTitle(lang, img)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <ImageIcon className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-slate-800 truncate">{locTitle(lang, img)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{catLabel(lang, img.category)}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-2 end-2 w-8 h-8 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          filteredVideos.length === 0 ? (
            <div className="text-center py-20 text-slate-400">{t(lang, 'media.empty')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((vid) => (
                <div key={vid.id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-video overflow-hidden cursor-pointer relative bg-slate-900" onClick={() => setVideoPlayer(vid)}>
                    {vid.thumbnail_url ? (
                      <img src={vid.thumbnail_url} alt={locTitle(lang, vid)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-blue-700 ms-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-slate-800 truncate">{locTitle(lang, vid)}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{(vid as unknown as Record<string, string>)[`description_${lang}`] || vid.description_en}</p>
                    <p className="text-xs text-slate-400 mt-2">{catLabel(lang, vid.category)}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="absolute top-2 end-2 w-8 h-8 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={locTitle(lang, lightbox)} className="max-w-full max-h-[80vh] rounded-lg object-contain mx-auto" />
            <div className="text-center mt-4 text-white">
              <p className="text-lg font-semibold">{locTitle(lang, lightbox)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video player */}
      {videoPlayer && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setVideoPlayer(null)}>
          <button className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {videoPlayer.video_url.endsWith('.mp4') || videoPlayer.video_url.endsWith('.webm') || videoPlayer.video_url.endsWith('.ogg') ? (
                <video src={videoPlayer.video_url} controls autoPlay className="w-full h-full" />
              ) : (
                <iframe src={videoPlayer.video_url} className="w-full h-full" allowFullScreen title={locTitle(lang, videoPlayer)} />
              )}
            </div>
            <div className="text-center mt-4 text-white">
              <p className="text-lg font-semibold">{locTitle(lang, videoPlayer)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && isAdmin && (
        <UploadModal lang={lang} tab={tab} onClose={() => setShowUpload(false)} onUploaded={() => { loadImages(); loadVideos(); }} />
      )}
    </div>
  );
}

function UploadModal({ lang, tab, onClose, onUploaded }: {
  lang: Lang;
  tab: 'images' | 'videos';
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [titleEn, setTitleEn] = useState('');
  const [titleFa, setTitleFa] = useState('');
  const [titlePs, setTitlePs] = useState('');
  const [descEn, setDescEn] = useState('');
  const [category, setCategory] = useState('university');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError(t(lang, 'media.upload.no_file')); return; }

    setUploading(true);
    setError('');

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${tab === 'images' ? 'images' : 'videos'}/${fileName}`;

      const { error: uploadErr } = await supabase.storage.from('efkgou-media').upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('efkgou-media').getPublicUrl(filePath);
      const url = urlData.publicUrl;

      if (tab === 'images') {
        const { error: dbErr } = await supabase.from('gallery_images').insert({
          title_en: titleEn,
          title_fa: titleFa || titleEn,
          title_ps: titlePs || titleEn,
          caption_en: descEn,
          caption_fa: descEn,
          caption_ps: descEn,
          image_url: url,
          thumbnail_url: url,
          category,
        });
        if (dbErr) throw dbErr;
      } else {
        const { error: dbErr } = await supabase.from('video_gallery').insert({
          title_en: titleEn,
          title_fa: titleFa || titleEn,
          title_ps: titlePs || titleEn,
          description_en: descEn,
          description_fa: descEn,
          description_ps: descEn,
          video_url: url,
          thumbnail_url: '',
          category,
          published: true,
          access_level: 'public',
          language: 'en',
        });
        if (dbErr) throw dbErr;
      }

      setSuccess(true);
      onUploaded();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(lang, 'media.upload.error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{t(lang, 'media.upload.title')}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {success ? (
            <div className="text-center py-8">
              <p className="text-sm font-medium text-emerald-600">{t(lang, 'media.upload.success')}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'media.upload.file')}</label>
                <input
                  type="file"
                  accept={tab === 'images' ? 'image/*' : 'video/*'}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'media.upload.title_label')} (EN)</label>
                <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title (FA)</label>
                  <input value={titleFa} onChange={(e) => setTitleFa(e.target.value)} dir="rtl" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title (PS)</label>
                  <input value={titlePs} onChange={(e) => setTitlePs(e.target.value)} dir="rtl" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'media.upload.desc')} (EN)</label>
                <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t(lang, 'media.upload.category')}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 outline-none text-sm">
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{catLabel(lang, cat)}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">
                  {t(lang, 'media.upload.cancel')}
                </button>
                <button type="submit" disabled={uploading} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                  {uploading ? '...' : t(lang, 'media.upload.save')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
