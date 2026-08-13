import { useState } from 'react';
import {
  X, Video, Users, Calendar, Image as ImageIcon, Film,
  ZoomIn, MonitorPlay, ExternalLink, Clock, KeyRound,
} from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { t, type Lang } from '@/lib/i18n';

type Tab = 'subjects' | 'gallery' | 'videos';

const PLATFORMS = [
  { name: 'Zoom', icon: ZoomIn, color: 'blue', url: 'https://zoom.us/j/efkgou-classroom', desc: 'Join via Zoom' },
  { name: 'Google Meet', icon: Video, color: 'emerald', url: 'https://meet.google.com/efkgou-live', desc: 'Join via Google Meet' },
  { name: 'Microsoft Teams', icon: Users, color: 'indigo', url: 'https://teams.microsoft.com/l/meetup-join/efkgou', desc: 'Join via Teams' },
  { name: 'WebRTC Live', icon: MonitorPlay, color: 'rose', url: 'https://efkgou.edu/live-classroom', desc: 'Join via WebRTC' },
];

const SCHEDULE = [
  { day: 'Saturday', time: '09:00 - 10:30', subject: 'Introduction to Programming', instructor: 'Dr. A. Rahimi' },
  { day: 'Sunday', time: '11:00 - 12:30', subject: 'Computer Networks', instructor: 'Eng. F. Noori' },
  { day: 'Monday', time: '14:00 - 15:30', subject: 'Web Development', instructor: 'M. Karimi' },
  { day: 'Tuesday', time: '09:00 - 10:30', subject: 'Academic English', instructor: 'Z. Hashimi' },
  { day: 'Wednesday', time: '13:00 - 14:30', subject: 'Cyber Security', instructor: 'O. Faruqi' },
  { day: 'Thursday', time: '10:00 - 11:30', subject: 'Machine Learning', instructor: 'Dr. Y. Ahmadi' },
];

const SUBJECTS = [
  'Computer Science', 'Network Engineering', 'Web Development',
  'English Language', 'Cyber Security', 'Data Science',
  'Graphic Design', 'Business Management',
];

export default function ClassroomModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const [tab, setTab] = useState<Tab>('subjects');
  const [code, setCode] = useState('');
  const [codeEntered, setCodeEntered] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === 'STU-2026-001') {
      setCodeEntered(true);
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{welcomeTitle(lang)}</h3>
              <p className="text-sm text-blue-100">{welcomeSubtitle(lang)}</p>
            </div>
          </div>
        </div>

        {!codeEntered ? (
          /* Registration Code Gate */
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{codePrompt(lang)}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{codeHint(lang)}</p>
            </div>
            <form onSubmit={handleSubmitCode} className="max-w-sm mx-auto">
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setCodeError(false); }}
                placeholder="STU-2026-001"
                className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-mono tracking-wider outline-none transition-colors ${
                  codeError
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900'
                }`}
              />
              {codeError && (
                <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 text-center">{codeErrorText(lang)}</p>
              )}
              <button
                type="submit"
                className="w-full mt-4 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                {enterClassroom(lang)}
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
                {demoCode(lang)}: <span className="font-mono font-semibold">STU-2026-001</span>
              </p>
            </form>
          </div>
        ) : (
          /* Classroom Content */
          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
              {([
                { key: 'subjects', icon: Calendar, label: subjectsTab(lang) },
                { key: 'gallery', icon: ImageIcon, label: galleryTab(lang) },
                { key: 'videos', icon: Film, label: videosTab(lang) },
              ] as { key: Tab; icon: typeof Calendar; label: string }[]).map((tb) => {
                const Icon = tb.icon;
                return (
                  <button
                    key={tb.key}
                    onClick={() => setTab(tb.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                      tab === tb.key
                        ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tb.label}
                  </button>
                );
              })}
            </div>

            {tab === 'subjects' && (
              <div>
                {/* Live stream platforms */}
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{livePlatforms(lang)}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    const colorMap: Record<string, string> = {
                      blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60',
                      emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60',
                      indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/60',
                      rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60',
                    };
                    return (
                      <a
                        key={p.name}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md ${colorMap[p.color] ?? colorMap.blue}`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-semibold">{p.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    );
                  })}
                </div>

                {/* Schedule table */}
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{scheduleTitle(lang)}</h4>
                  <span className="text-xs text-slate-400 dark:text-slate-500">(UTC+4:30)</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 uppercase">
                        <th className="text-start px-4 py-2.5 font-semibold">{dayLabel(lang)}</th>
                        <th className="text-start px-4 py-2.5 font-semibold">{timeLabel(lang)}</th>
                        <th className="text-start px-4 py-2.5 font-semibold hidden sm:table-cell">{subjectLabel(lang)}</th>
                        <th className="text-start px-4 py-2.5 font-semibold hidden md:table-cell">{instructorLabel(lang)}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {SCHEDULE.map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{s.day}</td>
                          <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 tabular-nums">{s.time}</td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hidden sm:table-cell">{s.subject}</td>
                          <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 hidden md:table-cell">{s.instructor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subjects list */}
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-6 mb-3">{subjectsList(lang)}</h4>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tab === 'gallery' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'https://images.pexels.com/photos/5212666/pexels-photo-5212666.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
                  'https://images.pexels.com/photos/5225982/pexels-photo-5225982.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
                  'https://images.pexels.com/photos/11932106/pexels-photo-11932106.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
                  'https://images.pexels.com/photos/9275222/pexels-photo-9275222.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
                  'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
                  'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
                ].map((src, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}

            {tab === 'videos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Live: Introduction to Programming', duration: '1:24:30' },
                  { title: 'Recorded: Computer Networks Lecture 5', duration: '58:12' },
                  { title: 'Live: Web Development Workshop', duration: '2:05:45' },
                  { title: 'Recorded: Academic English — Session 3', duration: '45:00' },
                ].map((v, i) => (
                  <div key={i} className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                      <MonitorPlay className="w-10 h-10 text-white/40 group-hover:scale-110 transition-transform" />
                      <span className="absolute bottom-2 end-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs tabular-nums">
                        {v.duration}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{v.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function welcomeTitle(lang: Lang): string {
  return { en: 'Welcome to Classroom', fa: 'به کلاس خوش آمدید', ps: 'ټولګي ته ښه راغلاست' }[lang];
}
function welcomeSubtitle(lang: Lang): string {
  return { en: 'Enter your registration code to join live sessions', fa: 'کد ثبت‌نام خود را برای پیوستن به جلسات زنده وارد کنید', ps: 'د ژوندیو غونډو سره یوځای کېدو لپاره خپل د نوم لیکنې کوډ دننه کړئ' }[lang];
}
function codePrompt(lang: Lang): string {
  return { en: 'Student Registration Code', fa: 'کد ثبت‌نام دانشجو', ps: 'د زده‌کوونکي د نوم لیکنې کوډ' }[lang];
}
function codeHint(lang: Lang): string {
  return { en: 'Enter the code provided in your enrollment email', fa: 'کد ارائه‌شده در ایمیل ثبت‌نام خود را وارد کنید', ps: 'په خپل نوم لیکنې بریښنالیک کې ورکړل شوی کوډ دننه کړئ' }[lang];
}
function codeErrorText(lang: Lang): string {
  return { en: 'Invalid code. Please check and try again.', fa: 'کد نامعتبر. لطفاً بررسی کرده و دوباره امتحان کنید.', ps: 'ناسم کوډ. مهرباني وکړئ وګورئ او بیا هڅه وکړئ.' }[lang];
}
function enterClassroom(lang: Lang): string {
  return { en: 'Enter Classroom', fa: 'ورود به کلاس', ps: 'ټولګي ته ننوځئ' }[lang];
}
function demoCode(lang: Lang): string {
  return { en: 'Demo code', fa: 'کد نمونه', ps: 'نمونه کوډ' }[lang];
}
function livePlatforms(lang: Lang): string {
  return { en: 'Live Stream Platforms', fa: 'پلتفرم‌های پخش زنده', ps: 'د ژوندۍ خپرې پلیټفارمونه' }[lang];
}
function scheduleTitle(lang: Lang): string {
  return { en: 'Weekly Schedule', fa: 'برنامه هفتگی', ps: 'اونیزه مهالویش' }[lang];
}
function subjectsTab(lang: Lang): string {
  return { en: 'Subjects', fa: 'موضوعات', ps: 'موضوعات' }[lang];
}
function galleryTab(lang: Lang): string {
  return { en: 'Gallery', fa: 'گالری', ps: 'ګالري' }[lang];
}
function videosTab(lang: Lang): string {
  return { en: 'Videos', fa: 'ویدیوها', ps: 'ویډیوګانې' }[lang];
}
function dayLabel(lang: Lang): string {
  return { en: 'Day', fa: 'روز', ps: 'ورځ' }[lang];
}
function timeLabel(lang: Lang): string {
  return { en: 'Time', fa: 'زمان', ps: 'وخت' }[lang];
}
function subjectLabel(lang: Lang): string {
  return { en: 'Subject', fa: 'موضوع', ps: 'موضوع' }[lang];
}
function instructorLabel(lang: Lang): string {
  return { en: 'Instructor', fa: 'استاد', ps: 'ښوونکی' }[lang];
}
function subjectsList(lang: Lang): string {
  return { en: 'Available Subjects', fa: 'موضوعات موجود', ps: 'شتمن موضوعات' }[lang];
}
