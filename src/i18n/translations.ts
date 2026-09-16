// Internationalization (i18n) - Translations for ULAB
// Supports: Arabic (ar), English (en), Spanish (es), French (fr), Korean (ko), Chinese (zh)

export type Language = 'ar' | 'en' | 'es' | 'fr' | 'ko' | 'zh';

export interface Translation {
  // Navbar
  'nav.features': string;
  'nav.howItWorks': string;
  'nav.advantages': string;
  'nav.architecture': string;
  'nav.roadmap': string;
  'nav.launch': string;
  'nav.download': string;
  'nav.back': string;
  
  // Hero
  'hero.badge': string;
  'hero.title1': string;
  'hero.title2': string;
  'hero.subtitle': string;
  'hero.cta': string;
  'hero.download': string;
  'hero.watch': string;
  'hero.compatible': string;
  
  // Features
  'features.title': string;
  'features.subtitle': string;
  'features.context.title': string;
  'features.context.desc': string;
  'features.search.title': string;
  'features.search.desc': string;
  'features.privacy.title': string;
  'features.privacy.desc': string;
  'features.universal.title': string;
  'features.universal.desc': string;
  'features.git.title': string;
  'features.git.desc': string;
  'features.terminal.title': string;
  'features.terminal.desc': string;
  
  // Stats
  'stats.local': string;
  'stats.providers': string;
  'stats.projects': string;
  'stats.servers': string;
  
  // How it works
  'howItWorks.title': string;
  'howItWorks.subtitle': string;
  'howItWorks.step1.title': string;
  'howItWorks.step1.desc': string;
  'howItWorks.step2.title': string;
  'howItWorks.step2.desc': string;
  'howItWorks.step3.title': string;
  'howItWorks.step3.desc': string;
  'howItWorks.step4.title': string;
  'howItWorks.step4.desc': string;
  'howItWorks.step5.title': string;
  'howItWorks.step5.desc': string;
  'howItWorks.step6.title': string;
  'howItWorks.step6.desc': string;
  
  // Advantages
  'advantages.title': string;
  'advantages.subtitle': string;
  'advantages.memory.title': string;
  'advantages.memory.desc': string;
  'advantages.permissions.title': string;
  'advantages.permissions.desc': string;
  'advantages.approval.title': string;
  'advantages.approval.desc': string;
  'advantages.map.title': string;
  'advantages.map.desc': string;
  'advantages.compare.title': string;
  'advantages.compare.desc': string;
  'advantages.tasks.title': string;
  'advantages.tasks.desc': string;
  'advantages.plugins.title': string;
  'advantages.plugins.desc': string;
  'advantages.team.title': string;
  'advantages.team.desc': string;
  
  // Architecture
  'architecture.title': string;
  'architecture.subtitle': string;
  'architecture.local': string;
  'architecture.cloud': string;
  'architecture.localNote': string;
  'architecture.cloudNote': string;
  'architecture.local.user': string;
  'architecture.local.aiChat': string;
  'architecture.local.extension': string;
  'architecture.local.engine': string;
  'architecture.local.files': string;
  'architecture.cloud.userFiles': string;
  'architecture.cloud.server': string;
  'architecture.cloud.aiServer': string;
  'architecture.cloud.user': string;
  
  // Roadmap
  'roadmap.title': string;
  'roadmap.subtitle': string;
  'roadmap.phase1': string;
  'roadmap.phase1.desc': string;
  'roadmap.phase2': string;
  'roadmap.phase2.desc': string;
  'roadmap.phase3': string;
  'roadmap.phase3.desc': string;
  'roadmap.phase4': string;
  'roadmap.phase4.desc': string;
  'roadmap.phase5': string;
  'roadmap.phase5.desc': string;
  'roadmap.phase6': string;
  'roadmap.phase6.desc': string;
  'roadmap.current': string;
  
  // FAQ
  'faq.title': string;
  'faq.subtitle': string;
  'faq.q1': string;
  'faq.a1': string;
  'faq.q2': string;
  'faq.a2': string;
  'faq.q3': string;
  'faq.a3': string;
  'faq.q4': string;
  'faq.a4': string;
  'faq.q5': string;
  'faq.a5': string;
  'faq.q6': string;
  'faq.a6': string;
  
  // CTA
  'cta.title': string;
  'cta.subtitle': string;
  'cta.button': string;
  'cta.download': string;
  
  // Footer
  'footer.rights': string;
  'footer.local': string;
  'footer.privacy': string;
  
  // Workspace
  'workspace.title': string;
  'workspace.launch': string;
  'workspace.files': string;
  'workspace.search': string;
  'workspace.map': string;
  'workspace.ai': string;
  'workspace.bridge': string;
  'workspace.agent': string;
  'workspace.context': string;
  'workspace.memory': string;
  'workspace.permissions': string;
  'workspace.tasks': string;
  'workspace.compare': string;
  'workspace.git': string;
  'workspace.terminal': string;
  'workspace.settings': string;
  'workspace.log': string;
  'workspace.openFolder': string;
  'workspace.demoMode': string;
  'workspace.connected': string;
  'workspace.disconnected': string;
  'workspace.readonly': string;
  'workspace.assisted': string;
  'workspace.agentMode': string;
  'workspace.security': string;
  'workspace.active': string;
  'workspace.shortcuts': string;
  
  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.cancel': string;
  'common.confirm': string;
  'common.save': string;
  'common.delete': string;
  'common.edit': string;
  'common.close': string;
  'common.next': string;
  'common.previous': string;
}

export const translations: Record<Language, Translation> = {
  // Arabic
  ar: {
    'nav.features': 'المميزات',
    'nav.howItWorks': 'كيف يعمل',
    'nav.advantages': 'التفوق',
    'nav.architecture': 'البنية',
    'nav.roadmap': 'خريطة الطريق',
    'nav.launch': 'إطلاق الأداة',
    'nav.download': 'تحميل ULAB',
    'nav.back': 'الرئيسية',
    
    'hero.badge': 'الإصدار التجريبي متاح الآن — جرّب الأداة',
    'hero.title1': 'الجسر المحلي الموحد',
    'hero.title2': 'للذكاء الاصطناعي',
    'hero.subtitle': 'اربط أي ذكاء اصطناعي بجهازك ومشاريعك محليًا. خصوصية كاملة • مشاريع ضخمة • مجاني للأبد',
    'hero.cta': 'إطلاق الأداة الآن',
    'hero.download': 'تحميل ULAB لنظام Windows',
    'hero.watch': 'شاهد كيف يعمل',
    'hero.compatible': 'متوافق مع جميع مزودي الذكاء الاصطناعي',
    
    'features.title': 'المميزات الأساسية',
    'features.subtitle': 'كل ما تحتاجه لربط الذكاء الاصطناعي ببيئة عملك المحلية',
    'features.context.title': 'محرك سياق المشروع',
    'features.context.desc': 'فهرسة محلية ذكية تفهم بنية مشروعك وتجد الملفات المرتبطة بطلبك',
    'features.search.title': 'بحث ذكي عند الطلب',
    'features.search.desc': 'لا ترسل المشروع كاملاً — النظام يرسل السياق الضروري فقط إلى AI',
    'features.privacy.title': 'خصوصية مطلقة',
    'features.privacy.desc': 'كل المعالجة تتم محليًا على جهازك. لا خوادم سحابية',
    'features.universal.title': 'متوافق مع أي AI',
    'features.universal.desc': 'بروتوكول ULP يعمل مع ChatGPT, Gemini, Claude, DeepSeek',
    'features.git.title': 'تكامل Git كامل',
    'features.git.desc': 'مراقبة التغييرات، إدارة الفروع، ومراجعة الاختلافات',
    'features.terminal.title': 'تشغيل الأوامر',
    'features.terminal.desc': 'نفّذ أوامر الطرفية والاختبارات من خلال AI',
    
    'stats.local': 'محلي أولًا',
    'stats.providers': 'مزودي AI',
    'stats.projects': 'حجم المشروع',
    'stats.servers': 'خوادم سحابية',
    
    'howItWorks.title': 'كيف يعمل؟',
    'howItWorks.subtitle': 'ست خطوات بسيطة من السؤال إلى الحل',
    'howItWorks.step1.title': 'اختر مجلد المشروع',
    'howItWorks.step1.desc': 'حدد مجلد مشروعك — النظام يكتشف البنية تلقائيًا',
    'howItWorks.step2.title': 'اسأل بأي AI',
    'howItWorks.step2.desc': 'اكتب سؤالك في ChatGPT أو Gemini كالمعتاد',
    'howItWorks.step3.title': 'البحث المحلي الذكي',
    'howItWorks.step3.desc': 'ULAB يبحث محليًا عن الملفات المرتبطة',
    'howItWorks.step4.title': 'إرسال السياق فقط',
    'howItWorks.step4.desc': 'يُرسل الملفات الضرورية فقط',
    'howItWorks.step5.title': 'AI يحلل ويقترح',
    'howItWorks.step5.desc': 'الذكاء الاصطناعي يعطي الحل',
    'howItWorks.step6.title': 'تطبيق محلي آمن',
    'howItWorks.step6.desc': 'التعديلات تُطبّق بعد موافقتك',
    
    'advantages.title': 'ما يميزنا عن المنافسين',
    'advantages.subtitle': 'ميزات متقدمة تجعل ULAB الخيار الأول',
    'advantages.memory.title': 'تخزين مؤقت ذكي للسياق',
    'advantages.memory.desc': 'يحفظ نتائج البحث ويعيد استخدامها — أسرع بـ 10x',
    'advantages.permissions.title': 'خريطة بصرية للكود',
    'advantages.permissions.desc': 'اعرض علاقات الملفات بشكل بصري تفاعلي',
    'advantages.approval.title': 'وضع مقارنة AI',
    'advantages.approval.desc': 'أرسل نفس السياق لعدة AI وقارن ردودهم',
    'advantages.map.title': 'مساحة عمل متعددة المشاريع',
    'advantages.map.desc': 'اعمل على عدة مشاريع مع تبديل سلس',
    'advantages.compare.title': 'جدول زمني للتراجع',
    'advantages.compare.desc': 'سجل كامل لكل التعديلات',
    'advantages.tasks.title': 'نظام إضافات مفتوح',
    'advantages.tasks.desc': 'وسّع القدرات بإضافات المجتمع',
    'advantages.plugins.title': 'مزامنة فريق P2P',
    'advantages.plugins.desc': 'شارك السياق مع فريقك بدون خادم مركزي',
    'advantages.team.title': 'فهرسة وثائق محلية',
    'advantages.team.desc': 'فهرس الوثائق محليًا كمرجع دون إنترنت',
    
    'architecture.title': 'البنية التقنية',
    'architecture.subtitle': 'معمارية محلية بالكامل — بدون خوادم سحابية',
    'architecture.local': 'بنية ULAB — المعالجة المحلية',
    'architecture.cloud': 'البنية السحابية التقليدية',
    'architecture.localNote': '✓ ملفاتك تبقى على جهازك دائمًا',
    'architecture.cloudNote': '✗ ملفاتك تمر عبر خوادم متعددة',
    'architecture.local.user': 'المستخدم',
    'architecture.local.aiChat': 'محادثة الذكاء الاصطناعي',
    'architecture.local.extension': 'إضافة المتصفح (ULAB)',
    'architecture.local.engine': 'محرك المشروع المحلي',
    'architecture.local.files': 'ملفات المستخدم',
    'architecture.cloud.userFiles': 'ملفات المستخدم',
    'architecture.cloud.server': 'خادم المشروع السحابي',
    'architecture.cloud.aiServer': 'خادم الذكاء الاصطناعي',
    'architecture.cloud.user': 'المستخدم',
    
    'roadmap.title': 'خريطة الطريق',
    'roadmap.subtitle': 'تطوير تدريجي مدروس',
    'roadmap.phase1': 'Chrome Extension + Project Tree',
    'roadmap.phase1.desc': 'إضافة المتصفح واختيار المجلد وعرض شجرة الملفات',
    'roadmap.phase2': 'Local Search + File Reading',
    'roadmap.phase2.desc': 'البحث المحلي وقراءة الملفات',
    'roadmap.phase3': 'Context Engine',
    'roadmap.phase3.desc': 'محرك اختيار السياق الذكي',
    'roadmap.phase4': 'AI Integration',
    'roadmap.phase4.desc': 'تكامل مع ChatGPT و Gemini',
    'roadmap.phase5': 'File Modifications + Permissions',
    'roadmap.phase5.desc': 'تعديل الملفات مع نظام الصلاحيات',
    'roadmap.phase6': 'Local Agent + Terminal + Git',
    'roadmap.phase6.desc': 'الوكيل المحلي والطرفية',
    'roadmap.current': 'جاري التطوير',
    
    'faq.title': 'أسئلة شائعة',
    'faq.subtitle': 'إجابات على أكثر الأسئلة شيوعًا',
    'faq.q1': 'هل يحتاج المشروع إلى خادم سحابي؟',
    'faq.a1': 'لا! المشروع يعمل بالكامل محليًا على جهازك. لا تحتاج إلى أي خادم أو حساب أو API Key خاص بنا.',
    'faq.q2': 'هل ملفاتي آمنة؟',
    'faq.a2': 'نعم، ملفاتك لا تغادر جهازك أبدًا. كل المعالجة تتم محليًا باستخدام File System Access API في المتصفح.',
    'faq.q3': 'ما المتصفحات المدعومة؟',
    'faq.a3': 'Chrome و Edge (الإصدارات الحديثة) لأنهما يدعمان File System Access API. نعمل على دعم متصفحات أخرى.',
    'faq.q4': 'هل يمكن استخدام المشروع مع أي AI؟',
    'faq.a4': 'نعم! البروتوكول الموحد ULP يعمل مع ChatGPT و Gemini و Claude و DeepSeek وأي مزود AI آخر.',
    'faq.q5': 'هل المشروع مجاني؟',
    'faq.a5': 'نعم، النواة الأساسية مجانية ومفتوحة المصدر تحت رخصة MIT. يمكنك استخدامها وتعديلها بحرية.',
    'faq.q6': 'كيف يتعامل مع المشاريع الضخمة؟',
    'faq.a6': 'بدلًا من إرسال المشروع كاملًا، يقوم محرك السياق بتحليل بنيتك واستخراج الملفات ذات الصلة فقط — مما يجعله مثاليًا للمشاريع الكبيرة.',
    
    'cta.title': 'جاهز لربط AI بجهازك؟',
    'cta.subtitle': 'جرّب الأداة الآن — اختر مجلد مشروعك وشاهد كيف يعمل الجسر المحلي.',
    'cta.button': 'إطلاق الأداة',
    'cta.download': 'تحميل التطبيق',
    
    'footer.rights': '© 2025 Universal Local AI Bridge. مفتوح المصدر تحت رخصة MIT.',
    'footer.local': 'محلي أولًا',
    'footer.privacy': 'خصوصية أولاً',
    
    'workspace.title': 'مساحة العمل',
    'workspace.launch': 'إطلاق الأداة',
    'workspace.files': 'الملفات',
    'workspace.search': 'بحث',
    'workspace.map': 'خريطة',
    'workspace.ai': 'AI',
    'workspace.bridge': 'Bridge',
    'workspace.agent': 'Agent',
    'workspace.context': 'السياق',
    'workspace.memory': 'الذاكرة',
    'workspace.permissions': 'الصلاحيات',
    'workspace.tasks': 'المهام',
    'workspace.compare': 'مقارنة',
    'workspace.git': 'Git',
    'workspace.terminal': 'Terminal',
    'workspace.settings': 'إعدادات',
    'workspace.log': 'السجل',
    'workspace.openFolder': 'فتح مجلد',
    'workspace.demoMode': 'الوضع التجريبي',
    'workspace.connected': 'متصل محليًا',
    'workspace.disconnected': 'غير متصل',
    'workspace.readonly': 'قراءة فقط',
    'workspace.assisted': 'بمساعدة',
    'workspace.agentMode': 'وكيل',
    'workspace.security': 'الأمان',
    'workspace.active': 'نشط',
    'workspace.shortcuts': 'الاختصارات',
    
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.close': 'إغلاق',
    'common.next': 'التالي',
    'common.previous': 'السابق',
  },
  
  // English
  en: {
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.advantages': 'Advantages',
    'nav.architecture': 'Architecture',
    'nav.roadmap': 'Roadmap',
    'nav.launch': 'Launch Tool',
    'nav.download': 'Download ULAB',
    'nav.back': 'Home',
    
    'hero.badge': 'Beta version available now — Try the tool',
    'hero.title1': 'The Universal Local Bridge',
    'hero.title2': 'for Artificial Intelligence',
    'hero.subtitle': 'Connect any AI to your computer and projects locally. Full privacy • Huge projects • Free forever',
    'hero.cta': 'Launch Tool Now',
    'hero.download': 'Download ULAB for Windows',
    'hero.watch': 'Watch How It Works',
    'hero.compatible': 'Compatible with all AI providers',
    
    'features.title': 'Core Features',
    'features.subtitle': 'Everything you need to connect AI to your local workspace',
    'features.context.title': 'Project Context Engine',
    'features.context.desc': 'Smart local indexing that understands your project structure and finds relevant files',
    'features.search.title': 'On-Demand Smart Search',
    'features.search.desc': "Don't send the whole project — the system sends only the necessary context to AI",
    'features.privacy.title': 'Absolute Privacy',
    'features.privacy.desc': 'All processing happens locally on your device. No cloud servers',
    'features.universal.title': 'Compatible with Any AI',
    'features.universal.desc': 'ULP protocol works with ChatGPT, Gemini, Claude, DeepSeek',
    'features.git.title': 'Full Git Integration',
    'features.git.desc': 'Monitor changes, manage branches, and review diffs',
    'features.terminal.title': 'Command Execution',
    'features.terminal.desc': 'Run terminal commands and tests through AI',
    
    'stats.local': 'Local First',
    'stats.providers': 'AI Providers',
    'stats.projects': 'Project Size',
    'stats.servers': 'Cloud Servers',
    
    'howItWorks.title': 'How It Works?',
    'howItWorks.subtitle': 'Six simple steps from question to solution',
    'howItWorks.step1.title': 'Choose Project Folder',
    'howItWorks.step1.desc': 'Select your project folder — the system automatically detects the structure',
    'howItWorks.step2.title': 'Ask Any AI',
    'howItWorks.step2.desc': 'Type your question in ChatGPT or Gemini as usual',
    'howItWorks.step3.title': 'Smart Local Search',
    'howItWorks.step3.desc': 'ULAB searches locally for relevant files',
    'howItWorks.step4.title': 'Send Context Only',
    'howItWorks.step4.desc': 'Sends only the necessary files',
    'howItWorks.step5.title': 'AI Analyzes and Suggests',
    'howItWorks.step5.desc': 'Artificial intelligence provides the solution',
    'howItWorks.step6.title': 'Safe Local Application',
    'howItWorks.step6.desc': 'Changes are applied after your approval',
    
    'advantages.title': 'What Sets Us Apart',
    'advantages.subtitle': 'Advanced features that make ULAB the first choice',
    'advantages.memory.title': 'Smart Context Caching',
    'advantages.memory.desc': 'Saves search results and reuses them — 10x faster',
    'advantages.permissions.title': 'Visual Code Map',
    'advantages.permissions.desc': 'Display file relationships in an interactive visual format',
    'advantages.approval.title': 'AI Comparison Mode',
    'advantages.approval.desc': 'Send the same context to multiple AIs and compare their responses',
    'advantages.map.title': 'Multi-Project Workspace',
    'advantages.map.desc': 'Work on multiple projects with seamless switching',
    'advantages.compare.title': 'Undo Timeline',
    'advantages.compare.desc': 'Complete history of all changes',
    'advantages.tasks.title': 'Open Plugin System',
    'advantages.tasks.desc': 'Extend capabilities with community plugins',
    'advantages.plugins.title': 'P2P Team Sync',
    'advantages.plugins.desc': 'Share context with your team without a central server',
    'advantages.team.title': 'Local Documentation Index',
    'advantages.team.desc': 'Index documentation locally as a reference without internet',
    
    'architecture.title': 'Technical Architecture',
    'architecture.subtitle': 'Fully local architecture — zero cloud servers',
    'architecture.local': 'ULAB Architecture — Local Processing',
    'architecture.cloud': 'Traditional Cloud Architecture',
    'architecture.localNote': '✓ Your files stay on your device',
    'architecture.cloudNote': '✗ Your files travel through multiple servers',
    'architecture.local.user': 'User',
    'architecture.local.aiChat': 'AI Chat Interface',
    'architecture.local.extension': 'Browser Extension (ULAB)',
    'architecture.local.engine': 'Local Project Engine',
    'architecture.local.files': 'User Files',
    'architecture.cloud.userFiles': 'User Files',
    'architecture.cloud.server': 'Cloud Project Server',
    'architecture.cloud.aiServer': 'AI Server',
    'architecture.cloud.user': 'User',
    
    'roadmap.title': 'Roadmap',
    'roadmap.subtitle': 'Carefully planned gradual development',
    'roadmap.phase1': 'Chrome Extension + Project Tree',
    'roadmap.phase1.desc': 'Browser extension, folder selection, and file tree display',
    'roadmap.phase2': 'Local Search + File Reading',
    'roadmap.phase2.desc': 'Local search and file reading',
    'roadmap.phase3': 'Context Engine',
    'roadmap.phase3.desc': 'Smart context selection engine',
    'roadmap.phase4': 'AI Integration',
    'roadmap.phase4.desc': 'Integration with ChatGPT and Gemini',
    'roadmap.phase5': 'File Modifications + Permissions',
    'roadmap.phase5.desc': 'File editing with permission system',
    'roadmap.phase6': 'Local Agent + Terminal + Git',
    'roadmap.phase6.desc': 'Local agent and terminal',
    'roadmap.current': 'In Development',
    
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Answers to the most common questions',
    'faq.q1': 'Does the project need a cloud server?',
    'faq.a1': 'No! The project runs entirely locally on your device. You don\'t need any server, account, or API key from us.',
    'faq.q2': 'Are my files safe?',
    'faq.a2': 'Yes, your files never leave your device. All processing happens locally using the File System Access API in the browser.',
    'faq.q3': 'What browsers are supported?',
    'faq.a3': 'Chrome and Edge (modern versions) because they support the File System Access API. We\'re working on supporting other browsers.',
    'faq.q4': 'Can the project be used with any AI?',
    'faq.a4': 'Yes! The unified ULP protocol works with ChatGPT, Gemini, Claude, DeepSeek, and any other AI provider.',
    'faq.q5': 'Is the project free?',
    'faq.a5': 'Yes, the core is free and open source under the MIT license. You can use and modify it freely.',
    'faq.q6': 'How does it handle huge projects?',
    'faq.a6': 'Instead of sending the whole project, the context engine analyzes your structure and extracts only relevant files — making it ideal for large projects.',
    
    'cta.title': 'Ready to Connect AI to Your Device?',
    'cta.subtitle': 'Try the tool now — select your project folder and see how the local bridge works.',
    'cta.button': 'Launch Tool',
    'cta.download': 'Download the App',
    
    'footer.rights': '© 2025 Universal Local AI Bridge. Open source under MIT license.',
    'footer.local': 'Local by Default',
    'footer.privacy': 'Privacy by Design',
    
    'workspace.title': 'Workspace',
    'workspace.launch': 'Launch Tool',
    'workspace.files': 'Files',
    'workspace.search': 'Search',
    'workspace.map': 'Map',
    'workspace.ai': 'AI',
    'workspace.bridge': 'Bridge',
    'workspace.agent': 'Agent',
    'workspace.context': 'Context',
    'workspace.memory': 'Memory',
    'workspace.permissions': 'Permissions',
    'workspace.tasks': 'Tasks',
    'workspace.compare': 'Compare',
    'workspace.git': 'Git',
    'workspace.terminal': 'Terminal',
    'workspace.settings': 'Settings',
    'workspace.log': 'Log',
    'workspace.openFolder': 'Open Folder',
    'workspace.demoMode': 'Demo Mode',
    'workspace.connected': 'Connected Locally',
    'workspace.disconnected': 'Disconnected',
    'workspace.readonly': 'Read Only',
    'workspace.assisted': 'Assisted',
    'workspace.agentMode': 'Agent',
    'workspace.security': 'Security',
    'workspace.active': 'Active',
    'workspace.shortcuts': 'Shortcuts',
    
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  
  // Spanish
  es: {
    'nav.features': 'Características',
    'nav.howItWorks': 'Cómo Funciona',
    'nav.advantages': 'Ventajas',
    'nav.architecture': 'Arquitectura',
    'nav.roadmap': 'Hoja de Ruta',
    'nav.launch': 'Iniciar Herramienta',
    'nav.download': 'Descargar ULAB',
    'nav.back': 'Inicio',
    
    'hero.badge': 'Versión beta disponible ahora — Prueba la herramienta',
    'hero.title1': 'El Puente Local Universal',
    'hero.title2': 'para la Inteligencia Artificial',
    'hero.subtitle': 'Conecta cualquier IA a tu computadora y proyectos localmente. Privacidad total • Proyectos grandes • Gratis para siempre',
    'hero.cta': 'Iniciar Herramienta Ahora',
    'hero.download': 'Descargar ULAB para Windows',
    'hero.watch': 'Ver Cómo Funciona',
    'hero.compatible': 'Compatible con todos los proveedores de IA',
    
    'features.title': 'Características Principales',
    'features.subtitle': 'Todo lo que necesitas para conectar IA a tu espacio de trabajo local',
    'features.context.title': 'Motor de Contexto del Proyecto',
    'features.context.desc': 'Indexación local inteligente que entiende la estructura de tu proyecto y encuentra archivos relevantes',
    'features.search.title': 'Búsqueda Inteligente Bajo Demanda',
    'features.search.desc': 'No envíes todo el proyecto — el sistema envía solo el contexto necesario a la IA',
    'features.privacy.title': 'Privacidad Absoluta',
    'features.privacy.desc': 'Todo el procesamiento ocurre localmente en tu dispositivo. Sin servidores en la nube',
    'features.universal.title': 'Compatible con Cualquier IA',
    'features.universal.desc': 'El protocolo ULP funciona con ChatGPT, Gemini, Claude, DeepSeek',
    'features.git.title': 'Integración Completa con Git',
    'features.git.desc': 'Monitorea cambios, gestiona ramas y revisa diferencias',
    'features.terminal.title': 'Ejecución de Comandos',
    'features.terminal.desc': 'Ejecuta comandos de terminal y pruebas a través de IA',
    
    'stats.local': 'Local Primero',
    'stats.providers': 'Proveedores de IA',
    'stats.projects': 'Tamaño del Proyecto',
    'stats.servers': 'Servidores en la Nube',
    
    'howItWorks.title': '¿Cómo Funciona?',
    'howItWorks.subtitle': 'Seis pasos simples de la pregunta a la solución',
    'howItWorks.step1.title': 'Elige Carpeta del Proyecto',
    'howItWorks.step1.desc': 'Selecciona la carpeta de tu proyecto — el sistema detecta automáticamente la estructura',
    'howItWorks.step2.title': 'Pregunta a Cualquier IA',
    'howItWorks.step2.desc': 'Escribe tu pregunta en ChatGPT o Gemini como de costumbre',
    'howItWorks.step3.title': 'Búsqueda Local Inteligente',
    'howItWorks.step3.desc': 'ULAB busca localmente archivos relevantes',
    'howItWorks.step4.title': 'Enviar Solo Contexto',
    'howItWorks.step4.desc': 'Envía solo los archivos necesarios',
    'howItWorks.step5.title': 'IA Analiza y Sugiere',
    'howItWorks.step5.desc': 'La inteligencia artificial proporciona la solución',
    'howItWorks.step6.title': 'Aplicación Local Segura',
    'howItWorks.step6.desc': 'Los cambios se aplican después de tu aprobación',
    
    'advantages.title': 'Lo Que Nos Diferencia',
    'advantages.subtitle': 'Características avanzadas que hacen de ULAB la primera opción',
    'advantages.memory.title': 'Caché de Contexto Inteligente',
    'advantages.memory.desc': 'Guarda resultados de búsqueda y los reutiliza — 10x más rápido',
    'advantages.permissions.title': 'Mapa Visual de Código',
    'advantages.permissions.desc': 'Muestra relaciones de archivos en un formato visual interactivo',
    'advantages.approval.title': 'Modo de Comparación de IA',
    'advantages.approval.desc': 'Envía el mismo contexto a múltiples IAs y compara sus respuestas',
    'advantages.map.title': 'Espacio de Trabajo Multi-Proyecto',
    'advantages.map.desc': 'Trabaja en múltiples proyectos con cambio fluido',
    'advantages.compare.title': 'Línea de Tiempo de Deshacer',
    'advantages.compare.desc': 'Historial completo de todos los cambios',
    'advantages.tasks.title': 'Sistema de Plugins Abierto',
    'advantages.tasks.desc': 'Extiende capacidades con plugins de la comunidad',
    'advantages.plugins.title': 'Sincronización P2P de Equipo',
    'advantages.plugins.desc': 'Comparte contexto con tu equipo sin servidor central',
    'advantages.team.title': 'Índice de Documentación Local',
    'advantages.team.desc': 'Indexa documentación localmente como referencia sin internet',
    
    'architecture.title': 'Arquitectura Técnica',
    'architecture.subtitle': 'Arquitectura completamente local — sin servidores en la nube',
    'architecture.local': 'Arquitectura ULAB — Procesamiento Local',
    'architecture.cloud': 'Arquitectura en la Nube Tradicional',
    'architecture.localNote': '✓ Tus archivos permanecen en tu dispositivo',
    'architecture.cloudNote': '✗ Tus archivos viajan por múltiples servidores',
    'architecture.local.user': 'Usuario',
    'architecture.local.aiChat': 'Interfaz de Chat IA',
    'architecture.local.extension': 'Extensión del Navegador (ULAB)',
    'architecture.local.engine': 'Motor de Proyecto Local',
    'architecture.local.files': 'Archivos del Usuario',
    'architecture.cloud.userFiles': 'Archivos del Usuario',
    'architecture.cloud.server': 'Servidor de Proyecto en la Nube',
    'architecture.cloud.aiServer': 'Servidor de IA',
    'architecture.cloud.user': 'Usuario',
    
    'roadmap.title': 'Hoja de Ruta',
    'roadmap.subtitle': 'Desarrollo gradual cuidadosamente planificado',
    'roadmap.phase1': 'Extensión de Chrome + Árbol de Proyecto',
    'roadmap.phase1.desc': 'Extensión del navegador, selección de carpeta y visualización de árbol de archivos',
    'roadmap.phase2': 'Búsqueda Local + Lectura de Archivos',
    'roadmap.phase2.desc': 'Búsqueda local y lectura de archivos',
    'roadmap.phase3': 'Motor de Contexto',
    'roadmap.phase3.desc': 'Motor de selección de contexto inteligente',
    'roadmap.phase4': 'Integración con IA',
    'roadmap.phase4.desc': 'Integración con ChatGPT y Gemini',
    'roadmap.phase5': 'Modificaciones de Archivos + Permisos',
    'roadmap.phase5.desc': 'Edición de archivos con sistema de permisos',
    'roadmap.phase6': 'Agente Local + Terminal + Git',
    'roadmap.phase6.desc': 'Agente local y terminal',
    'roadmap.current': 'En Desarrollo',
    
    'faq.title': 'Preguntas Frecuentes',
    'faq.subtitle': 'Respuestas a las preguntas más comunes',
    'faq.q1': '¿El proyecto necesita un servidor en la nube?',
    'faq.a1': '¡No! El proyecto se ejecuta completamente local en tu dispositivo. No necesitas ningún servidor, cuenta o clave API nuestra.',
    'faq.q2': '¿Mis archivos están seguros?',
    'faq.a2': 'Sí, tus archivos nunca salen de tu dispositivo. Todo el procesamiento ocurre localmente usando la API de Acceso al Sistema de Archivos en el navegador.',
    'faq.q3': '¿Qué navegadores son compatibles?',
    'faq.a3': 'Chrome y Edge (versiones modernas) porque soportan la API de Acceso al Sistema de Archivos. Estamos trabajando en soportar otros navegadores.',
    'faq.q4': '¿Se puede usar el proyecto con cualquier IA?',
    'faq.a4': '¡Sí! El protocolo unificado ULP funciona con ChatGPT, Gemini, Claude, DeepSeek y cualquier otro proveedor de IA.',
    'faq.q5': '¿El proyecto es gratuito?',
    'faq.a5': 'Sí, el núcleo es gratuito y de código abierto bajo la licencia MIT. Puedes usarlo y modificarlo libremente.',
    'faq.q6': '¿Cómo maneja proyectos enormes?',
    'faq.a6': 'En lugar de enviar todo el proyecto, el motor de contexto analiza tu estructura y extrae solo archivos relevantes — haciéndolo ideal para proyectos grandes.',
    
    'cta.title': '¿Listo para Conectar IA a Tu Dispositivo?',
    'cta.subtitle': 'Prueba la herramienta ahora — selecciona la carpeta de tu proyecto y ve cómo funciona el puente local.',
    'cta.button': 'Iniciar Herramienta',
    'cta.download': 'Descargar la aplicación',
    
    'footer.rights': '© 2025 Universal Local AI Bridge. Código abierto bajo licencia MIT.',
    'footer.local': 'Local por Defecto',
    'footer.privacy': 'Privacidad por Diseño',
    
    'workspace.title': 'Espacio de Trabajo',
    'workspace.launch': 'Iniciar Herramienta',
    'workspace.files': 'Archivos',
    'workspace.search': 'Buscar',
    'workspace.map': 'Mapa',
    'workspace.ai': 'IA',
    'workspace.bridge': 'Puente',
    'workspace.agent': 'Agente',
    'workspace.context': 'Contexto',
    'workspace.memory': 'Memoria',
    'workspace.permissions': 'Permisos',
    'workspace.tasks': 'Tareas',
    'workspace.compare': 'Comparar',
    'workspace.git': 'Git',
    'workspace.terminal': 'Terminal',
    'workspace.settings': 'Configuración',
    'workspace.log': 'Registro',
    'workspace.openFolder': 'Abrir Carpeta',
    'workspace.demoMode': 'Modo Demo',
    'workspace.connected': 'Conectado Localmente',
    'workspace.disconnected': 'Desconectado',
    'workspace.readonly': 'Solo Lectura',
    'workspace.assisted': 'Asistido',
    'workspace.agentMode': 'Agente',
    'workspace.security': 'Seguridad',
    'workspace.active': 'Activo',
    'workspace.shortcuts': 'Atajos',
    
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
  },

  // French
  fr: {
    'nav.features': 'Fonctionnalités',
    'nav.howItWorks': 'Comment ça marche',
    'nav.advantages': 'Avantages',
    'nav.architecture': 'Architecture',
    'nav.roadmap': 'Feuille de route',
    'nav.launch': 'Lancer l\'outil',
    'nav.download': 'Télécharger ULAB',
    'nav.back': 'Accueil',
    
    'hero.badge': 'Version bêta disponible maintenant — Essayez l\'outil',
    'hero.title1': 'Le Pont Local Universel',
    'hero.title2': 'pour l\'Intelligence Artificielle',
    'hero.subtitle': 'Connectez n\'importe quelle IA à votre ordinateur et vos projets localement. Confidentialité totale • Projets volumineux • Gratuit pour toujours',
    'hero.cta': 'Lancer l\'outil maintenant',
    'hero.download': 'Télécharger ULAB pour Windows',
    'hero.watch': 'Voir comment ça marche',
    'hero.compatible': 'Compatible avec tous les fournisseurs d\'IA',
    
    'features.title': 'Fonctionnalités principales',
    'features.subtitle': 'Tout ce dont vous avez besoin pour connecter l\'IA à votre espace de travail local',
    'features.context.title': 'Moteur de contexte de projet',
    'features.context.desc': 'Indexation locale intelligente qui comprend la structure de votre projet et trouve les fichiers pertinents',
    'features.search.title': 'Recherche intelligente à la demande',
    'features.search.desc': 'N\'envoyez pas tout le projet — le système envoie uniquement le contexte nécessaire à l\'IA',
    'features.privacy.title': 'Confidentialité absolue',
    'features.privacy.desc': 'Tout le traitement se fait localement sur votre appareil. Pas de serveurs cloud',
    'features.universal.title': 'Compatible avec n\'importe quelle IA',
    'features.universal.desc': 'Le protocole ULP fonctionne avec ChatGPT, Gemini, Claude, DeepSeek',
    'features.git.title': 'Intégration Git complète',
    'features.git.desc': 'Surveillez les modifications, gérez les branches et examinez les différences',
    'features.terminal.title': 'Exécution de commandes',
    'features.terminal.desc': 'Exécutez des commandes de terminal et des tests via l\'IA',
    
    'stats.local': 'Local d\'abord',
    'stats.providers': 'Fournisseurs d\'IA',
    'stats.projects': 'Taille du projet',
    'stats.servers': 'Serveurs cloud',
    
    'howItWorks.title': 'Comment ça marche?',
    'howItWorks.subtitle': 'Six étapes simples de la question à la solution',
    'howItWorks.step1.title': 'Choisissez le dossier du projet',
    'howItWorks.step1.desc': 'Sélectionnez le dossier de votre projet — le système détecte automatiquement la structure',
    'howItWorks.step2.title': 'Demandez à n\'importe quelle IA',
    'howItWorks.step2.desc': 'Tapez votre question dans ChatGPT ou Gemini comme d\'habitude',
    'howItWorks.step3.title': 'Recherche locale intelligente',
    'howItWorks.step3.desc': 'ULAB recherche localement les fichiers pertinents',
    'howItWorks.step4.title': 'Envoyer uniquement le contexte',
    'howItWorks.step4.desc': 'Envoie uniquement les fichiers nécessaires',
    'howItWorks.step5.title': 'L\'IA analyse et suggère',
    'howItWorks.step5.desc': 'L\'intelligence artificielle fournit la solution',
    'howItWorks.step6.title': 'Application locale sécurisée',
    'howItWorks.step6.desc': 'Les modifications sont appliquées après votre approbation',
    
    'advantages.title': 'Ce qui nous distingue',
    'advantages.subtitle': 'Fonctionnalités avancées qui font de ULAB le premier choix',
    'advantages.memory.title': 'Cache de contexte intelligent',
    'advantages.memory.desc': 'Enregistre les résultats de recherche et les réutilise — 10 fois plus rapide',
    'advantages.permissions.title': 'Carte visuelle du code',
    'advantages.permissions.desc': 'Affiche les relations entre fichiers dans un format visuel interactif',
    'advantages.approval.title': 'Mode de comparaison d\'IA',
    'advantages.approval.desc': 'Envoyez le même contexte à plusieurs IA et comparez leurs réponses',
    'advantages.map.title': 'Espace de travail multi-projets',
    'advantages.map.desc': 'Travaillez sur plusieurs projets avec un changement fluide',
    'advantages.compare.title': 'Chronologie d\'annulation',
    'advantages.compare.desc': 'Historique complet de toutes les modifications',
    'advantages.tasks.title': 'Système de plugins ouvert',
    'advantages.tasks.desc': 'Étendez les capacités avec des plugins communautaires',
    'advantages.plugins.title': 'Synchronisation P2P d\'équipe',
    'advantages.plugins.desc': 'Partagez le contexte avec votre équipe sans serveur central',
    'advantages.team.title': 'Index de documentation local',
    'advantages.team.desc': 'Indexez la documentation localement comme référence sans internet',
    
    'architecture.title': 'Architecture Technique',
    'architecture.subtitle': 'Architecture entièrement locale — aucun serveur cloud',
    'architecture.local': 'Architecture ULAB — Traitement Local',
    'architecture.cloud': 'Architecture Cloud Traditionnelle',
    'architecture.localNote': '✓ Vos fichiers restent sur votre appareil',
    'architecture.cloudNote': '✗ Vos fichiers transitent par plusieurs serveurs',
    'architecture.local.user': 'Utilisateur',
    'architecture.local.aiChat': 'Interface de Chat IA',
    'architecture.local.extension': 'Extension de Navigateur (ULAB)',
    'architecture.local.engine': 'Moteur de Projet Local',
    'architecture.local.files': 'Fichiers Utilisateur',
    'architecture.cloud.userFiles': 'Fichiers Utilisateur',
    'architecture.cloud.server': 'Serveur de Projet Cloud',
    'architecture.cloud.aiServer': 'Serveur IA',
    'architecture.cloud.user': 'Utilisateur',
    
    'roadmap.title': 'Feuille de route',
    'roadmap.subtitle': 'Développement progressif soigneusement planifié',
    'roadmap.phase1': 'Extension Chrome + Arborescence de projet',
    'roadmap.phase1.desc': 'Extension de navigateur, sélection de dossier et affichage d\'arborescence de fichiers',
    'roadmap.phase2': 'Recherche locale + Lecture de fichiers',
    'roadmap.phase2.desc': 'Recherche locale et lecture de fichiers',
    'roadmap.phase3': 'Moteur de contexte',
    'roadmap.phase3.desc': 'Moteur de sélection de contexte intelligent',
    'roadmap.phase4': 'Intégration IA',
    'roadmap.phase4.desc': 'Intégration avec ChatGPT et Gemini',
    'roadmap.phase5': 'Modifications de fichiers + Permissions',
    'roadmap.phase5.desc': 'Édition de fichiers avec système de permissions',
    'roadmap.phase6': 'Agent local + Terminal + Git',
    'roadmap.phase6.desc': 'Agent local et terminal',
    'roadmap.current': 'En développement',
    
    'faq.title': 'Questions fréquemment posées',
    'faq.subtitle': 'Réponses aux questions les plus courantes',
    'faq.q1': 'Le projet a-t-il besoin d\'un serveur cloud?',
    'faq.a1': 'Non! Le projet s\'exécute entièrement localement sur votre appareil. Vous n\'avez besoin d\'aucun serveur, compte ou clé API de notre part.',
    'faq.q2': 'Mes fichiers sont-ils sécurisés?',
    'faq.a2': 'Oui, vos fichiers ne quittent jamais votre appareil. Tout le traitement se fait localement en utilisant l\'API File System Access dans le navigateur.',
    'faq.q3': 'Quels navigateurs sont supportés?',
    'faq.a3': 'Chrome et Edge (versions modernes) car ils supportent l\'API File System Access. Nous travaillons sur le support d\'autres navigateurs.',
    'faq.q4': 'Le projet peut-il être utilisé avec n\'importe quelle IA?',
    'faq.a4': 'Oui! Le protocole unifié ULP fonctionne avec ChatGPT, Gemini, Claude, DeepSeek et tout autre fournisseur d\'IA.',
    'faq.q5': 'Le projet est-il gratuit?',
    'faq.a5': 'Oui, le noyau est gratuit et open source sous licence MIT. Vous pouvez l\'utiliser et le modifier librement.',
    'faq.q6': 'Comment gère-t-il les projets énormes?',
    'faq.a6': 'Au lieu d\'envoyer tout le projet, le moteur de contexte analyse votre structure et extrait uniquement les fichiers pertinents — le rendant idéal pour les grands projets.',
    
    'cta.title': 'Prêt à connecter l\'IA à votre appareil?',
    'cta.subtitle': 'Essayez l\'outil maintenant — sélectionnez le dossier de votre projet et voyez comment le pont local fonctionne.',
    'cta.button': 'Lancer l\'outil',
    'cta.download': 'Télécharger l’application',
    
    'footer.rights': '© 2025 Universal Local AI Bridge. Open source sous licence MIT.',
    'footer.local': 'Local par défaut',
    'footer.privacy': 'Confidentialité par conception',
    
    'workspace.title': 'Espace de travail',
    'workspace.launch': 'Lancer l\'outil',
    'workspace.files': 'Fichiers',
    'workspace.search': 'Rechercher',
    'workspace.map': 'Carte',
    'workspace.ai': 'IA',
    'workspace.bridge': 'Pont',
    'workspace.agent': 'Agent',
    'workspace.context': 'Contexte',
    'workspace.memory': 'Mémoire',
    'workspace.permissions': 'Permissions',
    'workspace.tasks': 'Tâches',
    'workspace.compare': 'Comparer',
    'workspace.git': 'Git',
    'workspace.terminal': 'Terminal',
    'workspace.settings': 'Paramètres',
    'workspace.log': 'Journal',
    'workspace.openFolder': 'Ouvrir le dossier',
    'workspace.demoMode': 'Mode démo',
    'workspace.connected': 'Connecté localement',
    'workspace.disconnected': 'Déconnecté',
    'workspace.readonly': 'Lecture seule',
    'workspace.assisted': 'Assisté',
    'workspace.agentMode': 'Agent',
    'workspace.security': 'Sécurité',
    'workspace.active': 'Actif',
    'workspace.shortcuts': 'Raccourcis',
    
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
  },

  // Korean
  ko: {
    'nav.features': '기능',
    'nav.howItWorks': '작동 방식',
    'nav.advantages': '장점',
    'nav.architecture': '아키텍처',
    'nav.roadmap': '로드맵',
    'nav.launch': '도구 실행',
    'nav.download': 'ULAB 다운로드',
    'nav.back': '홈',
    
    'hero.badge': '베타 버전 출시 — 도구를 사용해 보세요',
    'hero.title1': '유니버설 로컬 브릿지',
    'hero.title2': '인공지능을 위한',
    'hero.subtitle': '어떤 AI든 로컬로 컴퓨터와 프로젝트에 연결하세요. 완전한 프라이버시 • 대규모 프로젝트 • 영원히 무료',
    'hero.cta': '지금 도구 실행',
    'hero.download': 'Windows용 ULAB 다운로드',
    'hero.watch': '작동 방식 보기',
    'hero.compatible': '모든 AI 제공업체와 호환',
    
    'features.title': '주요 기능',
    'features.subtitle': 'AI를 로컬 작업 공간에 연결하는 데 필요한 모든 것',
    'features.context.title': '프로젝트 컨텍스트 엔진',
    'features.context.desc': '프로젝트 구조를 이해하고 관련 파일을 찾는 스마트 로컬 인덱싱',
    'features.search.title': '온디맨드 스마트 검색',
    'features.search.desc': '전체 프로젝트를 보내지 마세요 — 시스템이 필요한 컨텍스트만 AI에게 보냅니다',
    'features.privacy.title': '절대적인 프라이버시',
    'features.privacy.desc': '모든 처리는 로컬 장치에서 이루어집니다. 클라우드 서버 없음',
    'features.universal.title': '어떤 AI와도 호환',
    'features.universal.desc': 'ULP 프로토콜은 ChatGPT, Gemini, Claude, DeepSeek와 작동합니다',
    'features.git.title': '완전한 Git 통합',
    'features.git.desc': '변경 사항 모니터링, 브랜치 관리, 차이점 검토',
    'features.terminal.title': '명령 실행',
    'features.terminal.desc': 'AI를 통해 터미널 명령과 테스트 실행',
    
    'stats.local': '로컬 우선',
    'stats.providers': 'AI 제공업체',
    'stats.projects': '프로젝트 크기',
    'stats.servers': '클라우드 서버',
    
    'howItWorks.title': '작동 방식?',
    'howItWorks.subtitle': '질문에서 해결까지 6단계',
    'howItWorks.step1.title': '프로젝트 폴더 선택',
    'howItWorks.step1.desc': '프로젝트 폴더를 선택하세요 — 시스템이 자동으로 구조를 감지합니다',
    'howItWorks.step2.title': '어떤 AI에게든 질문',
    'howItWorks.step2.desc': '평소처럼 ChatGPT나 Gemini에 질문을 입력하세요',
    'howItWorks.step3.title': '스마트 로컬 검색',
    'howItWorks.step3.desc': 'ULAB이 로컬에서 관련 파일을 검색합니다',
    'howItWorks.step4.title': '컨텍스트만 전송',
    'howItWorks.step4.desc': '필요한 파일만 보냅니다',
    'howItWorks.step5.title': 'AI가 분석하고 제안',
    'howItWorks.step5.desc': '인공지능이 해결책을 제공합니다',
    'howItWorks.step6.title': '안전한 로컬 적용',
    'howItWorks.step6.desc': '승인 후 변경 사항이 적용됩니다',
    
    'advantages.title': '우리를 차별화하는 것',
    'advantages.subtitle': 'ULAB을 최고의 선택으로 만드는 고급 기능',
    'advantages.memory.title': '스마트 컨텍스트 캐싱',
    'advantages.memory.desc': '검색 결과를 저장하고 재사용 — 10배 더 빠름',
    'advantages.permissions.title': '시각적 코드 맵',
    'advantages.permissions.desc': '대화형 시각 형식으로 파일 관계 표시',
    'advantages.approval.title': 'AI 비교 모드',
    'advantages.approval.desc': '여러 AI에 동일한 컨텍스트를 보내고 응답 비교',
    'advantages.map.title': '멀티 프로젝트 작업 공간',
    'advantages.map.desc': '원활한 전환으로 여러 프로젝트 작업',
    'advantages.compare.title': '실행 취소 타임라인',
    'advantages.compare.desc': '모든 변경 사항의 완전한 기록',
    'advantages.tasks.title': '오픈 플러그인 시스템',
    'advantages.tasks.desc': '커뮤니티 플러그인으로 기능 확장',
    'advantages.plugins.title': 'P2P 팀 동기화',
    'advantages.plugins.desc': '중앙 서버 없이 팀과 컨텍스트 공유',
    'advantages.team.title': '로컬 문서 인덱스',
    'advantages.team.desc': '인터넷 없이 참조로 로컬 문서 인덱싱',
    
    'architecture.title': '기술 아키텍처',
    'architecture.subtitle': '완전한 로컬 아키텍처 — 클라우드 서버 없음',
    'architecture.local': 'ULAB 아키텍처 — 로컬 처리',
    'architecture.cloud': '기존 클라우드 아키텍처',
    'architecture.localNote': '✓ 파일이 기기를 떠나지 않습니다',
    'architecture.cloudNote': '✗ 파일이 여러 서버를 거칩니다',
    'architecture.local.user': '사용자',
    'architecture.local.aiChat': 'AI 채팅 인터페이스',
    'architecture.local.extension': '브라우저 확장 프로그램 (ULAB)',
    'architecture.local.engine': '로컬 프로젝트 엔진',
    'architecture.local.files': '사용자 파일',
    'architecture.cloud.userFiles': '사용자 파일',
    'architecture.cloud.server': '클라우드 프로젝트 서버',
    'architecture.cloud.aiServer': 'AI 서버',
    'architecture.cloud.user': '사용자',
    
    'roadmap.title': '로드맵',
    'roadmap.subtitle': '신중하게 계획된 점진적 개발',
    'roadmap.phase1': 'Chrome 확장 프로그램 + 프로젝트 트리',
    'roadmap.phase1.desc': '브라우저 확장 프로그램, 폴더 선택 및 파일 트리 표시',
    'roadmap.phase2': '로컬 검색 + 파일 읽기',
    'roadmap.phase2.desc': '로컬 검색 및 파일 읽기',
    'roadmap.phase3': '컨텍스트 엔진',
    'roadmap.phase3.desc': '스마트 컨텍스트 선택 엔진',
    'roadmap.phase4': 'AI 통합',
    'roadmap.phase4.desc': 'ChatGPT 및 Gemini와 통합',
    'roadmap.phase5': '파일 수정 + 권한',
    'roadmap.phase5.desc': '권한 시스템이 있는 파일 편집',
    'roadmap.phase6': '로컬 에이전트 + 터미널 + Git',
    'roadmap.phase6.desc': '로컬 에이전트 및 터미널',
    'roadmap.current': '개발 중',
    
    'faq.title': '자주 묻는 질문',
    'faq.subtitle': '가장 일반적인 질문에 대한 답변',
    'faq.q1': '프로젝트에 클라우드 서버가 필요한가요?',
    'faq.a1': '아니요! 프로젝트는 장치에서 완전히 로컬로 실행됩니다. 당사의 서버, 계정 또는 API 키가 필요하지 않습니다.',
    'faq.q2': '내 파일이 안전한가요?',
    'faq.a2': '네, 파일이 장치를 떠나지 않습니다. 모든 처리는 브라우저의 File System Access API를 사용하여 로컬에서 이루어집니다.',
    'faq.q3': '어떤 브라우저가 지원되나요?',
    'faq.a3': 'Chrome과 Edge(최신 버전)는 File System Access API를 지원하기 때문입니다. 다른 브라우저 지원도 작업 중입니다.',
    'faq.q4': '프로젝트를 어떤 AI와 함께 사용할 수 있나요?',
    'faq.a4': '네! 통합 ULP 프로토콜은 ChatGPT, Gemini, Claude, DeepSeek 및 다른 AI 제공업체와 작동합니다.',
    'faq.q5': '프로젝트가 무료인가요?',
    'faq.a5': '네, 코어는 MIT 라이선스 하에 무료이고 오픈 소스입니다. 자유롭게 사용하고 수정할 수 있습니다.',
    'faq.q6': '거대한 프로젝트를 어떻게 처리하나요?',
    'faq.a6': '전체 프로젝트를 보내는 대신, 컨텍스트 엔진이 구조를 분석하고 관련 파일만 추출합니다 — 대규모 프로젝트에 이상적입니다.',
    
    'cta.title': 'AI를 장치에 연결할 준비가 되셨나요?',
    'cta.subtitle': '지금 도구를 사용해 보세요 — 프로젝트 폴더를 선택하고 로컬 브릿지가 어떻게 작동하는지 확인하세요.',
    'cta.button': '도구 실행',
    'cta.download': '앱 다운로드',
    
    'footer.rights': '© 2025 Universal Local AI Bridge. MIT 라이선스 하의 오픈 소스.',
    'footer.local': '기본적으로 로컬',
    'footer.privacy': '설계상 프라이버시',
    
    'workspace.title': '작업 공간',
    'workspace.launch': '도구 실행',
    'workspace.files': '파일',
    'workspace.search': '검색',
    'workspace.map': '맵',
    'workspace.ai': 'AI',
    'workspace.bridge': '브릿지',
    'workspace.agent': '에이전트',
    'workspace.context': '컨텍스트',
    'workspace.memory': '메모리',
    'workspace.permissions': '권한',
    'workspace.tasks': '작업',
    'workspace.compare': '비교',
    'workspace.git': 'Git',
    'workspace.terminal': '터미널',
    'workspace.settings': '설정',
    'workspace.log': '로그',
    'workspace.openFolder': '폴더 열기',
    'workspace.demoMode': '데모 모드',
    'workspace.connected': '로컬 연결됨',
    'workspace.disconnected': '연결 끊김',
    'workspace.readonly': '읽기 전용',
    'workspace.assisted': '지원됨',
    'workspace.agentMode': '에이전트',
    'workspace.security': '보안',
    'workspace.active': '활성',
    'workspace.shortcuts': '단축키',
    
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.success': '성공',
    'common.cancel': '취소',
    'common.confirm': '확인',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '편집',
    'common.close': '닫기',
    'common.next': '다음',
    'common.previous': '이전',
  },

  // Chinese (Simplified)
  zh: {
    'nav.features': '功能',
    'nav.howItWorks': '工作原理',
    'nav.advantages': '优势',
    'nav.architecture': '架构',
    'nav.roadmap': '路线图',
    'nav.launch': '启动工具',
    'nav.download': '下载 ULAB',
    'nav.back': '首页',
    
    'hero.badge': '测试版现已推出 — 试用工具',
    'hero.title1': '通用本地桥接器',
    'hero.title2': '为人工智能而生',
    'hero.subtitle': '将任何AI本地连接到您的计算机和项目。完全隐私 • 大型项目 • 永久免费',
    'hero.cta': '立即启动工具',
    'hero.download': '下载 Windows 版 ULAB',
    'hero.watch': '查看工作原理',
    'hero.compatible': '兼容所有AI提供商',
    
    'features.title': '核心功能',
    'features.subtitle': '将AI连接到本地工作空间所需的一切',
    'features.context.title': '项目上下文引擎',
    'features.context.desc': '智能本地索引，理解项目结构并找到相关文件',
    'features.search.title': '按需智能搜索',
    'features.search.desc': '不要发送整个项目 — 系统只发送必要的上下文给AI',
    'features.privacy.title': '绝对隐私',
    'features.privacy.desc': '所有处理都在您的设备本地进行。无云服务器',
    'features.universal.title': '兼容任何AI',
    'features.universal.desc': 'ULP协议适用于ChatGPT、Gemini、Claude、DeepSeek',
    'features.git.title': '完整的Git集成',
    'features.git.desc': '监控更改、管理分支和审查差异',
    'features.terminal.title': '命令执行',
    'features.terminal.desc': '通过AI运行终端命令和测试',
    
    'stats.local': '本地优先',
    'stats.providers': 'AI提供商',
    'stats.projects': '项目大小',
    'stats.servers': '云服务器',
    
    'howItWorks.title': '工作原理？',
    'howItWorks.subtitle': '从问题到解决方案的六个简单步骤',
    'howItWorks.step1.title': '选择项目文件夹',
    'howItWorks.step1.desc': '选择您的项目文件夹 — 系统自动检测结构',
    'howItWorks.step2.title': '向任何AI提问',
    'howItWorks.step2.desc': '像往常一样在ChatGPT或Gemini中输入您的问题',
    'howItWorks.step3.title': '智能本地搜索',
    'howItWorks.step3.desc': 'ULAB本地搜索相关文件',
    'howItWorks.step4.title': '仅发送上下文',
    'howItWorks.step4.desc': '只发送必要的文件',
    'howItWorks.step5.title': 'AI分析并建议',
    'howItWorks.step5.desc': '人工智能提供解决方案',
    'howItWorks.step6.title': '安全的本地应用',
    'howItWorks.step6.desc': '更改在您批准后应用',
    
    'advantages.title': '我们的独特之处',
    'advantages.subtitle': '使ULAB成为首选的高级功能',
    'advantages.memory.title': '智能上下文缓存',
    'advantages.memory.desc': '保存搜索结果并重用 — 快10倍',
    'advantages.permissions.title': '可视化代码地图',
    'advantages.permissions.desc': '以交互式可视化格式显示文件关系',
    'advantages.approval.title': 'AI比较模式',
    'advantages.approval.desc': '将相同上下文发送给多个AI并比较其响应',
    'advantages.map.title': '多项目工作空间',
    'advantages.map.desc': '无缝切换处理多个项目',
    'advantages.compare.title': '撤销时间线',
    'advantages.compare.desc': '所有更改的完整历史',
    'advantages.tasks.title': '开放插件系统',
    'advantages.tasks.desc': '使用社区插件扩展功能',
    'advantages.plugins.title': 'P2P团队同步',
    'advantages.plugins.desc': '无需中央服务器与团队共享上下文',
    'advantages.team.title': '本地文档索引',
    'advantages.team.desc': '无需互联网即可将文档本地索引为参考',
    
    'architecture.title': '技术架构',
    'architecture.subtitle': '完全本地架构 — 无云服务器',
    'architecture.local': 'ULAB架构 — 本地处理',
    'architecture.cloud': '传统云架构',
    'architecture.localNote': '✓ 文件永不离开您的设备',
    'architecture.cloudNote': '✗ 文件经过多个服务器',
    'architecture.local.user': '用户',
    'architecture.local.aiChat': 'AI聊天界面',
    'architecture.local.extension': '浏览器扩展 (ULAB)',
    'architecture.local.engine': '本地项目引擎',
    'architecture.local.files': '用户文件',
    'architecture.cloud.userFiles': '用户文件',
    'architecture.cloud.server': '云项目服务器',
    'architecture.cloud.aiServer': 'AI服务器',
    'architecture.cloud.user': '用户',
    
    'roadmap.title': '路线图',
    'roadmap.subtitle': '精心规划的渐进式开发',
    'roadmap.phase1': 'Chrome扩展 + 项目树',
    'roadmap.phase1.desc': '浏览器扩展、文件夹选择和文件树显示',
    'roadmap.phase2': '本地搜索 + 文件读取',
    'roadmap.phase2.desc': '本地搜索和文件读取',
    'roadmap.phase3': '上下文引擎',
    'roadmap.phase3.desc': '智能上下文选择引擎',
    'roadmap.phase4': 'AI集成',
    'roadmap.phase4.desc': '与ChatGPT和Gemini集成',
    'roadmap.phase5': '文件修改 + 权限',
    'roadmap.phase5.desc': '带权限系统的文件编辑',
    'roadmap.phase6': '本地代理 + 终端 + Git',
    'roadmap.phase6.desc': '本地代理和终端',
    'roadmap.current': '开发中',
    
    'faq.title': '常见问题',
    'faq.subtitle': '最常见问题的答案',
    'faq.q1': '项目需要云服务器吗？',
    'faq.a1': '不需要！项目完全在您的设备本地运行。您不需要我们的任何服务器、帐户或API密钥。',
    'faq.q2': '我的文件安全吗？',
    'faq.a2': '是的，您的文件永不离开您的设备。所有处理都使用浏览器中的File System Access API在本地进行。',
    'faq.q3': '支持哪些浏览器？',
    'faq.a3': 'Chrome和Edge（现代版本），因为它们支持File System Access API。我们正在努力支持其他浏览器。',
    'faq.q4': '项目可以与任何AI一起使用吗？',
    'faq.a4': '是的！统一的ULP协议适用于ChatGPT、Gemini、Claude、DeepSeek和任何其他AI提供商。',
    'faq.q5': '项目免费吗？',
    'faq.a5': '是的，核心是免费的，并在MIT许可下开源。您可以自由使用和修改它。',
    'faq.q6': '它如何处理巨大的项目？',
    'faq.a6': '上下文引擎不发送整个项目，而是分析您的结构并仅提取相关文件 — 使其非常适合大型项目。',
    
    'cta.title': '准备好将AI连接到您的设备了吗？',
    'cta.subtitle': '立即试用工具 — 选择您的项目文件夹，查看本地桥接器如何工作。',
    'cta.button': '启动工具',
    'cta.download': '下载应用',
    
    'footer.rights': '© 2025 Universal Local AI Bridge. MIT许可下的开源项目。',
    'footer.local': '默认本地',
    'footer.privacy': '设计隐私',
    
    'workspace.title': '工作空间',
    'workspace.launch': '启动工具',
    'workspace.files': '文件',
    'workspace.search': '搜索',
    'workspace.map': '地图',
    'workspace.ai': 'AI',
    'workspace.bridge': '桥接器',
    'workspace.agent': '代理',
    'workspace.context': '上下文',
    'workspace.memory': '内存',
    'workspace.permissions': '权限',
    'workspace.tasks': '任务',
    'workspace.compare': '比较',
    'workspace.git': 'Git',
    'workspace.terminal': '终端',
    'workspace.settings': '设置',
    'workspace.log': '日志',
    'workspace.openFolder': '打开文件夹',
    'workspace.demoMode': '演示模式',
    'workspace.connected': '本地已连接',
    'workspace.disconnected': '已断开',
    'workspace.readonly': '只读',
    'workspace.assisted': '辅助',
    'workspace.agentMode': '代理',
    'workspace.security': '安全',
    'workspace.active': '活动',
    'workspace.shortcuts': '快捷键',
    
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.close': '关闭',
    'common.next': '下一个',
    'common.previous': '上一个',
  },
};

// Language metadata
export const languageInfo: Record<Language, { name: string; nativeName: string; dir: 'ltr' | 'rtl'; flag: string }> = {
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  en: { name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  ko: { name: 'Korean', nativeName: '한국어', dir: 'ltr', flag: '🇰🇷' },
  zh: { name: 'Chinese', nativeName: '中文', dir: 'ltr', flag: '🇨🇳' },
};
