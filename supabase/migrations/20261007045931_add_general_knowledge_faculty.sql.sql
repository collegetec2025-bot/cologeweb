INSERT INTO faculties (slug, name_en, name_fa, name_ps, description_en, description_fa, description_ps, icon, color)
VALUES (
  'general-knowledge',
  'Faculty of General Knowledge',
  'دانشکده معلومات عمومی',
  'د عمومي معلوماتو پوهنځی',
  'Developing students'' general knowledge, critical thinking, communication, digital literacy, civic awareness, scientific understanding, and lifelong-learning skills.',
  'گسترش دانش عمومی، تقویت تفکر انتقادی، مهارت‌های ارتباطی، سواد دیجیتلی، آگاهی مدنی، شناخت علوم و توانایی یادگیری مادام‌العمر در میان دانشجویان.',
  'د زده‌کوونکو د عمومي پوهې پراختیا، د انتقادي فکر پیاوړتیا، د اړیکو مهارتونو، ډیجیټلي سواد، مدني پوهاوي، علمي پوهې او د ټول عمر زده‌کړې وړتیاوو ته وده ورکول.',
  'BookOpen',
  'emerald'
)
ON CONFLICT (slug) DO NOTHING;
