import { useState, useEffect, useCallback } from 'react';
import {
  Users, ShieldCheck, KeyRound, Search, Shield, GraduationCap, Presentation,
  UserCircle, Mail, Save, X, AlertCircle, Loader2, CheckCircle2,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/lib/services';
import type { Profile } from '@/lib/supabase';

type Tab = 'users' | 'roles' | 'permissions';

type RoleInfo = {
  key: Profile['role'];
  icon: typeof Shield;
  color: string;
  bg: string;
  text: string;
  ring: string;
};

const ROLES: RoleInfo[] = [
  { key: 'admin', icon: Shield, color: 'red', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-200 dark:ring-red-800' },
  { key: 'instructor', icon: Presentation, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-200 dark:ring-blue-800' },
  { key: 'student', icon: GraduationCap, color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800' },
];

const PERMISSION_MATRIX: { module: string; permissions: { key: string; label_en: string; label_fa: string; label_ps: string; roles: Profile['role'][] }[] }[] = [
  {
    module: 'Courses',
    permissions: [
      { key: 'course.view', label_en: 'View Courses', label_fa: 'مشاهده دروس', label_ps: 'د درسونو لیدنه', roles: ['admin', 'instructor', 'student'] },
      { key: 'course.create', label_en: 'Create Course', label_fa: 'ایجاد درس', label_ps: 'د درس جوړول', roles: ['admin', 'instructor'] },
      { key: 'course.edit', label_en: 'Edit Course', label_fa: 'ویرایش درس', label_ps: 'د درس سمون', roles: ['admin', 'instructor'] },
      { key: 'course.delete', label_en: 'Delete Course', label_fa: 'حذف درس', label_ps: 'د درس ړنګول', roles: ['admin'] },
    ],
  },
  {
    module: 'Enrollment',
    permissions: [
      { key: 'enroll.view', label_en: 'View Enrollments', label_fa: 'مشاهده ثبت‌نام', label_ps: 'د نوم لیکنې لیدنه', roles: ['admin', 'instructor', 'student'] },
      { key: 'enroll.manage', label_en: 'Manage Enrollments', label_fa: 'مدیریت ثبت‌نام', label_ps: 'د نوم لیکنې مدیریت', roles: ['admin', 'instructor'] },
    ],
  },
  {
    module: 'Gradebook',
    permissions: [
      { key: 'grade.view', label_en: 'View Grades', label_fa: 'مشاهده نمرات', label_ps: 'د نومرو لیدنه', roles: ['admin', 'instructor', 'student'] },
      { key: 'grade.edit', label_en: 'Edit Grades', label_fa: 'ویرایش نمرات', label_ps: 'د نومرو سمون', roles: ['admin', 'instructor'] },
    ],
  },
  {
    module: 'Finance',
    permissions: [
      { key: 'finance.view', label_en: 'View Finance', label_fa: 'مشاهده مالی', label_ps: 'د مالي لیدنه', roles: ['admin', 'student'] },
      { key: 'finance.manage', label_en: 'Manage Finance', label_fa: 'مدیریت مالی', label_ps: 'د مالي مدیریت', roles: ['admin'] },
    ],
  },
  {
    module: 'User Management',
    permissions: [
      { key: 'user.view', label_en: 'View Users', label_fa: 'مشاهده کاربران', label_ps: 'د کاروونکو لیدنه', roles: ['admin'] },
      { key: 'user.manage', label_en: 'Manage Users', label_fa: 'مدیریت کاربران', label_ps: 'د کاروونکو مدیریت', roles: ['admin'] },
    ],
  },
  {
    module: 'Audit',
    permissions: [
      { key: 'audit.view', label_en: 'View Audit Logs', label_fa: 'مشاهده لاگ‌های ممیزی', label_ps: 'د ممیزي لاګونو لیدنه', roles: ['admin'] },
    ],
  },
  {
    module: 'Media',
    permissions: [
      { key: 'media.view', label_en: 'View Media', label_fa: 'مشاهده رسانه', label_ps: 'د رسنیو لیدنه', roles: ['admin', 'instructor', 'student'] },
      { key: 'media.manage', label_en: 'Manage Media', label_fa: 'مدیریت رسانه', label_ps: 'د رسنیو مدیریت', roles: ['admin', 'instructor'] },
    ],
  },
];

const TAB_CONFIG: { key: Tab; icon: typeof Users; label_en: string; label_fa: string; label_ps: string }[] = [
  { key: 'users', icon: Users, label_en: 'Users', label_fa: 'کاربران', label_ps: 'کاروونکي' },
  { key: 'roles', icon: ShieldCheck, label_en: 'Roles', label_fa: 'نقش‌ها', label_ps: 'نقشونه' },
  { key: 'permissions', icon: KeyRound, label_en: 'Permissions', label_fa: 'مجوزها', label_ps: 'اجازې' },
];

function roleLabel(lang: 'en' | 'fa' | 'ps', role: Profile['role']): string {
  const labels = {
    admin: { en: 'Administrator', fa: 'مدیر', ps: 'مدیر' },
    instructor: { en: 'Instructor', fa: 'استاد', ps: 'ښوونکی' },
    student: { en: 'Student', fa: 'دانشجو', ps: 'زده‌کوونکی' },
  };
  return labels[role][lang];
}

function roleInfo(role: Profile['role']): RoleInfo {
  return ROLES.find((r) => r.key === role) ?? ROLES[2];
}

export default function UserManagementView({ initialTab }: { initialTab?: Tab }) {
  const { lang } = useLang();
  const { session } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab ?? 'users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Profile['role']>('student');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = session.profile?.role === 'admin';

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch {
      setError(lang === 'fa' ? 'خطا در بارگذاری کاربران' : lang === 'ps' ? 'د کاروونکو په بار کولو کې ستونزه' : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = users.filter((u) => {
    if (!search) return true;
    return u.full_name.toLowerCase().includes(search.toLowerCase());
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    instructors: users.filter((u) => u.role === 'instructor').length,
    students: users.filter((u) => u.role === 'student').length,
  };

  const startEdit = (user: Profile) => {
    setEditingUser(user);
    setEditName(user.full_name);
    setEditRole(user.role);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditName('');
    setEditRole('student');
  };

  const saveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    setError('');
    try {
      await userService.updateUserProfile(editingUser.id, { full_name: editName });
      if (editRole !== editingUser.role) {
        await userService.updateUserRole(editingUser.id, editRole);
      }
      setSuccess(lang === 'fa' ? 'کاربر با موفقیت به‌روزرسانی شد' : lang === 'ps' ? 'کاروونکی په بریالیتوب سره تازه شو' : 'User updated successfully');
      setEditingUser(null);
      await loadUsers();
    } catch {
      setError(lang === 'fa' ? 'خطا در به‌روزرسانی کاربر' : lang === 'ps' ? 'د کاروونکي په تازه کولو کې ستونزه' : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const tabLabel = (t: Tab) => {
    const cfg = TAB_CONFIG.find((c) => c.key === t)!;
    return lang === 'fa' ? cfg.label_fa : lang === 'ps' ? cfg.label_ps : cfg.label_en;
  };

  // ── Non-admin fallback ──────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
              {lang === 'fa' ? 'مدیریت کاربران' : lang === 'ps' ? 'د کاروونکو مدیریت' : 'User Management'}
            </h1>
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-amber-700 dark:text-amber-400 font-medium">
            {lang === 'fa' ? 'شما به این بخش دسترسی ندارید. فقط مدیران می‌توانند کاربران را مدیریت کنند.' : lang === 'ps' ? 'تاسو د دې برخې لاسرسی نلرئ. یوازې مدیران کولی شي کاروونکي مدیریت کړي.' : 'You do not have access to this section. Only administrators can manage users.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
            {lang === 'fa' ? 'مدیریت کاربران' : lang === 'ps' ? 'د کاروونکو مدیریت' : 'User Management'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {lang === 'fa' ? 'سیستم هسته و امنیت' : lang === 'ps' ? 'د سیسټم هسته او امنیت' : 'Core System & Security'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 w-fit">
        {TAB_CONFIG.map((cfg) => {
          const Icon = cfg.icon;
          const active = tab === cfg.key;
          return (
            <button
              key={cfg.key}
              onClick={() => setTab(cfg.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tabLabel(cfg.key)}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: lang === 'fa' ? 'کل کاربران' : lang === 'ps' ? 'ټول کاروونکي' : 'Total Users', value: stats.total, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
          { label: lang === 'fa' ? 'مدیران' : lang === 'ps' ? 'مدیران' : 'Administrators', value: stats.admins, icon: Shield, color: 'text-red-600 dark:text-red-400' },
          { label: lang === 'fa' ? 'اساتید' : lang === 'ps' ? 'ښوونکي' : 'Instructors', value: stats.instructors, icon: Presentation, color: 'text-blue-600 dark:text-blue-400' },
          { label: lang === 'fa' ? 'دانشجویان' : lang === 'ps' ? 'زده‌کوونکي' : 'Students', value: stats.students, icon: GraduationCap, color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
              <Icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* ── Users Tab ─────────────────────────────────── */}
      {tab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'fa' ? 'جستجوی کاربر...' : lang === 'ps' ? 'د کاروونکي لټون...' : 'Search users...'}
                className="w-full ps-9 pe-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">
                    {lang === 'fa' ? 'نام' : lang === 'ps' ? 'نوم' : 'Name'}
                  </th>
                  <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    {lang === 'fa' ? 'نقش' : lang === 'ps' ? 'نقش' : 'Role'}
                  </th>
                  <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">
                    {lang === 'fa' ? 'تاریخ عضویت' : lang === 'ps' ? 'د غړیتوب نېټه' : 'Joined'}
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                      {lang === 'fa' ? 'کاربری یافت نشد' : lang === 'ps' ? 'کاروونکی ونه موندل شو' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const ri = roleInfo(user.role);
                    const RoleIcon = ri.icon;
                    const isEditing = editingUser?.id === user.id;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-blue-400 outline-none text-sm text-slate-700 dark:text-slate-200 w-full max-w-xs"
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${ri.bg} flex items-center justify-center flex-shrink-0`}>
                                <UserCircle className={`w-5 h-5 ${ri.text}`} />
                              </div>
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.full_name || '—'}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as Profile['role'])}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-blue-400 outline-none text-sm text-slate-700 dark:text-slate-200"
                            >
                              <option value="student">{roleLabel(lang, 'student')}</option>
                              <option value="instructor">{roleLabel(lang, 'instructor')}</option>
                              <option value="admin">{roleLabel(lang, 'admin')}</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ri.bg} ${ri.text}`}>
                              <RoleIcon className="w-3 h-3" />
                              {roleLabel(lang, user.role)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                          {new Date(user.created_at).toLocaleDateString(lang === 'fa' ? 'fa-IR' : lang === 'ps' ? 'ps-AF' : 'en-US')}
                        </td>
                        <td className="px-4 py-3 text-end">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={saveUser}
                                disabled={saving}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                {lang === 'fa' ? 'ذخیره' : lang === 'ps' ? 'خوندي' : 'Save'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                {lang === 'fa' ? 'لغو' : lang === 'ps' ? 'لغوه' : 'Cancel'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(user)}
                              className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            >
                              {lang === 'fa' ? 'ویرایش' : lang === 'ps' ? 'سمون' : 'Edit'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Roles Tab ─────────────────────────────────── */}
      {tab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const count = users.filter((u) => u.role === role.key).length;
            const permissions = PERMISSION_MATRIX.flatMap((m) => m.permissions).filter((p) => p.roles.includes(role.key)).length;
            return (
              <div key={role.key} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className={`p-6 ${role.bg}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm mb-4`}>
                    <Icon className={`w-7 h-7 ${role.text}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{roleLabel(lang, role.key)}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {role.key === 'admin' && (lang === 'fa' ? 'دسترسی کامل به سیستم' : lang === 'ps' ? 'بشپړ لاسرسی' : 'Full system access')}
                    {role.key === 'instructor' && (lang === 'fa' ? 'مدیریت دروس و نمرات' : lang === 'ps' ? 'د درسونو او نومرو مدیریت' : 'Manage courses and grades')}
                    {role.key === 'student' && (lang === 'fa' ? 'ثبت‌نام و مشاهده نمرات' : lang === 'ps' ? 'نوم لیکنه او د نومرو لیدنه' : 'Enroll and view grades')}
                  </p>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{lang === 'fa' ? 'کاربران' : lang === 'ps' ? 'کاروونکي' : 'Users'}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{lang === 'fa' ? 'مجوزها' : lang === 'ps' ? 'اجازې' : 'Permissions'}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{permissions}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Permissions Tab ────────────────────────────── */}
      {tab === 'permissions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">
                    {lang === 'fa' ? 'مجوز' : lang === 'ps' ? 'اجازه' : 'Permission'}
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 py-3">
                    <Shield className="w-4 h-4 text-red-500 mx-auto" />
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 py-3">
                    <Presentation className="w-4 h-4 text-blue-500 mx-auto" />
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 py-3">
                    <GraduationCap className="w-4 h-4 text-emerald-500 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PERMISSION_MATRIX.map((mod) => (
                  <>
                    <tr key={mod.module} className="bg-slate-50/70 dark:bg-slate-800/20">
                      <td colSpan={4} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        {mod.module}
                      </td>
                    </tr>
                    {mod.permissions.map((perm) => (
                      <tr key={perm.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {lang === 'fa' ? perm.label_fa : lang === 'ps' ? perm.label_ps : perm.label_en}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{perm.key}</span>
                          </div>
                        </td>
                        {(['admin', 'instructor', 'student'] as const).map((role) => (
                          <td key={role} className="px-2 py-3 text-center">
                            {perm.roles.includes(role) ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-slate-300 dark:text-slate-700 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
