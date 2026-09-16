import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, X, Lock, CheckCircle2, Globe, Sparkles } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'about';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'about'>(initialTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[#111118] border border-purple-500/30 shadow-2xl shadow-purple-500/10 overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a] bg-[#161622]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">السياسات والشفافية القانونية</h3>
                <p className="text-xs text-[#94a3b8]">متوافق مع معايير Google AdSense والخصوصية العالمية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#252535] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#2a2a3a] bg-[#13131c] px-6">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'privacy'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-[#94a3b8] hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              سياسة الخصوصية (Privacy Policy)
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'terms'
                  ? 'border-purple-400 text-purple-300'
                  : 'border-transparent text-[#94a3b8] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              شروط الاستخدام (Terms of Service)
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'about'
                  ? 'border-pink-400 text-pink-300'
                  : 'border-transparent text-[#94a3b8] hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              عن المنصة ومصادر الدخل (About & Monetization)
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>مبدأ الخصوصية المطلقة (Zero Data Collection):</strong>
                    <p className="mt-1">
                      كود مشاريعك وملفاتك المحلية لا يتم إرسالها أو تخزينها على أي خادم سحابي تابع لنا. كل القراءات والفهرسة تتم داخل متصفحك (Client-Side) باستخدام File System Access API.
                    </p>
                  </div>
                </div>

                <h4 className="text-white font-bold text-base mt-4">1. جمع البيانات</h4>
                <p>
                  نحن لا نطلب إنشاء حساب إلزامي، ولا نخزن شفراتك المصدرية أو مفاتيح الـ API الخاصة بك. جميع الإعدادات وسجلات العمليات تُحفظ محلياً في متصفحك (Local Storage).
                </p>

                <h4 className="text-white font-bold text-base">2. ملفات تعريف الارتباط والإعلانات (Google AdSense)</h4>
                <p>
                  يستخدم هذا الموقع خدمات إعلانية تابعة لجهات خارجية مثل Google AdSense لتقديم إعلانات ذات صلة. قد تستخدم Google ملفات تعريف ارتباط (Cookies) لعرض الإعلانات بناءً على زياراتك السابقة لهذا الموقع أو لمواقع أخرى على الويب. يمكنك تعطيل الإعلانات المخصصة من خلال زيارة إعدادات إعلانات Google.
                </p>

                <h4 className="text-white font-bold text-base">3. التعامل مع أدوات الذكاء الاصطناعي (DeepSeek, ChatGPT, Claude)</h4>
                <p>
                  عند استخدام ميزة "نسخ السياق"، يتم وضع أجزاء الشفرة المختارة في حافظة جهازك (Clipboard) فقط. أنت من يقرر مشاركتها ولصقها في واجهة مزود الذكاء الاصطناعي الذي تثق به.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <h4 className="text-white font-bold text-base">1. قبول الشروط</h4>
                <p>
                  باستخدامك لمنصة ULAB، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام المنصة.
                </p>

                <h4 className="text-white font-bold text-base">2. طبيعة الخدمة والمسؤولية</h4>
                <p>
                  منصة ULAB توفر أدوات مساعدة برمجية وتوليد سياق محلي. المستخدم يتحمل المسؤولية الكاملة عن مراجعة وتطبيق أي تعديلات كود مقترحة من الذكاء الاصطناعي على مشاريعه البرمجية. المنصة غير مسؤولة عن أي فقدان للبيانات نتيجة تعديل ملفات دون أخذ نسخ احتياطية.
                </p>

                <h4 className="text-white font-bold text-base">3. الملكية الفكرية</h4>
                <p>
                  جميع الحقوق المتعلقة بالأكواد والمشاريع التي تعمل عليها داخل المتصفح تبقى ملكك بنسبة 100%. نحن لا ندعي أي ملكية على أي سياق أو كود يُعالج في واجهتك.
                </p>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <h4 className="text-white font-bold text-base">ما هي منصة ULAB؟</h4>
                <p>
                  ULAB (Universal Local AI Bridge) هي منصة ويب مفتوحة ومستقلة تتيح للمطورين ربط أي نموذج لغوي كبير (مثل DeepSeek, ChatGPT, Claude, Gemini, Qwen) بمشاريعهم البرمجية الضخمة دون الحاجة لدفع اشتراكات أدوات الـ IDE الباهظة ودون التخلي عن خصوصية الأكواد.
                </p>

                <h4 className="text-white font-bold text-base">نموذج الإيرادات والإعلانات</h4>
                <p>
                  للحفاظ على المنصة مجانية ومتاحة لكل المطورين حول العالم، يعتمد نموذج العمل على إعلانات Google AdSense غير المزعجة وشراكات الرعاة. هذا يسمح لنا بتطوير أدوات ذكية ومفتوحة المصدر للمجتمع البرمجي.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a3a] bg-[#161622]">
            <span className="text-xs text-[#64748b]">آخر تحديث: 2026</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              فهمت وموافق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LegalModal;
