import { useState } from 'react';
import {
  Search, Plus, Filter, Download, MoreVertical, ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useNav } from '@/context/NavContext';
import { MENU, COLOR_CLASSES, menuLabel, type MenuKey, type MenuItemKey } from '@/lib/menu';
import { t } from '@/lib/i18n';
import MediaScanner from '@/components/MediaScanner';
import GradebookView from '@/components/GradebookView';
import FinanceView from '@/components/FinanceView';
import TicketsView from '@/components/TicketsView';
import CalendarView from '@/components/CalendarView';
import AuditLogView from '@/components/AuditLogView';
import IdCardView from '@/components/IdCardView';
import AICenter from '@/components/AICenter';
import UserManagementView from '@/components/UserManagementView';

export default function DashboardSectionContent({
  category, item,
}: {
  category: MenuKey;
  item: MenuItemKey;
}) {
  const { lang, dir } = useLang();
  const { navigate, setActiveCategory } = useNav();
  const cat = MENU.find((c) => c.key === category);
  const itemDef = cat?.items.find((i) => i.key === item);
  const [search, setSearch] = useState('');

  if (!cat || !itemDef) return null;

  const colors = COLOR_CLASSES[cat.color] ?? COLOR_CLASSES.blue;
  const ItemIcon = itemDef.icon;

  // Specialized views
  if (item === 'media-scanner' || item === 'gallery' || item === 'video-library' || item === 'audio-library' || item === 'document-manager') {
    return <MediaScanner />;
  }
  if (item === 'gradebook') {
    return <GradebookView />;
  }
  if (item === 'tuition' || item === 'invoices' || item === 'payments' || item === 'scholarships' || item === 'payroll') {
    return <FinanceView />;
  }
  if (item === 'support-tickets' || item === 'helpdesk') {
    return <TicketsView />;
  }
  if (item === 'calendar') {
    return <CalendarView />;
  }
  if (item === 'audit-logs') {
    return <AuditLogView />;
  }
  if (item === 'id-cards') {
    return <IdCardView />;
  }
  if (item === 'ai-assistant' || item === 'ai-translation') {
    return <AICenter />;
  }
  if (item === 'users' || item === 'roles' || item === 'permissions') {
    return <UserManagementView initialTab={item === 'users' ? 'users' : item === 'roles' ? 'roles' : 'permissions'} />;
  }

  const rows = generateRows(item);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <button
          onClick={() => navigate({ name: 'dashboard' })}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {t(lang, 'dash.title')}
        </button>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <button
          onClick={() => setActiveCategory(category)}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {menuLabel(lang, category)}
        </button>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <span className="text-slate-700 dark:text-slate-200 font-medium">{menuLabel(lang, item)}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md`}>
            <ItemIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
              {menuLabel(lang, item)}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {menuLabel(lang, category)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${colors.gradient} text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all`}>
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Stats mini-cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: rows.length },
          { label: 'Active', value: Math.floor(rows.length * 0.7) },
          { label: 'Pending', value: Math.floor(rows.length * 0.2) },
          { label: 'This Month', value: Math.floor(rows.length * 0.3) },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full ps-9 pe-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Rows */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3">Name</th>
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Date</th>
                <th className="text-start text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Category</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows
                .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()))
                .map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <ItemIcon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.status === 'Active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : row.status === 'Pending'
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">{row.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">{row.category}</td>
                    <td className="px-4 py-3 text-end">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

type Row = { name: string; status: 'Active' | 'Pending' | 'Inactive'; date: string; category: string };

function generateRows(item: MenuItemKey): Row[] {
  const baseNames: Partial<Record<MenuItemKey, string[]>> = {
    'users': ['Ahmad Rahimi', 'Fatima Noori', 'Yusuf Karimi', 'Zainab Hashimi', 'Omar Faruqi'],
    'roles': ['Administrator', 'Instructor', 'Student', 'Teaching Assistant', 'Reviewer'],
    'permissions': ['course.create', 'course.edit', 'user.manage', 'grade.view', 'report.export'],
    'audit-logs': ['User login', 'Course updated', 'Grade modified', 'Payment processed', 'Settings changed'],
    'mfa': ['Ahmad Rahimi (Enabled)', 'Fatima Noori (Enabled)', 'Yusuf Karimi (Pending)', 'Zainab Hashimi (Enabled)', 'Omar Faruqi (Disabled)'],
    'ip-restriction': ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '203.0.113.0/24', '198.51.100.0/24'],
    'university-profile': ['EFKGOU Profile', 'Mission & Vision', 'Leadership Team', 'Accreditation Info', 'Contact Details'],
    'trustees': ['Dr. A. Rahimi', 'Eng. F. Kabuli', 'Prof. M. Noori', 'Dr. Z. Hashimi', 'Eng. O. Faruqi'],
    'calendar': ['Fall 2026 Start', 'Midterm Exams', 'Winter Break', 'Spring 2027 Start', 'Final Exams'],
    'accreditation': ['Ministry of Higher Ed', 'ISO 9001:2025', 'ACM Curriculum Review', 'International Board', 'Quality Assurance'],
    'bscs-program': ['Semester 1 — Intro to CS', 'Semester 2 — OOP & Logic', 'Semester 3 — Data Structures', 'Semester 4 — OS & Databases', 'Semester 5 — Networks & AI'],
    'syllabi': ['CS101 Syllabus', 'CS201 Syllabus', 'CS301 Syllabus', 'CS401 Syllabus', 'MATH101 Syllabus'],
    'departments': ['Software Engineering', 'Network Administration', 'Frontend Development', 'Linguistics', 'InfoSec'],
    'registration': ['STU-2026-001', 'STU-2026-002', 'STU-2026-003', 'STU-2026-004', 'STU-2026-005'],
    'student-profile': ['Ahmad Rahimi (CS-3)', 'Fatima Noori (NET-2)', 'Yusuf Karimi (CS-1)', 'Zainab Hashimi (ENG-4)', 'Omar Faruqi (SEC-3)'],
    'id-cards': ['ID-2026-001', 'ID-2026-002', 'ID-2026-003', 'ID-2026-004', 'ID-2026-005'],
    'transcripts': ['Ahmad Rahimi — CGPA 3.8', 'Fatima Noori — CGPA 3.6', 'Yusuf Karimi — CGPA 3.9', 'Zainab Hashimi — CGPA 3.7', 'Omar Faruqi — CGPA 3.5'],
    'live-classes': ['CS101 Live — Saturday', 'NET201 Live — Sunday', 'CS301 Live — Monday', 'ENG101 Live — Tuesday', 'SEC301 Live — Wednesday'],
    'recorded-classes': ['CS101 Lecture 1', 'CS101 Lecture 2', 'NET201 Lecture 5', 'CS301 Lecture 3', 'ENG101 Lecture 4'],
    'assignments': ['Python Basics', 'OSI Model Quiz', 'Landing Page Project', 'Essay Draft', 'Network Topology'],
    'quizzes': ['Week 1 Quiz', 'Midterm Exam', 'Chapter 3 Review', 'Practice Test', 'Final Assessment'],
    'gradebook': ['CS101 — 85/100', 'NET201 — 92/100', 'CS301 — 78/100', 'ENG101 — 88/100', 'SEC301 — 95/100'],
    'certificates': ['Intro to Programming', 'Computer Networks', 'Web Development', 'Academic English', 'Data Structures'],
    'teacher-schedule': ['Dr. A. Rahimi — Sat/Wed', 'Eng. F. Noori — Sun/Tue', 'M. Karimi — Mon/Thu', 'Z. Hashimi — Tue/Fri', 'O. Faruqi — Wed/Sat'],
    'grading': ['CS101 Midterm Grading', 'NET201 Assignment Grading', 'CS301 Quiz Grading', 'ENG101 Essay Grading', 'SEC301 Final Grading'],
    'research-supervision': ['Ahmad — ML Thesis', 'Fatima — Network Security', 'Yusuf — Web Frameworks', 'Zainab — NLP Research', 'Omar — Ethical Hacking'],
    'articles': ['New Scholarship Program', 'AI in Education', 'Campus Update', 'Research Symposium', 'Graduation 2026'],
    'events': ['Tech Conference 2026', 'Career Fair', 'Open Day', 'Workshop: React', 'Alumni Meetup'],
    'announcements': ['Enrollment Open', 'Holiday Schedule', 'Exam Dates Posted', 'New Faculty Join', 'System Maintenance'],
    'blog': ['Student Life at EFKGOU', 'Tips for Online Learning', 'Faculty Spotlight', 'Tech Trends 2026', 'Alumni Success Story'],
    'digital-books': ['Clean Code', 'Introduction to Algorithms', 'Computer Networks', 'Operating System Concepts', 'Database Systems'],
    'thesis': ['ML for Crop Detection', 'Network Security Framework', 'React Performance Optimization', 'NLP for Dari/Pashto', 'Blockchain for Academic Records'],
    'journals': ['Journal of Computer Science', 'AI Research Quarterly', 'Network Security Review', 'Software Engineering Today', 'Data Science Insights'],
    'conferences': ['AI Conference 2026', 'Cyber Security Summit', 'Web Dev Meetup', 'Research Symposium', 'EdTech Forum'],
    'tuition': ['Fall 2026 — $1,200', 'Spring 2027 — $1,200', 'Summer 2027 — $800', 'Fall 2027 — $1,200', 'Spring 2028 — $1,200'],
    'invoices': ['INV-2026-001', 'INV-2026-002', 'INV-2026-003', 'INV-2026-004', 'INV-2026-005'],
    'payments': ['Payment #4521', 'Payment #4522', 'Payment #4523', 'Payment #4524', 'Payment #4525'],
    'payroll': ['Dr. A. Rahimi — $4,500', 'Eng. F. Noori — $3,800', 'M. Karimi — $3,200', 'Z. Hashimi — $3,500', 'O. Faruqi — $4,000'],
    'scholarships': ['Merit Scholarship — $2,000', 'Need-Based Aid — $1,500', 'Research Grant — $3,000', 'Sports Scholarship — $1,000', 'Alumni Fund — $800'],
    'helpdesk': ['How to enroll', 'Password reset', 'Course access', 'Payment help', 'Certificate request'],
    'support-tickets': ['Login Issue', 'Course Access', 'Grade Dispute', 'Video Playback', 'Certificate Error'],
    'career-center': ['Software Engineer — TechCorp', 'Data Analyst — DataInc', 'Network Admin — NetSys', 'UX Designer — DesignHub', 'DevOps — CloudOps'],
    'alumni': ['Class of 2025 — 45 graduates', 'Class of 2024 — 38 graduates', 'Class of 2023 — 32 graduates', 'Class of 2022 — 28 graduates', 'Class of 2021 — 25 graduates'],
    'academic-reports': ['Enrollment Trends', 'Pass Rates by Faculty', 'Student Retention', 'Course Completion', 'CGPA Distribution'],
    'financial-reports': ['Revenue by Semester', 'Expense Breakdown', 'Scholarship Distribution', 'Payment Collection Rate', 'Budget vs Actual'],
    'ai-assistant': ['AI Instructor Usage', 'Guidance Bot Interactions', 'Homework Assistant Queries', 'Code Review Sessions', 'English Tutor Stats'],
    'ai-translation': ['EN→FA Translations', 'EN→PS Translations', 'FA→EN Translations', 'PS→EN Translations', 'Auto-Translation Logs'],
    'backups': ['Full Backup — 2026-08-01', 'Incremental — 2026-08-02', 'Full Backup — 2026-07-31', 'Incremental — 2026-07-30', 'Full Backup — 2026-07-29'],
    'monitoring': ['Server Uptime — 99.9%', 'API Response — 120ms', 'DB Connections — 45', 'Error Rate — 0.02%', 'Active Sessions — 234'],
  };

  const names = baseNames[item] ?? ['Record 1', 'Record 2', 'Record 3', 'Record 4', 'Record 5'];
  const statuses: Row['status'][] = ['Active', 'Pending', 'Active', 'Inactive', 'Active'];
  const dates = ['2026-08-01', '2026-08-02', '2026-07-28', '2026-07-25', '2026-07-20'];
  const categories = ['General', 'Academic', 'Finance', 'Technical', 'Administrative'];

  return names.slice(0, 5).map((name, i) => ({
    name,
    status: statuses[i] ?? 'Active',
    date: dates[i] ?? '2026-08-01',
    category: categories[i] ?? 'General',
  }));
}
