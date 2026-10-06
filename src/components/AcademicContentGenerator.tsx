import { useState } from 'react';
import {
  FileText, Download, X, GraduationCap, BookOpen,
  List, Languages, Copyright, Sparkles, CheckCircle2,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { type Lang } from '@/lib/i18n';

const ARTICLES = [
  { id: 'ai-education', titleKey: 'article.ai', icon: '🤖' },
  { id: 'cyber-fundamentals', titleKey: 'article.cyber', icon: '🛡️' },
  { id: 'web-dev-trends', titleKey: 'article.web', icon: '⚡' },
  { id: 'network-security', titleKey: 'article.network', icon: '🌐' },
  { id: 'data-science-intro', titleKey: 'article.data', icon: '📊' },
  { id: 'english-academic', titleKey: 'article.english', icon: '🗣️' },
];

export default function AcademicContentGenerator() {
  const { lang } = useLang();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedArticle = ARTICLES.find((a) => a.id === selected);

  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            EFKGOU Academic Press
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {genTitle(lang)}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {genSubtitle(lang)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelected(a.id)}
              className="group bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">{a.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {articleTitle(lang, a.titleKey)}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {articleDesc(lang, a.titleKey)}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> 3 {langs(lang)}</span>
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> PDF</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
                <Download className="w-4 h-4" />
                {previewLabel(lang)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedArticle && (
        <ArticlePreviewModal
          lang={lang}
          title={articleTitle(lang, selectedArticle.titleKey)}
          icon={selectedArticle.icon}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function ArticlePreviewModal({
  lang, title, icon, onClose,
}: {
  lang: Lang;
  title: string;
  icon: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover page with EFKGOU logo */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-10 rounded-t-2xl text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <div className="text-sm font-semibold text-blue-200 mb-2">EFKGOU</div>
          <div className="text-xs text-blue-300/70 mb-6">{univName(lang)}</div>
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-sm text-blue-200/70">{coverSubtitle(lang)}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* President's message */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{presidentMsg(lang)}</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              {presidentText(lang)}
            </p>
          </div>

          {/* Table of contents */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{tocTitle(lang)}</h4>
            </div>
            <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {n}
                  </span>
                  {tocItem(lang, n)}
                </li>
              ))}
            </ol>
          </div>

          {/* 3 languages */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{langSection(lang)}</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['en', 'fa', 'ps'] as Lang[]).map((l) => (
                <div key={l} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {l === 'en' ? 'English' : l === 'fa' ? 'دری' : 'پښتو'}
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Copyright className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{copyrightTitle(lang)}</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {copyrightText(lang)}
            </p>
          </div>

          {/* Download button */}
          <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" />
            {downloadLabel(lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function genTitle(lang: Lang): string {
  return { en: 'Academic Content Generator', fa: 'مولد محتوای آکادمیک', ps: 'د علمي منځپانګې جنریټور' }[lang];
}
function genSubtitle(lang: Lang): string {
  return { en: 'Download standardized academic articles with EFKGOU branding, available in English, Dari, and Pashto.', fa: 'دانلود مقالات آکادمیک استاندارد با برندینگ EFKGOU، موجود به انگلیسی، دری و پښتو.', ps: 'د EFKGOU برانډینګ سره معیاري علمي مقالې ډاونلوډ کړئ، په انګلیسي، دری او پښتو کې شتمن.' }[lang];
}
function articleTitle(lang: Lang, key: string): string {
  const m: Record<string, { en: string; fa: string; ps: string }> = {
    'article.ai': { en: 'AI in Modern Education', fa: 'هوش مصنوعی در آموزش نوین', ps: 'په عصري زده‌کړه کې AI' },
    'article.cyber': { en: 'Cyber Security Fundamentals', fa: 'مبانی امنیت سایبری', ps: 'د سایبري امنیت بنسټونه' },
    'article.web': { en: 'Web Development Trends 2026', fa: 'رونده‌های توسعه وب ۲۰۲۶', ps: 'د ویب پراختیا رجحانات ۲۰۲۶' },
    'article.network': { en: 'Network Security Essentials', fa: 'ضروریات‌های امنیت شبکه', ps: 'د شبکې امنیت ضروریات' },
    'article.data': { en: 'Introduction to Data Science', fa: 'مقدمه‌ای بر علم داده', ps: 'د معلوماتو ساینس ته پېژندنه' },
    'article.english': { en: 'Academic English Writing Guide', fa: 'راهنمای نوشتن انگلیسی آکادمیک', ps: 'د علمي انګلیسي لیکلو لارښود' },
  };
  return m[key]?.[lang] ?? key;
}
function articleDesc(lang: Lang, key: string): string {
  const m: Record<string, { en: string; fa: string; ps: string }> = {
    'article.ai': { en: 'Exploring how AI transforms teaching and learning.', fa: 'بررسی چگونگی تحول هوش مصنوعی در تدریس و یادگیری.', ps: 'د AI څنګه تدریس او زده‌کړه بدلوي.' },
    'article.cyber': { en: 'Core principles of protecting digital systems.', fa: 'اصول اصلی محافظت از سیستم‌های دیجیتال.', ps: 'د ډیجیټل سیسټمونو ساتنې اصلي اصول.' },
    'article.web': { en: 'Latest frameworks and best practices in web dev.', fa: 'جدیدترین فریم‌ورک‌ها و بهترین شیوه‌های توسعه وب.', ps: 'په ویب پراختیا کې وروستي فریم‌ورکونه او غوره کړنې.' },
    'article.network': { en: 'Securing enterprise network infrastructure.', fa: 'امنیت زیرساخت شبکه سازمانی.', ps: 'د سازماني شبکې زیرساخت امنیت.' },
    'article.data': { en: 'Getting started with data analysis and ML.', fa: 'شروع با تحلیل داده و یادگیری ماشین.', ps: 'د معلوماتو تحلیل او ML سره پیل.' },
    'article.english': { en: 'A comprehensive guide to academic writing.', fa: 'راهنمای جامع برای نوشتن آکادمیک.', ps: 'د علمي لیکلو لپاره بشپړ لارښود.' },
  };
  return m[key]?.[lang] ?? key;
}
function previewLabel(lang: Lang): string {
  return { en: 'Preview & Download', fa: 'پیش‌نمایش و دانلود', ps: 'کتنه او ډاونلوډ' }[lang];
}
function langs(lang: Lang): string {
  return { en: 'Languages', fa: 'زبان‌ها', ps: 'ژبې' }[lang];
}
function univName(lang: Lang): string {
  return { en: 'Engineer Folad Kabuli Global Online University', fa: 'پوهنتون آنلاین جهانی انجنیر فولاد کابلی', ps: 'د انجنیر فولاد کابلي نړیوال آنلاین پوهنتون' }[lang];
}
function coverSubtitle(lang: Lang): string {
  return { en: 'Academic Research Paper', fa: 'مقاله پژوهشی آکادمیک', ps: 'علمي څیړنیزه مقاله' }[lang];
}
function presidentMsg(lang: Lang): string {
  return { en: "President's Message", fa: 'پیام رئیس', ps: 'د ریاست پیغام' }[lang];
}
function presidentText(lang: Lang): string {
  return {
    en: 'Knowledge is the bridge between where we are and where we dream to be. This publication reflects our commitment to academic excellence and accessible education for all.',
    fa: 'دانش پلی است میان آنجا که هستیم و آنجا که رویای رسیدن به آن را داریم. این نشریه بازتاب تعهد ما به تعالی آکادمیک و آموزش دسترس‌پذیر برای همه است.',
    ps: 'پوهنه هغه پل دی چې موږ له هغه ځای سره وصلوي چیرې چې یو او چیرې چې راتلونکی ورته لرل غواړو. دا خپرونه زموږ د علمي عالیت او د ټولو لپاره د لاسرسي وړ زده‌کړې ژمنې ښیي.',
  }[lang];
}
function tocTitle(lang: Lang): string {
  return { en: 'Table of Contents', fa: 'فهرست مطالب', ps: 'د منځپانګې جدول' }[lang];
}
function tocItem(lang: Lang, n: number): string {
  const items: Record<string, string[]> = {
    en: ['Introduction', 'Literature Review', 'Methodology', 'Analysis & Results', 'Conclusion & References'],
    fa: ['مقدمه', 'مروری بر ادبیات', 'روش‌شناسی', 'تحلیل و نتایج', 'نتیجه‌گیری و منابع'],
    ps: ['پیژندنه', 'د ادبیاتو بیاکتنه', 'د میتودولوژي', 'تحلیل او پایلې', 'پایله او سرچینې'],
  };
  return items[lang]?.[n - 1] ?? `Chapter ${n}`;
}
function langSection(lang: Lang): string {
  return { en: 'Available in 3 Languages', fa: 'موجود به ۳ زبان', ps: 'په ۳ ژبو کې شتمن' }[lang];
}
function copyrightTitle(lang: Lang): string {
  return { en: 'Copyright', fa: 'حق نشر', ps: 'د حقونو حق' }[lang];
}
function copyrightText(lang: Lang): string {
  return {
    en: `© ${new Date().getFullYear()} Engineer Folad Kabuli Global Online University. All rights reserved. No part of this publication may be reproduced without written permission.`,
    fa: `© ${new Date().getFullYear()} پوهنتون آنلاین جهانی انجنیر فولاد کابلی. تمامی حقوق محفوظ است. هیچ بخشی از این نشریه بدون اجازه کتبی بازتولید نمی‌شود.`,
    ps: `© ${new Date().getFullYear()} د انجنیر فولاد کابلي نړیوال آنلاین پوهنتون. ټول حقونه خوندي دي. د لیکلي اجازې پرته دا خپرونه بیا تولیدولی نشي.`,
  }[lang];
}
function downloadLabel(lang: Lang): string {
  return { en: 'Download PDF', fa: 'دانلود PDF', ps: 'PDF ډاونلوډ' }[lang];
}
