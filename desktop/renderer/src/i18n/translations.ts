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
    'hero.download': 'إضافة ULAB للمتصفح',
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
    'howItWorks.subtitle': 'أربعة خطوات بسيطة لربط AI بمشروعك',
    'howItWorks.step1.title': 'ثبّت إضافة المتصفح',
    'howItWorks.step1.desc': 'أضف ULAB إلى Chrome أو Edge — إضافة خفيفة وسريعة',
    'howItWorks.step2.title': 'شغّل الوكيل المحلي',
    'howItWorks.step2.desc': 'شغّل agent على جهازك — يطبع رمز أمان للمصادقة',
    'howItWorks.step3.title': 'اختر مساحة العمل',
    'howItWorks.step3.desc': 'حدد مجلد مشروعك — ULAB يحجز كل شيء محليًا',
    'howItWorks.step4.title': 'فعّل الجسر على أي AI',
    'howItWorks.step4.desc': 'افتح ChatGPT أو Claude واضغط Activate — الأدلة تنفّذ تلقائيًا',
    'howItWorks.step5.title': 'الأدلة تنفّذ تلقائيًا',
    'howItWorks.step5.desc': 'AI يطلب قراءة ملف أو بحث — ULAB ينفّذ ويُعيّد النتيجة',
    'howItWorks.step6.title': 'التعديلات بموافقتك',
    'howItWorks.step6.desc': 'write و delete و terminal تتطلب موافقتك الصريحة',
    
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
    'architecture.localNote': 'ملفاتك تبقى على جهازك دائمًا',
    'architecture.cloudNote': 'ملفاتك تمر عبر خوادم متعددة',
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
    'roadmap.subtitle': 'مسار التطوير والتقدم',
    'roadmap.phase1': 'Browser Extension + Agent',
    'roadmap.phase1.desc': 'إضافة المتصفح ووكيل محلي مع WebSocket وبروتوكول آمن',
    'roadmap.phase2': 'Automatic Bridge Loop',
    'roadmap.phase2.desc': 'اكتشاف tool calls تلقائيًا وتنفيذها وإعادة النتائج',
    'roadmap.phase3': 'Security & Approval Gates',
    'roadmap.phase3.desc': 'PathGuard و TerminalSanity و مصادقة Token و Approvals',
    'roadmap.phase4': 'Multi-Provider Support',
    'roadmap.phase4.desc': 'دعم ChatGPT و Claude و Gemini و DeepSeek والمزيد',
    'roadmap.phase5': 'Side Panel Control Center',
    'roadmap.phase5.desc': 'لوحة تحكم احترافية لإدارة الجسر والملفات والسياق',
    'roadmap.phase6': 'Workspace Testing & Polish',
    'roadmap.phase6.desc': 'اختبارات شاملة وتحسينات ونشر متجر الإضافة',
    'roadmap.current': 'مكتمل',
    
    'faq.title': 'أسئلة شائعة',
    'faq.subtitle': 'إجابات على أكثر الأسئلة شيوعًا',
    'faq.q1': 'هل يحتاج المشروع إلى خادم سحابي؟',
    'faq.a1': 'لا! ULAB يعمل بالكامل محليًا. الإضافة تتواصل مع الوكيل المحلي عبر WebSocket على localhost فقط. لا أي خادم سحابي.',
    'faq.q2': 'هل ملفاتي آمنة؟',
    'faq.a2': 'نعم! الوكيل محلي فقط (127.0.0.1) ومصادق بـ Token. PathGuard يمنع تسرب المسارات والملفات الحساسة. التعديلات تتطلب موافقتك.',
    'faq.q3': 'ما المتصفحات المدعومة؟',
    'faq.a3': 'Chrome 116+ و Edge 116+ (Manifest V3). يعمل مع أي صفحة AI عبر HTTP/HTTPS.',
    'faq.q4': 'هل يمكن استخدام المشروع مع أي AI؟',
    'faq.a4': 'نعم! يدعم ChatGPT و Claude و Gemini و DeepSeek و Qwen و Mistral و Grok والمزيد — أي محادثة AI عبر الويب.',
    'faq.q5': 'هل المشروع مجاني؟',
    'faq.a5': 'نعم، مفتوح المصدر تحت رخصة MIT. الإضافة والوكيل مجانيان.',
    'faq.q6': 'كيف يتعامل مع المشاريع الضخمة؟',
    'faq.a6': 'ULAB لا يرسل المشروع كاملًا. AI يطلب ملفات محددة عبر tool calls — والوكيل ينفّذ محليًا فقط الملفات المطلوبة.',
    
    'cta.title': 'جاهز لربط AI بمشروعك؟',
    'cta.subtitle': 'ثبّت الإضافة، شغّل الوكيل، وفعّل الجسر — AI يقرأ مشروعك تلقائيًا.',
    'cta.button': 'إطلاق الأداة',
    'cta.download': 'تحميل الإضافة',
    
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
    'features.universal.desc': 'Universal AI Bridge works with ChatGPT, Gemini, Claude, DeepSeek',
    'features.git.title': 'Full Git Integration',
    'features.git.desc': 'Monitor changes, manage branches, and review diffs',
    'features.terminal.title': 'Command Execution',
    'features.terminal.desc': 'Run terminal commands and tests through AI',
    
    'stats.local': 'Local First',
    'stats.providers': 'AI Providers',
    'stats.projects': 'Project Size',
    'stats.servers': 'Cloud Servers',
    
    'howItWorks.title': 'How It Works',
    'howItWorks.subtitle': 'Four simple steps to connect AI to your project',
    'howItWorks.step1.title': 'Install the Browser Extension',
    'howItWorks.step1.desc': 'Add ULAB to Chrome or Edge — lightweight and fast',
    'howItWorks.step2.title': 'Start the Local Agent',
    'howItWorks.step2.desc': 'Run the agent on your device — it prints a security token',
    'howItWorks.step3.title': 'Select Your Workspace',
    'howItWorks.step3.desc': 'Point ULAB to your project folder — everything stays local',
    'howItWorks.step4.title': 'Activate Bridge on Any AI',
    'howItWorks.step4.desc': 'Open ChatGPT, Claude, or Gemini and click Activate — tool calls execute automatically',
    'howItWorks.step5.title': 'Tool Calls Execute Automatically',
    'howItWorks.step5.desc': 'AI requests file reads or searches — ULAB executes and returns results',
    'howItWorks.step6.title': 'Changes Require Your Approval',
    'howItWorks.step6.desc': 'Write, delete, and terminal operations need your explicit approval',
    
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
    'architecture.localNote': 'Your files stay on your device',
    'architecture.cloudNote': 'Your files travel through multiple servers',
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
    'roadmap.subtitle': 'Development trajectory and milestones',
    'roadmap.phase1': 'Browser Extension + Agent',
    'roadmap.phase1.desc': 'Browser extension and local agent with WebSocket and secure protocol',
    'roadmap.phase2': 'Automatic Bridge Loop',
    'roadmap.phase2.desc': 'Automatic tool call detection, execution, and result injection',
    'roadmap.phase3': 'Security & Approval Gates',
    'roadmap.phase3.desc': 'PathGuard, terminal sandbox, token auth, and approval gates',
    'roadmap.phase4': 'Multi-Provider Support',
    'roadmap.phase4.desc': 'ChatGPT, Claude, Gemini, DeepSeek, and more',
    'roadmap.phase5': 'Side Panel Control Center',
    'roadmap.phase5.desc': 'Professional dashboard for bridge, files, and context management',
    'roadmap.phase6': 'Workspace Testing & Polish',
    'roadmap.phase6.desc': 'Comprehensive tests, polish, and extension store submission',
    'roadmap.current': 'Complete',
    
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Answers to the most common questions',
    'faq.q1': 'Does the project need a cloud server?',
    'faq.a1': 'No! ULAB runs entirely locally. The extension communicates with the local agent via WebSocket on localhost only. No cloud server involved.',
    'faq.q2': 'Are my files safe?',
    'faq.a2': 'Yes! The agent is localhost-only (127.0.0.1) and token-authenticated. PathGuard blocks path traversal and sensitive files. Modifications require your explicit approval.',
    'faq.q3': 'What browsers are supported?',
    'faq.a3': 'Chrome 116+ and Edge 116+ (Manifest V3). Works with any AI chat page over HTTP/HTTPS.',
    'faq.q4': 'Can the project be used with any AI?',
    'faq.a4': 'Yes! Supports ChatGPT, Claude, Gemini, DeepSeek, Qwen, Mistral, Grok, and more — any web-based AI chat.',
    'faq.q5': 'Is the project free?',
    'faq.a5': 'Yes, open source under MIT license. Both the extension and agent are free.',
    'faq.q6': 'How does it handle huge projects?',
    'faq.a6': 'ULAB doesn\'t send the whole project. AI requests specific files via tool calls — the agent only executes locally for the files requested.',
    
    'cta.title': 'Ready to Connect AI to Your Project?',
    'cta.subtitle': 'Install the extension, start the agent, and activate the bridge — AI reads your project automatically.',
    'cta.button': 'Launch Tool',
    'cta.download': 'Get the Extension',
    
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
    'features.universal.desc': 'El Universal AI Bridge funciona con ChatGPT, Gemini, Claude, DeepSeek',
    'features.git.title': 'Integración Completa con Git',
    'features.git.desc': 'Monitorea cambios, gestiona ramas y revisa diferencias',
    'features.terminal.title': 'Ejecución de Comandos',
    'features.terminal.desc': 'Ejecuta comandos de terminal y pruebas a través de IA',
    
    'stats.local': 'Local Primero',
    'stats.providers': 'Proveedores de IA',
    'stats.projects': 'Tamaño del Proyecto',
    'stats.servers': 'Servidores en la Nube',
    
    'howItWorks.title': '¿Cómo Funciona?',
    'howItWorks.subtitle': 'Cuatro pasos simples para conectar IA a tu proyecto',
    'howItWorks.step1.title': 'Instala la Extensión del Navegador',
    'howItWorks.step1.desc': 'Añade ULAB a Chrome o Edge — ligero y rápido',
    'howItWorks.step2.title': 'Inicia el Agente Local',
    'howItWorks.step2.desc': 'Ejecuta el agente en tu dispositivo — imprime un token de seguridad',
    'howItWorks.step3.title': 'Selecciona tu Espacio de Trabajo',
    'howItWorks.step3.desc': 'Apunta ULAB a tu carpeta de proyecto — todo permanece local',
    'howItWorks.step4.title': 'Activa el Puente en Cualquier IA',
    'howItWorks.step4.desc': 'Abre ChatGPT, Claude o Gemini y haz clic en Activate — las herramientas se ejecutan automáticamente',
    'howItWorks.step5.title': 'Las Herramientas se Ejecutan Automáticamente',
    'howItWorks.step5.desc': 'La IA solicita lecturas o búsquedas — ULAB ejecuta y devuelve resultados',
    'howItWorks.step6.title': 'Los Cambios Requieren Tu Aprobación',
    'howItWorks.step6.desc': 'Las operaciones de escritura, eliminación y terminal necesitan tu aprobación explícita',
    
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
    'architecture.localNote': 'Tus archivos permanecen en tu dispositivo',
    'architecture.cloudNote': 'Tus archivos viajan por múltiples servidores',
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
    'roadmap.subtitle': 'Trayectoria de desarrollo y hitos',
    'roadmap.phase1': 'Extensión del Navegador + Agente',
    'roadmap.phase1.desc': 'Extensión del navegador y agente local con WebSocket y protocolo seguro',
    'roadmap.phase2': 'Bucle Automático del Puente',
    'roadmap.phase2.desc': 'Detección automática de llamadas a herramientas, ejecución e inyección de resultados',
    'roadmap.phase3': 'Seguridad y Puertas de Aprobación',
    'roadmap.phase3.desc': 'PathGuard, sandbox de terminal, autenticación de token y puertas de aprobación',
    'roadmap.phase4': 'Soporte Multi-Proveedor',
    'roadmap.phase4.desc': 'ChatGPT, Claude, Gemini, DeepSeek y más',
    'roadmap.phase5': 'Panel de Control del Puente',
    'roadmap.phase5.desc': 'Panel profesional para gestión del puente, archivos y contexto',
    'roadmap.phase6': 'Pruebas y Pulido del Espacio de Trabajo',
    'roadmap.phase6.desc': 'Pruebas completas, pulido y envío a tienda de extensiones',
    'roadmap.current': 'Completado',
    
    'faq.title': 'Preguntas Frecuentes',
    'faq.subtitle': 'Respuestas a las preguntas más comunes',
    'faq.q1': '¿El proyecto necesita un servidor en la nube?',
    'faq.a1': '¡No! ULAB se ejecuta completamente localmente. La extensión se comunica con el agente local a través de WebSocket en localhost solamente. Sin servidor en la nube.',
    'faq.q2': '¿Mis archivos están seguros?',
    'faq.a2': '¡Sí! El agente es solo localhost (127.0.0.1) y autenticado por token. PathGuard bloquea traversión de rutas y archivos sensibles. Las modificaciones requieren tu aprobación explícita.',
    'faq.q3': '¿Qué navegadores son compatibles?',
    'faq.a3': 'Chrome 116+ y Edge 116+ (Manifest V3). Funciona con cualquier página de chat IA vía HTTP/HTTPS.',
    'faq.q4': '¿Se puede usar el proyecto con cualquier IA?',
    'faq.a4': '¡Sí! Soporta ChatGPT, Claude, Gemini, DeepSeek, Qwen, Mistral, Grok y más — cualquier chat IA web.',
    'faq.q5': '¿El proyecto es gratuito?',
    'faq.a5': 'Sí, código abierto bajo licencia MIT. Tanto la extensión como el agente son gratuitos.',
    'faq.q6': '¿Cómo maneja proyectos enormes?',
    'faq.a6': 'ULAB no envía todo el proyecto. La IA solicita archivos específicos vía tool calls — el agente ejecuta localmente solo los archivos solicitados.',
    
    'cta.title': '¿Listo para Conectar IA a Tu Proyecto?',
    'cta.subtitle': 'Instala la extensión, inicia el agente y activa el puente — la IA lee tu proyecto automáticamente.',
    'cta.button': 'Iniciar Herramienta',
    'cta.download': 'Obtener la Extensión',
    
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
    'features.universal.desc': 'Le Universal AI Bridge fonctionne avec ChatGPT, Gemini, Claude, DeepSeek',
    'features.git.title': 'Intégration Git complète',
    'features.git.desc': 'Surveillez les modifications, gérez les branches et examinez les différences',
    'features.terminal.title': 'Exécution de commandes',
    'features.terminal.desc': 'Exécutez des commandes de terminal et des tests via l\'IA',
    
    'stats.local': 'Local d\'abord',
    'stats.providers': 'Fournisseurs d\'IA',
    'stats.projects': 'Taille du projet',
    'stats.servers': 'Serveurs cloud',
    
    'howItWorks.title': 'Comment ça marche?',
    'howItWorks.subtitle': 'Quatre étapes simples pour connecter l\'IA à votre projet',
    'howItWorks.step1.title': 'Installez l\'Extension du Navigateur',
    'howItWorks.step1.desc': 'Ajoutez ULAB à Chrome ou Edge — léger et rapide',
    'howItWorks.step2.title': 'Démarrez l\'Agent Local',
    'howItWorks.step2.desc': 'Lancez l\'agent sur votre appareil — il imprime un jeton de sécurité',
    'howItWorks.step3.title': 'Sélectionnez Votre Espace de Travail',
    'howItWorks.step3.desc': 'Pointez ULAB vers votre dossier de projet — tout reste local',
    'howItWorks.step4.title': 'Activez le Pont sur N\'importe quelle IA',
    'howItWorks.step4.desc': 'Ouvrez ChatGPT, Claude ou Gemini et cliquez sur Activate — les outils s\'exécutent automatiquement',
    'howItWorks.step5.title': 'Les Outils s\'Exécutent Automatiquement',
    'howItWorks.step5.desc': 'L\'IA demande des lectures ou recherches — ULAB exécute et retourne les résultats',
    'howItWorks.step6.title': 'Les Modifications Nécessitent Votre Approbation',
    'howItWorks.step6.desc': 'Les opérations d\'écriture, suppression et terminal nécessitent votre approbation explicite',
    
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
    'architecture.localNote': 'Vos fichiers restent sur votre appareil',
    'architecture.cloudNote': 'Vos fichiers transitent par plusieurs serveurs',
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
    'roadmap.subtitle': 'Trajectoire de développement et jalons',
    'roadmap.phase1': 'Extension de Navigateur + Agent',
    'roadmap.phase1.desc': 'Extension de navigateur et agent local avec WebSocket et protocole sécurisé',
    'roadmap.phase2': 'Boucle Automatique du Pont',
    'roadmap.phase2.desc': 'Détection automatique des appels d\'outils, exécution et injection de résultats',
    'roadmap.phase3': 'Sécurité et Portes d\'Approbation',
    'roadmap.phase3.desc': 'PathGuard, sandbox terminal, authentification par jeton et portes d\'approbation',
    'roadmap.phase4': 'Support Multi-Fournisseurs',
    'roadmap.phase4.desc': 'ChatGPT, Claude, Gemini, DeepSeek et plus',
    'roadmap.phase5': 'Panneau de Contrôle du Pont',
    'roadmap.phase5.desc': 'Tableau de bord professionnel pour la gestion du pont, des fichiers et du contexte',
    'roadmap.phase6': 'Tests et Perfectionnement de l\'Espace de Travail',
    'roadmap.phase6.desc': 'Tests complets, perfectionnement et soumission à la boutique d\'extensions',
    'roadmap.current': 'Terminé',
    
    'faq.title': 'Questions fréquemment posées',
    'faq.subtitle': 'Réponses aux questions les plus courantes',
    'faq.q1': 'Le projet a-t-il besoin d\'un serveur cloud?',
    'faq.a1': 'Non! ULAB s\'exécute entièrement localement. L\'extension communique avec l\'agent local via WebSocket sur localhost uniquement. Pas de serveur cloud.',
    'faq.q2': 'Mes fichiers sont-ils sécurisés?',
    'faq.a2': 'Oui! L\'agent est localhost uniquement (127.0.0.1) et authentifié par jeton. PathGuard bloque la traversée de chemins et les fichiers sensibles. Les modifications nécessitent votre approbation explicite.',
    'faq.q3': 'Quels navigateurs sont supportés?',
    'faq.a3': 'Chrome 116+ et Edge 116+ (Manifest V3). Fonctionne avec toute page de chat IA en HTTP/HTTPS.',
    'faq.q4': 'Le projet peut-il être utilisé avec n\'importe quelle IA?',
    'faq.a4': 'Oui! Supporte ChatGPT, Claude, Gemini, DeepSeek, Qwen, Mistral, Grok et plus — tout chat IA web.',
    'faq.q5': 'Le projet est-il gratuit?',
    'faq.a5': 'Oui, open source sous licence MIT. L\'extension et l\'agent sont gratuits.',
    'faq.q6': 'Comment gère-t-il les projets énormes?',
    'faq.a6': 'ULAB n\'envoie pas tout le projet. L\'IA demande des fichiers spécifiques via des appels d\'outils — l\'agent exécute localement uniquement les fichiers demandés.',
    
    'cta.title': 'Prêt à connecter l\'IA à votre projet?',
    'cta.subtitle': 'Installez l\'extension, démarrez l\'agent et activez le pont — l\'IA lit votre projet automatiquement.',
    'cta.button': 'Lancer l\'outil',
    'cta.download': 'Obtenir l\'Extension',
    
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
    
    'howItWorks.title': '작동 방식',
    'howItWorks.subtitle': 'AI를 프로젝트에 연결하는 4가지 간단한 단계',
    'howItWorks.step1.title': '브라우저 확장 프로그램 설치',
    'howItWorks.step1.desc': 'Chrome 또는 Edge에 ULAB 추가 — 가볍고 빠름',
    'howItWorks.step2.title': '로컬 에이전트 시작',
    'howItWorks.step2.desc': '장치에서 에이전트를 실행 — 보안 토큰을 출력합니다',
    'howItWorks.step3.title': '작업 공간 선택',
    'howItWorks.step3.desc': 'ULAB을 프로젝트 폴더로 지정 — 모든 것이 로컬에 유지됩니다',
    'howItWorks.step4.title': '모든 AI에서 브릿지 활성화',
    'howItWorks.step4.desc': 'ChatGPT, Claude 또는 Gemini를 열고 Activate를 클릭 — 도구가 자동으로 실행됩니다',
    'howItWorks.step5.title': '도구가 자동으로 실행됩니다',
    'howItWorks.step5.desc': 'AI가 파일 읽기 또는 검색을 요청 — ULAB이 실행하고 결과를 반환합니다',
    'howItWorks.step6.title': '변경 사항에 대한 승인 필요',
    'howItWorks.step6.desc': '쓰기, 삭제 및 터미널 작업에는 명시적 승인이 필요합니다',
    
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
    'architecture.localNote': '파일이 기기를 떠나지 않습니다',
    'architecture.cloudNote': '파일이 여러 서버를 거칩니다',
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
    'roadmap.subtitle': '개발 궤적과 마일스톤',
    'roadmap.phase1': '브라우저 확장 + 에이전트',
    'roadmap.phase1.desc': '브라우저 확장 프로그램과 WebSocket 및 보안 프로토콜이 있는 로컬 에이전트',
    'roadmap.phase2': '자동 브릿지 루프',
    'roadmap.phase2.desc': '도구 호출 자동 감지, 실행 및 결과 주입',
    'roadmap.phase3': '보안 및 승인 게이트',
    'roadmap.phase3.desc': 'PathGuard, 터미널 샌드박스, 토큰 인증 및 승인 게이트',
    'roadmap.phase4': '멀티 프로바이더 지원',
    'roadmap.phase4.desc': 'ChatGPT, Claude, Gemini, DeepSeek 등',
    'roadmap.phase5': '사이드 패널 제어 센터',
    'roadmap.phase5.desc': '브릿지, 파일 및 컨텍스트 관리를 위한 전문 대시보드',
    'roadmap.phase6': '워크스페이스 테스트 및 다듬기',
    'roadmap.phase6.desc': '포괄적인 테스트, 다듬기 및 확장 스토어 제출',
    'roadmap.current': '완료',
    
    'faq.title': '자주 묻는 질문',
    'faq.subtitle': '가장 일반적인 질문에 대한 답변',
    'faq.q1': '프로젝트에 클라우드 서버가 필요한가요?',
    'faq.a1': '아니요! ULAB은 완전히 로컬에서 실행됩니다. 확장 프로그램은 localhost에서 WebSocket을 통해 로컬 에이전트와만 통신합니다. 클라우드 서버가 없습니다.',
    'faq.q2': '내 파일이 안전한가요?',
    'faq.a2': '네! 에이전트는 localhost(127.0.0.1) 전용이며 토큰으로 인증됩니다. PathGuard가 경로 변환과 민감한 파일을 차단합니다. 수정 사항에는 명시적 승인이 필요합니다.',
    'faq.q3': '어떤 브라우저가 지원되나요?',
    'faq.a3': 'Chrome 116+와 Edge 116+(Manifest V3). HTTP/HTTPS를 통한 모든 AI 채팅 페이지에서 작동합니다.',
    'faq.q4': '프로젝트를 어떤 AI와 함께 사용할 수 있나요?',
    'faq.a4': '네! ChatGPT, Claude, Gemini, DeepSeek, Qwen, Mistral, Grok 등을 지원합니다 — 모든 웹 기반 AI 채팅.',
    'faq.q5': '프로젝트가 무료인가요?',
    'faq.a5': '네, MIT 라이선스 하의 오픈 소스입니다. 확장 프로그램과 에이전트 모두 무료입니다.',
    'faq.q6': '거대한 프로젝트를 어떻게 처리하나요?',
    'faq.a6': 'ULAB은 전체 프로젝트를 보내지 않습니다. AI가 도구 호출을 통해 특정 파일을 요청하면 에이전트는 요청된 파일만 로컬에서 실행합니다.',
    
    'cta.title': 'AI를 프로젝트에 연결할 준비가 되셨나요?',
    'cta.subtitle': '확장 프로그램을 설치하고, 에이전트를 시작하고, 브릿지를 활성화하세요 — AI가 프로젝트를 자동으로 읽습니다.',
    'cta.button': '도구 실행',
    'cta.download': '확장 프로그램 받기',
    
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
    
    'howItWorks.title': '工作原理',
    'howItWorks.subtitle': '四个简单步骤将AI连接到您的项目',
    'howItWorks.step1.title': '安装浏览器扩展',
    'howItWorks.step1.desc': '将ULAB添加到Chrome或Edge — 轻量快速',
    'howItWorks.step2.title': '启动本地代理',
    'howItWorks.step2.desc': '在设备上运行代理 — 它会打印安全令牌',
    'howItWorks.step3.title': '选择工作空间',
    'howItWorks.step3.desc': '将ULAB指向项目文件夹 — 一切保持在本地',
    'howItWorks.step4.title': '在任何AI上激活桥接',
    'howItWorks.step4.desc': '打开ChatGPT、Claude或Gemini并点击Activate — 工具调用自动执行',
    'howItWorks.step5.title': '工具调用自动执行',
    'howItWorks.step5.desc': 'AI请求文件读取或搜索 — ULAB执行并返回结果',
    'howItWorks.step6.title': '更改需要您的批准',
    'howItWorks.step6.desc': '写入、删除和终端操作需要您的明确批准',
    
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
    'architecture.localNote': '文件永不离开您的设备',
    'architecture.cloudNote': '文件经过多个服务器',
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
    'roadmap.subtitle': '开发轨迹和里程碑',
    'roadmap.phase1': '浏览器扩展 + 代理',
    'roadmap.phase1.desc': '浏览器扩展和具有WebSocket及安全协议的本地代理',
    'roadmap.phase2': '自动桥接循环',
    'roadmap.phase2.desc': '工具调用自动检测、执行和结果注入',
    'roadmap.phase3': '安全和审批门',
    'roadmap.phase3.desc': 'PathGuard、终端沙箱、令牌认证和审批门',
    'roadmap.phase4': '多提供商支持',
    'roadmap.phase4.desc': 'ChatGPT、Claude、Gemini、DeepSeek等',
    'roadmap.phase5': '侧边栏控制中心',
    'roadmap.phase5.desc': '用于桥接、文件和上下文管理的专业仪表板',
    'roadmap.phase6': '工作空间测试和完善',
    'roadmap.phase6.desc': '全面测试、完善和扩展商店提交',
    'roadmap.current': '已完成',
    
    'faq.title': '常见问题',
    'faq.subtitle': '最常见问题的答案',
    'faq.q1': '项目需要云服务器吗？',
    'faq.a1': '不需要！ULAB完全在本地运行。扩展程序仅通过WebSocket在localhost上与本地代理通信。没有云服务器。',
    'faq.q2': '我的文件安全吗？',
    'faq.a2': '是的！代理仅限于localhost（127.0.0.1）并使用令牌认证。PathGuard阻止路径遍历和敏感文件。修改需要您的明确批准。',
    'faq.q3': '支持哪些浏览器？',
    'faq.a3': 'Chrome 116+和Edge 116+（Manifest V3）。适用于任何通过HTTP/HTTPS的AI聊天页面。',
    'faq.q4': '项目可以与任何AI一起使用吗？',
    'faq.a4': '是的！支持ChatGPT、Claude、Gemini、DeepSeek、Qwen、Mistral、Grok等 — 任何基于网络的AI聊天。',
    'faq.q5': '项目免费吗？',
    'faq.a5': '是的，MIT许可下的开源项目。扩展和代理都是免费的。',
    'faq.q6': '它如何处理巨大的项目？',
    'faq.a6': 'ULAB不发送整个项目。AI通过工具调用请求特定文件 — 代理仅在本地执行请求的文件。',
    
    'cta.title': '准备好将AI连接到您的项目了吗？',
    'cta.subtitle': '安装扩展、启动代理并激活桥接 — AI自动读取您的项目。',
    'cta.button': '启动工具',
    'cta.download': '获取扩展',
    
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
