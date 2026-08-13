import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Languages, Sparkles, Bot, User } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { type Lang } from '@/lib/i18n';

type Message = { role: 'user' | 'assistant'; content: string; ts: number };

const SUGGESTIONS: Record<string, string[]> = {
  en: ['What courses are available in the BSCS program?', 'How do I calculate my CGPA?', 'When does the Fall 2026 semester start?', 'Explain the OSI model'],
  fa: ['چه دروسی در برنامه BSCS موجود است؟', 'چگونه CGPA خود را محاسبه کنم؟', 'ترم پاییز ۲۰۲۶ کی شروع می‌شود؟', 'مدل OSI را توضیح دهید'],
  ps: ['په BSCS پروګرام کې کوم درسونه شتون لري؟', 'څنګه خپل CGPA محاسبه کړم؟', 'د ۲۰۲۶ د مني سمستر کې پیل کیږي؟', 'د OSI ماډل تشریح کړئ'],
};

export default function AICenter() {
  const { lang } = useLang();
  const { session } = useAuth();
  const [tab, setTab] = useState<'assistant' | 'translation'>('assistant');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [transInput, setTransInput] = useState('');
  const [transFrom, setTransFrom] = useState<'en' | 'fa' | 'ps'>('en');
  const [transTo, setTransTo] = useState<'en' | 'fa' | 'ps'>('fa');
  const [transOutput, setTransOutput] = useState('');
  const [translating, setTranslating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = () => {
    if (!input.trim() || thinking) return;
    const userMsg: Message = { role: 'user', content: input, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const response = generateResponse(userMsg.content, lang);
      setMessages((m) => [...m, { role: 'assistant', content: response, ts: Date.now() }]);
      setThinking(false);
    }, 800);
  };

  const handleTranslate = () => {
    if (!transInput.trim() || translating) return;
    setTranslating(true);
    setTimeout(() => {
      setTransOutput(translateText(transInput, transFrom, transTo));
      setTranslating(false);
    }, 600);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">{title(lang)}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle(lang)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        {([
          { key: 'assistant', icon: Bot, label: assistantTab(lang) },
          { key: 'translation', icon: Languages, label: translationTab(lang) },
        ] as const).map((tb) => {
          const Icon = tb.icon;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === tb.key ? 'border-slate-800 dark:border-slate-200 text-slate-800 dark:text-slate-200' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* AI Assistant */}
      {tab === 'assistant' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[500px]">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{welcomeMsg(lang)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                  {SUGGESTIONS[lang]?.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); }}
                      className="text-start text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.ts} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? 'bg-blue-100 dark:bg-blue-950/40' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                </div>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={inputPlaceholder(lang)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-slate-400 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm text-slate-700 dark:text-slate-200"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || thinking}
                className="px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Translation */}
      {tab === 'translation' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <select
              value={transFrom}
              onChange={(e) => setTransFrom(e.target.value as 'en' | 'fa' | 'ps')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="en">English</option>
              <option value="fa">دری (Dari)</option>
              <option value="ps">پښتو (Pashto)</option>
            </select>
            <button
              onClick={() => { setTransFrom(transTo); setTransTo(transFrom); }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Languages className="w-5 h-5" />
            </button>
            <select
              value={transTo}
              onChange={(e) => setTransTo(e.target.value as 'en' | 'fa' | 'ps')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="en">English</option>
              <option value="fa">دری (Dari)</option>
              <option value="ps">پښتو (Pashto)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{sourceLabel(lang)}</label>
              <textarea
                value={transInput}
                onChange={(e) => setTransInput(e.target.value)}
                rows={6}
                placeholder={transPlaceholder(lang)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm text-slate-700 dark:text-slate-200 resize-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{targetLabel(lang)}</label>
              <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-700 dark:text-slate-200 min-h-[160px] resize-none">
                {translating ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    {translatingLabel(lang)}
                  </div>
                ) : transOutput || (
                  <span className="text-slate-400">{outputPlaceholder(lang)}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={!transInput.trim() || translating}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Languages className="w-4 h-4" />
            {translateBtn(lang)}
          </button>
        </div>
      )}
    </div>
  );
}

function generateResponse(query: string, lang: Lang): string {
  const q = query.toLowerCase();
  if (q.includes('cgpa') || q.includes('نمر') || q.includes('محاسب')) {
    return lang === 'en'
      ? 'CGPA is calculated by dividing the total grade points earned by total credit hours. Grade points: A=4.0, B=3.0, C=2.0, D=1.0, F=0.0. You can view your CGPA in the Gradebook section.'
      : lang === 'fa'
      ? 'CGPA با تقسیم مجموع امتیازات نمرات بر مجموع ساعات اعتباری محاسبه می‌شود. امتیازات: A=4.0، B=3.0، C=2.0، D=1.0، F=0.0. می‌توانید CGPA خود را در بخش دفتر نمرات مشاهده کنید.'
      : 'CGPA د ټولو نمرې نقطې د ټولو کرډیټ ساعتونو په ویشلو سره محاسبه کیږي. نقطې: A=4.0، B=3.0، C=2.0، D=1.0، F=0.0. تاسو کولی شئ خپل CGPA په د نومرو کتاب برخه کې وګورئ.';
  }
  if (q.includes('bscs') || q.includes('برنامه') || q.includes('دروس') || q.includes('درسونه')) {
    return lang === 'en'
      ? 'The BSCS 4-Year International Program has 8 semesters with 40+ courses covering programming, data structures, OS, databases, networks, AI, ML, cybersecurity, and a final year project. Visit the Programs page for the full curriculum.'
      : lang === 'fa'
      ? 'برنامه ۴ ساله بین‌المللی BSCS دارای ۸ ترم با بیش از ۴۰ درس شامل برنامه‌نویسی، ساختار داده، سیستم‌های عامل، پایگاه داده، شبکه‌ها، هوش مصنوعی، یادگیری ماشین، امنیت سایبری و پروژه نهایی است. برای مشاهده نصاب کامل به صفحه برنامه‌ها مراجعه کنید.'
      : 'د ۴ کلن نړیوال BSCS پروګرام ۸ سمسترونه لري چې د ۴۰+ درسونه پکې شامل دي. د پروګرامونو پاڼې ته مراجعه وکړئ.';
  }
  if (q.includes('osi') || q.includes('مدل')) {
    return lang === 'en'
      ? 'The OSI (Open Systems Interconnection) model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer serves a specific function in network communication.'
      : 'مدل OSI دارای ۷ لایه است: فیزیکی، پیوند داده، شبکه، انتقال، نشست، ارائه و کاربرد.';
  }
  return lang === 'en'
    ? 'I can help you with questions about courses, CGPA calculation, academic calendar, and university services. What would you like to know?'
    : lang === 'fa'
    ? 'من می‌توانم به سوالات شما درباره دروس، محاسبه CGPA، تقویم آکادمیک و خدمات دانشگاه پاسخ دهم. چه می‌خواهید بدانید؟'
    : 'زه کولی شم ستاسو پوښتنو ته د درسونو، د CGPA محاسبې، اکاډمیک کلیز او د پوهنتون خدمتونو په اړه ځواب درکړم.';
}

function translateText(text: string, _from: string, to: string): string {
  // Simulated translation — in production this would call an AI translation API
  const prefix: Record<string, string> = { en: '[EN] ', fa: '[دری] ', ps: '[پښتو] ' };
  return `${prefix[to] ?? ''}${text}`;
}

function title(lang: Lang): string { return { en: 'AI Center', fa: 'مرکز هوش مصنوعی', ps: 'د AI مرکز' }[lang]; }
function subtitle(lang: Lang): string { return { en: 'AI Assistant & Translation tools', fa: 'دستیار هوشمند و ابزارهای ترجمه', ps: 'د AI مرستندوی او د ژباړې وسیلې' }[lang]; }
function assistantTab(lang: Lang): string { return { en: 'AI Assistant', fa: 'دستیار هوشمند', ps: 'د AI مرستندوی' }[lang]; }
function translationTab(lang: Lang): string { return { en: 'Translation', fa: 'ترجمه', ps: 'ژباړه' }[lang]; }
function welcomeMsg(lang: Lang): string { return { en: 'Ask me anything about your courses, schedule, or university services.', fa: 'هر سؤالی درباره دروس، برنامه یا خدمات دانشگاه بپرسید.', ps: 'د خپلو درسونو، مهالویش یا د پوهنتون خدمتونو په اړه هر پوښتنه وکړئ.' }[lang]; }
function inputPlaceholder(lang: Lang): string { return { en: 'Type your question...', fa: 'سوال خود را تایپ کنید...', ps: 'خپله پوښتنه ولیکئ...' }[lang]; }
function sourceLabel(lang: Lang): string { return { en: 'Source Text', fa: 'متن مبدأ', ps: 'د سرچینې متن' }[lang]; }
function targetLabel(lang: Lang): string { return { en: 'Translation', fa: 'ترجمه', ps: 'ژباړه' }[lang]; }
function transPlaceholder(lang: Lang): string { return { en: 'Enter text to translate...', fa: 'متن را برای ترجمه وارد کنید...', ps: 'د ژباړې لپاره متن داخل کړئ...' }[lang]; }
function outputPlaceholder(lang: Lang): string { return { en: 'Translation will appear here...', fa: 'ترجمه در اینجا نمایش داده می‌شود...', ps: 'ژباړه دلته ښکاره کیږي...' }[lang]; }
function translatingLabel(lang: Lang): string { return { en: 'Translating...', fa: 'در حال ترجمه...', ps: 'د ژباړې په حال کې...' }[lang]; }
function translateBtn(lang: Lang): string { return { en: 'Translate', fa: 'ترجمه کنید', ps: 'ژباړئ' }[lang]; }
