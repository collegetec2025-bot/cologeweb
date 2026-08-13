import { useEffect, useState } from 'react';
import { ScrollText, Search, Shield, Activity, Database } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { auditService } from '@/lib/services';
import type { AuditLog, Profile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { type Lang } from '@/lib/i18n';

export default function AuditLogView() {
  const { lang } = useLang();
  const { session } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [profiles, setProfiles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const [logData, profData] = await Promise.all([
          auditService.getLogs(100),
          supabase.from('profiles').select('id, full_name'),
        ]);
        setLogs(logData);
        const map = new Map<string, string>();
        for (const p of (profData.data as Profile[]) ?? []) {
          map.set(p.id, p.full_name);
        }
        setProfiles(map);
      } catch { /* admin-only */ }
      setLoading(false);
    })();
  }, []);

  const isAdmin = session.profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{accessDenied(lang)}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{adminOnlyMsg(lang)}</p>
      </div>
    );
  }

  const actions = [...new Set(logs.map((l) => l.action.split('.')[0]))];

  const filtered = logs.filter((l) => {
    const matchesSearch = !search || l.action.toLowerCase().includes(search.toLowerCase()) || (l.entity_type?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesAction = actionFilter === 'all' || l.action.startsWith(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md">
          <ScrollText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{title(lang)}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle(lang)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <Activity className="w-5 h-5 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{logs.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{totalLogs(lang)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <Database className="w-5 h-5 text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{actions.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{categoriesLabel(lang)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <Shield className="w-5 h-5 text-amber-500 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{logs.filter((l) => l.action.includes('delete')).length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{deletions(lang)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder(lang)}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-slate-400 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm text-slate-700 dark:text-slate-200"
        >
          <option value="all">{allActions(lang)}</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Log table */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">{loadingLabel(lang)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          <ScrollText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{emptyLogs(lang)}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3">{actionLabel(lang)}</th>
                  <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3 hidden sm:table-cell">{userLabel(lang)}</th>
                  <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3 hidden md:table-cell">{entityLabel(lang)}</th>
                  <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-4 py-3">{timeLabel(lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                        log.action.includes('delete') ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' :
                        log.action.includes('create') ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                        log.action.includes('update') ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                      {log.user_id ? (profiles.get(log.user_id) ?? log.user_id.slice(0, 8)) : 'system'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {log.entity_type || '—'}
                      {log.entity_id && <span className="text-xs text-slate-400 block font-mono">{log.entity_id.slice(0, 8)}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function title(lang: Lang): string { return { en: 'Audit Logs', fa: 'لاگ‌های ممیزی', ps: 'د ممیزي لاګونه' }[lang]; }
function subtitle(lang: Lang): string { return { en: 'System activity and change tracking', fa: 'فعالیت سیستم و ردیابی تغییرات', ps: 'د سیسټم فعالیت او د بدلونونو څارنه' }[lang]; }
function totalLogs(lang: Lang): string { return { en: 'Total Logs', fa: 'مجموع لاگ‌ها', ps: 'ټول لاګونه' }[lang]; }
function categoriesLabel(lang: Lang): string { return { en: 'Categories', fa: 'دسته‌بندی‌ها', ps: 'کټګورۍ' }[lang]; }
function deletions(lang: Lang): string { return { en: 'Deletions', fa: 'حذف‌ها', ps: 'ړنګول' }[lang]; }
function searchPlaceholder(lang: Lang): string { return { en: 'Search actions...', fa: 'جستجوی اقدامات...', ps: 'د عملونو لټون...' }[lang]; }
function allActions(lang: Lang): string { return { en: 'All Actions', fa: 'همه اقدامات', ps: 'ټول عملونه' }[lang]; }
function actionLabel(lang: Lang): string { return { en: 'Action', fa: 'اقدام', ps: 'عمل' }[lang]; }
function userLabel(lang: Lang): string { return { en: 'User', fa: 'کاربر', ps: 'کاروونکی' }[lang]; }
function entityLabel(lang: Lang): string { return { en: 'Entity', fa: 'موجودیت', ps: 'موجودیت' }[lang]; }
function timeLabel(lang: Lang): string { return { en: 'Time', fa: 'زمان', ps: 'وخت' }[lang]; }
function loadingLabel(lang: Lang): string { return { en: 'Loading...', fa: 'در حال بارگذاری...', ps: 'د بارولو په حال کې...' }[lang]; }
function emptyLogs(lang: Lang): string { return { en: 'No audit logs found.', fa: 'لاگ ممیزی یافت نشد.', ps: 'هیڅ ممیزي لاګ ونه موندل شو.' }[lang]; }
function accessDenied(lang: Lang): string { return { en: 'Access Denied', fa: 'دسترسی ممنوع', ps: 'د لاسرسي رد شوی' }[lang]; }
function adminOnlyMsg(lang: Lang): string { return { en: 'Audit logs are only available to administrators.', fa: 'لاگ‌های ممیزی فقط برای مدیران در دسترس است.', ps: 'د ممیزي لاګونه یوازې د مدیرانو لپاره شتون لري.' }[lang]; }
