import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, X, Lock, CheckCircle2, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'about';
}

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }: LegalModalProps) {
  const { language, dir } = useLanguage();
  const ar = language === 'ar';
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'about'>(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const text = {
    title: ar ? 'السياسات والشفافية القانونية' : 'Legal & Privacy',
    subtitle: ar ? 'معلومات واضحة حول البيانات والجلسات الخارجية ومساحة العمل المحلية' : 'Clear information about data, external AI sessions, and your local workspace',
    privacy: ar ? 'سياسة الخصوصية' : 'Privacy Policy',
    terms: ar ? 'شروط الاستخدام' : 'Terms of Service',
    about: ar ? 'عن ULAB' : 'About ULAB',
    principle: ar ? 'مبدأ الخصوصية: ULAB محلي أولًا' : 'Privacy principle: ULAB is local-first',
    principleBody: ar
      ? 'لا يعتمد ULAB على خادم سحابي لمعالجة مشروعك. مساحة العمل والفهرسة والسجل والصلاحيات تُدار محليًا عبر التطبيق وLocal Agent. عند استخدام AI خارجي، يُرسل فقط السياق الذي تختاره إلى مزود الخدمة الذي فتحته.'
      : 'ULAB does not rely on a cloud server to process your project. Workspace data, indexing, logs, and permissions are managed locally by the app and Local Agent. When you use external AI, only the context you choose is sent to the provider you opened.',
    dataTitle: ar ? '1. جمع البيانات' : '1. Data collection',
    dataBody: ar
      ? 'تطبيق ULAB Desktop لا يتطلب حساب ULAB، ولا يوفّر خدمة سحابية لتخزين مشاريعك أو شيفرتك المصدرية، ولا يطلب منك إدخال API key خاص بـULAB. تبقى بيانات مساحة العمل والصلاحيات وسجل العمليات ضمن مكونات التطبيق المحلية.'
      : 'ULAB Desktop does not require a ULAB account. ULAB does not provide a cloud service for storing your projects or source code, and it does not ask you for a ULAB API key. Workspace data, permissions, and operation logs remain within the local application components.',
    networkTitle: ar ? '2. الاتصال والشبكة' : '2. Network connectivity',
    networkBody: ar
      ? 'يعمل Local Agent على جهازك عبر localhost. عند استخدام جلسة AI خارجية داخل ULAB، فإن المحتوى الذي تختار إرساله يخضع لسياسة الخصوصية وشروط مزود AI نفسه.'
      : 'The Local Agent runs on your device through localhost. When you use an external AI session inside ULAB, content you choose to send is governed by that AI provider’s privacy policy and terms.',
    sessionTitle: ar ? '3. جلسات الذكاء الاصطناعي' : '3. AI sessions',
    sessionBody: ar
      ? 'عند ربط ChatGPT أو Claude أو Gemini أو غيرها داخل ULAB، تعمل الجلسة داخل نافذة AI مدمجة. لا يقرر ULAB سياسة الاحتفاظ ببيانات مزود AI؛ أي محتوى تختار إرساله يخضع لسياسة وشروط ذلك المزود. حسابك لدى مزود AI مستقل عن ULAB.'
      : 'When you connect ChatGPT, Claude, Gemini, or another supported service inside ULAB, the session runs in an embedded AI window. ULAB does not control that provider’s data-retention policy; content you choose to send is subject to the provider’s terms and policies. Your AI provider account is separate from ULAB.',
    localBody: ar
      ? 'الاتصال المحلي بين ULAB وLocal Agent محدود بمساحة العمل النشطة، والعمليات الحساسة تتطلب موافقة بشرية صريحة.'
      : 'Local communication between ULAB and the Local Agent is scoped to the active workspace, and sensitive operations require explicit human approval.',
    accept: ar ? 'إغلاق' : 'Close',
    updated: ar ? 'آخر تحديث: سبتمبر 2026' : 'Last updated: September 2026',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[#111118] border border-purple-500/30 shadow-2xl overflow-hidden"
          dir={dir}
          role="dialog"
          aria-modal="true"
          aria-label={text.title}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a] bg-[#161622]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{text.title}</h3>
                <p className="text-xs text-[#94a3b8]">{text.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#252535] transition-colors" aria-label={text.accept}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap border-b border-[#2a2a3a] bg-[#13131c] px-4 sm:px-6">
            {([
              ['privacy', Lock, text.privacy],
              ['terms', FileText, text.terms],
              ['about', Globe, text.about],
            ] as const).map(([tab, Icon, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${activeTab === tab ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-[#94a3b8] hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div><strong>{text.principle}</strong><p className="mt-1">{text.principleBody}</p></div>
                </div>
                <h4 className="text-white font-bold text-base mt-4">{text.dataTitle}</h4>
                <p>{text.dataBody}</p>
                <h4 className="text-white font-bold text-base">{text.networkTitle}</h4>
                <p>{text.networkBody}</p>
                <h4 className="text-white font-bold text-base">{text.sessionTitle}</h4>
                <p>{text.sessionBody}</p>
                <p>{text.localBody}</p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <h4 className="text-white font-bold text-base">{ar ? '1. قبول الشروط' : '1. Acceptance'}</h4>
                <p>{ar ? 'باستخدام ULAB Desktop، فإنك توافق على هذه الشروط. إذا كنت لا توافق عليها، فلا تستخدم البرنامج.' : 'By using ULAB Desktop, you agree to these terms. If you do not agree, do not use the software.'}</p>
                <h4 className="text-white font-bold text-base">{ar ? '2. طبيعة الخدمة والمسؤولية' : '2. Service and responsibility'}</h4>
                <p>{ar ? 'يوفّر ULAB واجهة محلية لربط جلسة AI بمساحة عمل محددة، مع أدوات للقراءة والبحث واقتراح التغييرات وموافقة المستخدم على العمليات الحساسة. يجب مراجعة نتائج AI والتغييرات قبل تطبيقها والاحتفاظ بنسخ احتياطية مناسبة. شروط مزودي AI الخارجية مستقلة عن ULAB.' : 'ULAB provides a local interface that connects an AI session to a selected workspace, with tools for reading, search, change proposals, and user approval for sensitive operations. Review AI results and changes before applying them and keep appropriate backups. External AI provider terms are separate from ULAB.'}</p>
                <h4 className="text-white font-bold text-base">{ar ? '3. الملكية الفكرية' : '3. Intellectual property'}</h4>
                <p>{ar ? 'تبقى مشاريعك وملفاتك ومحتواك ملكًا لك وفق الحقوق التي تملكها أصلًا. استخدام ULAB لا ينقل ملكية مشروعك إلى ULAB.' : 'Your projects, files, and content remain yours, subject to the rights you already hold. Using ULAB does not transfer ownership of your project to ULAB.'}</p>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <h4 className="text-white font-bold text-base">{ar ? 'ما هو ULAB؟' : 'What is ULAB?'}</h4>
                <p>{ar ? 'ULAB (Universal Local AI Bridge) هو تطبيق Windows يربط جلسات AI التي تستخدمها أصلًا بمساحة عمل محلية محددة، مع Local Agent، سياق محلي، وتشغيل آمن للعمليات الحساسة بعد موافقة المستخدم.' : 'ULAB (Universal Local AI Bridge) is a Windows application that connects the AI sessions you already use to a selected local workspace, with a Local Agent, local context, and approval controls for sensitive operations.'}</p>
                <p>{ar ? 'لا يتطلب التطبيق اشتراك ULAB أو مفتاح API خاصًا به. حساب AI الذي تستخدمه يبقى لدى مزوده، بينما يبقى التحكم في مساحة العمل والصلاحيات داخل ULAB.' : 'The application does not require a ULAB subscription or a ULAB API key. Your AI account remains with its provider, while workspace and permission control remain inside ULAB.'}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a3a] bg-[#161622]">
            <span className="text-xs text-[#64748b]">{text.updated}</span>
            <button onClick={onClose} className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold hover:shadow-lg transition-all">
              {text.accept}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
