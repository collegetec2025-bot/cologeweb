import type { Lang } from '@/lib/i18n';
import {
  Settings, Shield, ShieldCheck, KeyRound, Users, Languages, Moon, ScrollText, Lock, DatabaseBackup,
  Building2, GraduationCap, CalendarDays, Award,
  ClipboardList, UserCircle, CreditCard as IdCardIcon, FileText,
  MonitorPlay, Video, BookOpen, FileCheck, Trophy,
  Presentation, FlaskConical, BarChart3,
  Newspaper, Calendar, Megaphone, PenSquare,
  Image, Film, Headphones, FolderOpen, ScanLine,
  Library, BookMarked, Microscope,
  Wallet, Receipt, CreditCard, Banknote, Gift,
  LifeBuoy, Ticket, CalendarClock, Briefcase, GraduationCap as GradIcon,
  Brain, Languages as LangIcon, Activity, Server,
  type LucideIcon,
} from 'lucide-react';

export type MenuKey =
  | 'core' | 'university' | 'academic' | 'admission' | 'lms' | 'teaching'
  | 'cms' | 'media' | 'library' | 'finance' | 'services' | 'infrastructure';

export type MenuItemKey =
  | 'auth' | 'users' | 'roles' | 'permissions' | 'audit-logs' | 'mfa' | 'ip-restriction'
  | 'university-profile' | 'trustees' | 'calendar' | 'accreditation'
  | 'bscs-program' | 'syllabi' | 'departments'
  | 'registration' | 'student-profile' | 'id-cards' | 'transcripts'
  | 'live-classes' | 'recorded-classes' | 'assignments' | 'quizzes' | 'gradebook' | 'certificates'
  | 'teacher-schedule' | 'grading' | 'research-supervision'
  | 'articles' | 'events' | 'announcements' | 'blog' | 'media-scanner'
  | 'gallery' | 'video-library' | 'audio-library' | 'document-manager'
  | 'digital-books' | 'thesis' | 'journals' | 'conferences'
  | 'tuition' | 'invoices' | 'payments' | 'payroll' | 'scholarships'
  | 'helpdesk' | 'support-tickets' | 'career-center' | 'alumni'
  | 'academic-reports' | 'financial-reports' | 'ai-assistant' | 'ai-translation' | 'backups' | 'monitoring'
  | 'language' | 'darkmode';

export type MenuCategory = {
  key: MenuKey;
  icon: LucideIcon;
  color: string;
  items: { key: MenuItemKey; icon: LucideIcon }[];
};

export const MENU: MenuCategory[] = [
  {
    key: 'core', icon: Settings, color: 'blue',
    items: [
      { key: 'auth', icon: Shield },
      { key: 'users', icon: Users },
      { key: 'roles', icon: ShieldCheck },
      { key: 'permissions', icon: KeyRound },
      { key: 'audit-logs', icon: ScrollText },
      { key: 'mfa', icon: Lock },
      { key: 'ip-restriction', icon: Shield },
      { key: 'language', icon: Languages },
      { key: 'darkmode', icon: Moon },
    ],
  },
  {
    key: 'university', icon: Building2, color: 'emerald',
    items: [
      { key: 'university-profile', icon: Building2 },
      { key: 'trustees', icon: Users },
      { key: 'calendar', icon: CalendarDays },
      { key: 'accreditation', icon: Award },
    ],
  },
  {
    key: 'academic', icon: GraduationCap, color: 'amber',
    items: [
      { key: 'bscs-program', icon: GraduationCap },
      { key: 'syllabi', icon: BookOpen },
      { key: 'departments', icon: FolderOpen },
    ],
  },
  {
    key: 'admission', icon: ClipboardList, color: 'violet',
    items: [
      { key: 'registration', icon: ClipboardList },
      { key: 'student-profile', icon: UserCircle },
      { key: 'id-cards', icon: IdCardIcon },
      { key: 'transcripts', icon: FileText },
    ],
  },
  {
    key: 'lms', icon: MonitorPlay, color: 'rose',
    items: [
      { key: 'live-classes', icon: MonitorPlay },
      { key: 'recorded-classes', icon: Video },
      { key: 'assignments', icon: BookOpen },
      { key: 'quizzes', icon: FileCheck },
      { key: 'gradebook', icon: BarChart3 },
      { key: 'certificates', icon: Trophy },
    ],
  },
  {
    key: 'teaching', icon: Presentation, color: 'cyan',
    items: [
      { key: 'teacher-schedule', icon: CalendarDays },
      { key: 'grading', icon: FileCheck },
      { key: 'research-supervision', icon: FlaskConical },
    ],
  },
  {
    key: 'cms', icon: Newspaper, color: 'orange',
    items: [
      { key: 'articles', icon: PenSquare },
      { key: 'events', icon: Calendar },
      { key: 'announcements', icon: Megaphone },
      { key: 'blog', icon: Newspaper },
      { key: 'media-scanner', icon: ScanLine },
    ],
  },
  {
    key: 'media', icon: Image, color: 'teal',
    items: [
      { key: 'gallery', icon: Image },
      { key: 'video-library', icon: Film },
      { key: 'audio-library', icon: Headphones },
      { key: 'document-manager', icon: FolderOpen },
    ],
  },
  {
    key: 'library', icon: Library, color: 'green',
    items: [
      { key: 'digital-books', icon: BookMarked },
      { key: 'thesis', icon: FileText },
      { key: 'journals', icon: BookOpen },
      { key: 'conferences', icon: Microscope },
    ],
  },
  {
    key: 'finance', icon: Wallet, color: 'indigo',
    items: [
      { key: 'tuition', icon: Wallet },
      { key: 'invoices', icon: Receipt },
      { key: 'payments', icon: CreditCard },
      { key: 'payroll', icon: Banknote },
      { key: 'scholarships', icon: Gift },
    ],
  },
  {
    key: 'services', icon: LifeBuoy, color: 'fuchsia',
    items: [
      { key: 'helpdesk', icon: LifeBuoy },
      { key: 'support-tickets', icon: Ticket },
      { key: 'career-center', icon: Briefcase },
      { key: 'alumni', icon: GradIcon },
    ],
  },
  {
    key: 'infrastructure', icon: Server, color: 'slate',
    items: [
      { key: 'academic-reports', icon: BarChart3 },
      { key: 'financial-reports', icon: BarChart3 },
      { key: 'ai-assistant', icon: Brain },
      { key: 'ai-translation', icon: LangIcon },
      { key: 'backups', icon: DatabaseBackup },
      { key: 'monitoring', icon: Activity },
    ],
  },
];

export const COLOR_CLASSES: Record<string, { bg: string; text: string; ring: string; gradient: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-200 dark:ring-blue-800', gradient: 'from-blue-500 to-blue-700' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800', gradient: 'from-emerald-500 to-emerald-700' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-800', gradient: 'from-amber-500 to-amber-700' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-800', gradient: 'from-violet-500 to-violet-700' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-200 dark:ring-rose-800', gradient: 'from-rose-500 to-rose-700' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-200 dark:ring-cyan-800', gradient: 'from-cyan-500 to-cyan-700' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-800', gradient: 'from-orange-500 to-orange-700' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-400', ring: 'ring-teal-200 dark:ring-teal-800', gradient: 'from-teal-500 to-teal-700' },
  green: { bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-200 dark:ring-green-800', gradient: 'from-green-500 to-green-700' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-200 dark:ring-indigo-800', gradient: 'from-indigo-500 to-indigo-700' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800/40', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-200 dark:ring-slate-700', gradient: 'from-slate-500 to-slate-700' },
  fuchsia: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', text: 'text-fuchsia-600 dark:text-fuchsia-400', ring: 'ring-fuchsia-200 dark:ring-fuchsia-800', gradient: 'from-fuchsia-500 to-fuchsia-700' },
};

type LabelMap = Record<MenuKey | MenuItemKey, { en: string; fa: string; ps: string }>;

export const MENU_LABELS: LabelMap = {
  // Categories (V3.0 Enterprise)
  core: { en: 'Core System & Security', fa: 'هسته سیستم و امنیت', ps: 'د سیسټم هسته او امنیت' },
  university: { en: 'University Governance', fa: 'حاکمیت دانشگاه', ps: 'د پوهنتون حاکمیت' },
  academic: { en: 'Academic & Curriculum', fa: 'آکادمیک و نصاب', ps: 'علمي او نصاب' },
  admission: { en: 'Admission & SIS', fa: 'پذیرش و سیستم دانشجویی', ps: 'نوم لیکنه او د زده‌کوونکي سیسټم' },
  lms: { en: 'LMS & Virtual Classroom', fa: 'سیستم یادگیری و کلاس مجازی', ps: 'د زده‌کړې سیسټم او مجازي ټولګی' },
  teaching: { en: 'Faculty & Teaching Portal', fa: 'پورتال اساتید و تدریس', ps: 'د ښوونکو پورتال او تدریس' },
  cms: { en: 'CMS & News Portal', fa: 'مدیریت محتوا و پورتال اخبار', ps: 'د منځپانګې مدیریت او د خبرونو پورتال' },
  media: { en: 'Media Center & Digital Assets', fa: 'مرکز رسانه و دارایی‌های دیجیتال', ps: 'د رسنیو مرکز او ډیجیټل شتمنۍ' },
  library: { en: 'Library & Research Hub', fa: 'کتابخانه و مرکز پژوهش', ps: 'کتابتون او د څیړنې مرکز' },
  finance: { en: 'Finance & HR Management', fa: 'مالی و مدیریت منابع انسانی', ps: 'مالي او د بشري منابعو مدیریت' },
  services: { en: 'Services & Student Affairs', fa: 'خدمات و امور دانشجویان', ps: 'خدمات او د زده‌کوونکو چارې' },
  infrastructure: { en: 'Infrastructure & AI', fa: 'زیرساخت و هوش مصنوعی', ps: 'زیربنا او AI' },

  // Core items
  auth: { en: 'Authentication', fa: 'احراز هویت', ps: 'د هویت تایید' },
  users: { en: 'Users', fa: 'کاربران', ps: 'کاروونکي' },
  roles: { en: 'Roles', fa: 'نقش‌ها', ps: 'نقشونه' },
  permissions: { en: 'Permissions (500+)', fa: 'مجوزها (۵۰۰+)', ps: 'اجازې (۵۰۰+)' },
  'audit-logs': { en: 'Audit Logs', fa: 'لاگ‌های ممیزی', ps: 'د ممیزي لاګونه' },
  mfa: { en: 'Multi-Factor Auth', fa: 'احراز هویت چندمرحله‌ای', ps: 'څو مرحله‌ای هویت تایید' },
  'ip-restriction': { en: 'IP Restriction', fa: 'محدودیت IP', ps: 'د IP محدودیت' },
  language: { en: 'Multi-language (FA/PS/EN)', fa: 'چندزبانه (فا/پس/ان)', ps: 'څو ژبني (فا/پس/ان)' },
  darkmode: { en: 'Dark Mode', fa: 'حالت تاریک', ps: 'توره کچه' },

  // University Governance
  'university-profile': { en: 'University Profile', fa: 'پروفایل دانشگاه', ps: 'د پوهنتون پروفایل' },
  trustees: { en: 'Trustees', fa: 'متولیان', ps: 'متولیان' },
  calendar: { en: 'Academic Calendar', fa: 'تقویم آکادمیک', ps: 'اکاډمیک کلیز' },
  accreditation: { en: 'Accreditation', fa: 'اعتبارسنجی', ps: 'د باور وړتیا' },

  // Academic & Curriculum
  'bscs-program': { en: 'BSCS 4-Year Program', fa: 'برنامه ۴ ساله BSCS', ps: 'د ۴ کلن BSCS پروګرام' },
  syllabi: { en: 'Syllabi', fa: 'سیلابس‌ها', ps: 'سیلابسي' },
  departments: { en: 'Department Management', fa: 'مدیریت دیپارتمنت', ps: 'د دیپارټمنټ مدیریت' },

  // Admission
  registration: { en: 'Online Registration', fa: 'ثبت‌نام آنلاین', ps: 'آنلاین نوم لیکنه' },
  'student-profile': { en: 'Student Profiles', fa: 'پروفایل دانشجویان', ps: 'د زده‌کوونکو پروفایلونه' },
  'id-cards': { en: 'ID Cards', fa: 'کارت‌های شناسایی', ps: 'د پیژندلو کارتونه' },
  transcripts: { en: 'Transcripts', fa: 'ریزنمرات', ps: 'د نومرو رپورټونه' },

  // LMS
  'live-classes': { en: 'Live Classes', fa: 'کلاس‌های زنده', ps: 'ژوندۍ ټولګي' },
  'recorded-classes': { en: 'Recorded Lectures', fa: 'سخوانی‌های ضبط‌شده', ps: ' ثبت شوي ویناوي' },
  assignments: { en: 'Homework', fa: 'تکالیف', ps: 'ټولګې' },
  quizzes: { en: 'Quizzes', fa: 'آزمون‌ها', ps: 'ازمویښتونه' },
  gradebook: { en: 'Gradebook', fa: 'دفتر نمرات', ps: 'د نومرو کتاب' },
  certificates: { en: 'Certificates', fa: 'گواهینامه‌ها', ps: 'تصدیق‌لیکونه' },

  // Teaching
  'teacher-schedule': { en: 'Teacher Schedules', fa: 'برنامه اساتید', ps: 'د ښوونکو مهالویش' },
  grading: { en: 'Grading', fa: 'نمره‌دهی', ps: 'د نمرې ورکول' },
  'research-supervision': { en: 'Research Supervision', fa: 'نظارت پژوهشی', ps: 'د څیړنې څارنه' },

  // CMS
  articles: { en: 'Articles', fa: 'مقالات', ps: 'مقالې' },
  events: { en: 'Events', fa: 'رویدادها', ps: 'پیښې' },
  announcements: { en: 'Announcements', fa: 'اطلاعیه‌ها', ps: 'اعلانونه' },
  blog: { en: 'Blog', fa: 'وبلاگ', ps: 'بلاګ' },
  'media-scanner': { en: 'Media Scanner Integration', fa: 'یکپارچه‌سازی اسکنر رسانه', ps: 'د رسنیو سکینر یوځای کول' },

  // Media
  gallery: { en: 'Gallery', fa: 'گالری', ps: 'ګالري' },
  'video-library': { en: 'Video Library', fa: 'کتابخانه ویدیو', ps: 'د ویډیو کتابتون' },
  'audio-library': { en: 'Audio Library', fa: 'کتابخانه صوتی', ps: 'د غږ کتابتون' },
  'document-manager': { en: 'Document Repository', fa: 'مخزن اسناد', ps: 'د اسنادو ذخیره' },

  // Library
  'digital-books': { en: 'Digital Books', fa: 'کتاب‌های دیجیتال', ps: 'ډیجیټلي کتابونه' },
  thesis: { en: 'Thesis', fa: 'پایان‌نامه', ps: ' پایې نامه' },
  journals: { en: 'Academic Journals', fa: 'ژورنال‌های آکادمیک', ps: 'علمي ژورنالونه' },
  conferences: { en: 'Conferences', fa: 'کنفرانس‌ها', ps: 'کنفرانسونه' },

  // Finance
  tuition: { en: 'Tuition Fees', fa: 'شهریه', ps: 'د زده‌کړې فیس' },
  invoices: { en: 'Invoices', fa: 'فاکتورها', ps: 'فاکتورونه' },
  payments: { en: 'Online Payments', fa: 'پرداخت‌های آنلاین', ps: 'آنلاین تادیات' },
  payroll: { en: 'Payroll', fa: 'حقوق و دستمزد', ps: 'تنخواړه' },
  scholarships: { en: 'Scholarships', fa: 'بورسیه‌ها', ps: 'بورسونه' },

  // Services
  helpdesk: { en: 'Help Desk', fa: 'میز کمک', ps: 'د مرستې میز' },
  'support-tickets': { en: 'Support Tickets', fa: 'تیکت‌های پشتیبانی', ps: 'د ملاتړ ټیکټونه' },
  'career-center': { en: 'Career Center', fa: 'مرکز مسلکی', ps: 'د مسلک مرکز' },
  alumni: { en: 'Alumni Network', fa: 'شبکه فارغ‌التحصیلان', ps: 'د فارغ‌التحصیلانو شبکه' },

  // Infrastructure & AI
  'academic-reports': { en: 'Academic Dashboards', fa: 'داشبوردهای آکادمیک', ps: 'اکاډمیک ډشبورډونه' },
  'financial-reports': { en: 'Financial Dashboards', fa: 'داشبوردهای مالی', ps: 'مالي ډشبورډونه' },
  'ai-assistant': { en: 'AI Assistant', fa: 'دستیار هوشمند', ps: 'د AI مرستندوی' },
  'ai-translation': { en: 'AI Translation', fa: 'ترجمه هوشمند', ps: 'د AI ژباړه' },
  backups: { en: 'Backup & Recovery', fa: 'پشتیبان‌گیری و بازیابی', ps: 'بیک اپ او بیا رغونه' },
  monitoring: { en: 'System Monitoring', fa: 'نظارت سیستم', ps: 'د سیسټم څارنه' },
};

export function menuLabel(lang: Lang, key: MenuKey | MenuItemKey): string {
  const entry = MENU_LABELS[key];
  return entry ? entry[lang] : key;
}

// BSCS 4-Year International Curriculum
export type Semester = {
  semester: number;
  year: number;
  courses: { code: string; title_en: string; title_fa: string; title_ps: string; credits: number; type: 'core' | 'elective' | 'lab' }[];
};

export const BSCS_CURRICULUM: Semester[] = [
  {
    semester: 1, year: 1,
    courses: [
      { code: 'CS101', title_en: 'Introduction to Programming', title_fa: 'مقدمه‌ای بر برنامه‌نویسی', title_ps: 'د پروګرام کولو پیل', credits: 4, type: 'core' },
      { code: 'MATH101', title_en: 'Calculus I', title_fa: 'حسابان I', title_ps: 'کلیکولس I', credits: 3, type: 'core' },
      { code: 'ENG101', title_en: 'Academic English', title_fa: 'انگلیسی آکادمیک', title_ps: 'علمي انګلیسي', credits: 3, type: 'core' },
      { code: 'CS101L', title_en: 'Programming Lab', title_fa: 'آزمایشگاه برنامه‌نویسی', title_ps: 'د پروګرام ازمایښتګاه', credits: 1, type: 'lab' },
      { code: 'IS101', title_en: 'Intro to Information Systems', title_fa: 'مقدمه‌ای بر سیستم‌های اطلاعاتی', title_ps: 'د معلوماتو سیسټمونو پېژندنه', credits: 3, type: 'core' },
    ],
  },
  {
    semester: 2, year: 1,
    courses: [
      { code: 'CS102', title_en: 'Object-Oriented Programming', title_fa: 'برنامه‌نویسی شیءگرا', title_ps: 'د شیء پر بنسټ پروګرام کول', credits: 4, type: 'core' },
      { code: 'MATH102', title_en: 'Calculus II', title_fa: 'حسابان II', title_ps: 'کلیکولس II', credits: 3, type: 'core' },
      { code: 'PHYS101', title_en: 'Physics I', title_fa: 'فیزیک I', title_ps: 'فزیک I', credits: 3, type: 'core' },
      { code: 'CS102L', title_en: 'OOP Lab', title_fa: 'آزمایشگاه OOP', title_ps: 'د OOP ازمایښتګاه', credits: 1, type: 'lab' },
      { code: 'CS103', title_en: 'Discrete Mathematics', title_fa: 'ریاضیات گسسته', title_ps: 'غیر منقطع ریاضي', credits: 3, type: 'core' },
    ],
  },
  {
    semester: 3, year: 2,
    courses: [
      { code: 'CS201', title_en: 'Data Structures & Algorithms', title_fa: 'ساختار داده و الگوریتم‌ها', title_ps: 'د معلوماتو جوړښتونه او الګوریتمونه', credits: 4, type: 'core' },
      { code: 'CS202', title_en: 'Digital Logic Design', title_fa: 'طراحی منطق دیجیتال', title_ps: 'ډیجیټل منطق ډیزاین', credits: 3, type: 'core' },
      { code: 'MATH201', title_en: 'Linear Algebra', title_fa: 'جبر خطی', title_ps: 'خطي الجبرا', credits: 3, type: 'core' },
      { code: 'CS201L', title_en: 'Data Structures Lab', title_fa: 'آزمایشگاه ساختار داده', title_ps: 'د معلوماتو جوړښت ازمایښتګاه', credits: 1, type: 'lab' },
      { code: 'STAT201', title_en: 'Probability & Statistics', title_fa: 'احتمالات و آمار', title_ps: 'احتمال او احصایه', credits: 3, type: 'core' },
    ],
  },
  {
    semester: 4, year: 2,
    courses: [
      { code: 'CS203', title_en: 'Operating Systems', title_fa: 'سیستم‌های عامل', title_ps: 'عملیاتي سیسټمونه', credits: 4, type: 'core' },
      { code: 'CS204', title_en: 'Computer Architecture', title_fa: 'معماری کامپیوتر', title_ps: 'د کمپیوتر معمارۍ', credits: 3, type: 'core' },
      { code: 'CS205', title_en: 'Database Systems', title_fa: 'سیستم‌های پایگاه داده', title_ps: 'د ډیټابیس سیسټمونه', credits: 4, type: 'core' },
      { code: 'CS205L', title_en: 'Database Lab', title_fa: 'آزمایشگاه پایگاه داده', title_ps: 'د ډیټابیس ازمایښتګاه', credits: 1, type: 'lab' },
      { code: 'CS206', title_en: 'Software Engineering', title_fa: 'مهندسی نرم‌افزار', title_ps: 'د سافټویر انجنیري', credits: 3, type: 'core' },
    ],
  },
  {
    semester: 5, year: 3,
    courses: [
      { code: 'CS301', title_en: 'Computer Networks', title_fa: 'شبکه‌های رایانه‌ای', title_ps: 'د کمپیوتر شبکې', credits: 4, type: 'core' },
      { code: 'CS302', title_en: 'Web Development', title_fa: 'توسعه وب', title_ps: 'د ویب پراختیا', credits: 4, type: 'core' },
      { code: 'CS303', title_en: 'Theory of Computation', title_fa: 'نظریه محاسبه', title_ps: 'د محاسبې نظریه', credits: 3, type: 'core' },
      { code: 'CS304', title_en: 'Artificial Intelligence', title_fa: 'هوش مصنوعی', title_ps: 'مصنوعي هوښیارتیا', credits: 3, type: 'core' },
      { code: 'CS305', title_en: 'Mobile App Development', title_fa: 'توسعه اپلیکیشن موبایل', title_ps: 'د موبایل غوښتنلیک پراختیا', credits: 3, type: 'elective' },
    ],
  },
  {
    semester: 6, year: 3,
    courses: [
      { code: 'CS306', title_en: 'Cyber Security', title_fa: 'امنیت سایبری', title_ps: 'سایبري امنیت', credits: 4, type: 'core' },
      { code: 'CS307', title_en: 'Machine Learning', title_fa: 'یادگیری ماشین', title_ps: 'د ماشین زده کول', credits: 4, type: 'core' },
      { code: 'CS308', title_en: 'Computer Graphics', title_fa: 'گرافیک کامپیوتر', title_ps: 'د کمپیوتر گرافیک', credits: 3, type: 'elective' },
      { code: 'CS309', title_en: 'Cloud Computing', title_fa: 'رایانش ابری', title_ps: 'د وروڼو محاسبه', credits: 3, type: 'elective' },
      { code: 'CS310', title_en: 'Human-Computer Interaction', title_fa: 'تعامل انسان-کامپیوتر', title_ps: 'د انسان-کمپیوتر تعامل', credits: 3, type: 'core' },
    ],
  },
  {
    semester: 7, year: 4,
    courses: [
      { code: 'CS401', title_en: 'Final Year Project I', title_fa: 'پروژه نهایی I', title_ps: 'د وروستي کال پروژه I', credits: 3, type: 'core' },
      { code: 'CS402', title_en: 'Data Science & Big Data', title_fa: 'علم داده و کلان‌داده', title_ps: 'د معلوماتو ساینس او لوی معلومات', credits: 4, type: 'core' },
      { code: 'CS403', title_en: 'Distributed Systems', title_fa: 'سیستم‌های توزیع‌شده', title_ps: 'وېشل شوي سیسټمونه', credits: 3, type: 'core' },
      { code: 'CS404', title_en: 'Blockchain Technology', title_fa: 'فناوری بلاکچین', title_ps: 'د بلاکچین ټیکنالوژي', credits: 3, type: 'elective' },
      { code: 'CS405', title_en: 'DevOps & CI/CD', title_fa: 'DevOps و CI/CD', title_ps: 'DevOps او CI/CD', credits: 3, type: 'elective' },
    ],
  },
  {
    semester: 8, year: 4,
    courses: [
      { code: 'CS406', title_en: 'Final Year Project II', title_fa: 'پروژه نهایی II', title_ps: 'د وروستي کال پروژه II', credits: 4, type: 'core' },
      { code: 'CS407', title_en: 'Deep Learning', title_fa: 'یادگیری عمیق', title_ps: 'ژور زده کول', credits: 4, type: 'core' },
      { code: 'CS408', title_en: 'Natural Language Processing', title_fa: 'پردازش زبان طبیعی', title_ps: 'د طبیعي ژبې پروسس', credits: 3, type: 'elective' },
      { code: 'CS409', title_en: 'Professional Ethics', title_fa: 'اخلاق حرفه‌ای', title_ps: 'د مسلک اخلاق', credits: 2, type: 'core' },
      { code: 'CS410', title_en: 'Startup & Entrepreneurship', title_fa: 'استارتاپ و کارآفرینی', title_ps: 'سټارټ اپ او کارپالنه', credits: 3, type: 'elective' },
    ],
  },
];

export function bscsTitle(lang: Lang): string {
  return { en: 'BSCS 4-Year International Curriculum', fa: 'برنامه ۴ ساله بین‌المللی BSCS', ps: 'د ۴ کلن نړیوال BSCS نصاب' }[lang];
}
