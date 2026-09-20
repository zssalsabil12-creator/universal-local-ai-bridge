import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, X, Lock, CheckCircle2, Globe } from 'lucide-react';

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
                <p className="text-xs text-[#94a3b8]">شفافية واضحة حول البيانات، الجلسات الخارجية، ومساحة العمل المحلية</p>
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
                    <strong>مبدأ الخصوصية: ULAB محلي أولًا</strong>
                    <p className="mt-1">
                      لا يعتمد ULAB على خادم سحابي لمعالجة مشروعك. مساحة العمل، الفهرسة، السجل، والصلاحيات تُدار محليًا عبر التطبيق وLocal Agent. عندما تطلب من AI خارجي تنفيذ مهمة، يُرسل فقط السياق الذي تختاره إلى مزود AI الذي فتحته.
                    </p>
                  </div>
                </div>

                <h4 className="text-white font-bold text-base mt-4">1. جمع البيانات</h4>
                <p>
                  تطبيق ULAB Desktop لا يتطلب حساب ULAB. لا يملك ULAB خدمة سحابية لتخزين مشاريعك أو شفراتك المصدرية، ولا يطلب منك إدخال API key خاص بـULAB. بيانات مساحة العمل وصلاحياتها وسجل العمليات تبقى على جهازك ضمن مكونات التطبيق المحلية.
                </p>

                <h4 className="text-white font-bold text-base">2. الشبكة والإعلانات</h4>
                <p>
                  تطبيق سطح المكتب لا يحتاج إلى حساب أو خدمة ULAB سحابية لتشغيل مساحة العمل المحلية. أما الموقع العام الذي يوزع التطبيق فقد يستخدم إعلانات أو خدمات قياس تابعة لجهات خارجية عند تفعيلها. تنطبق سياسات تلك الجهات على ملفات الارتباط والبيانات التي تجمعها.
                </p>

                <h4 className="text-white font-bold text-base">3. جلسات الذكاء الاصطناعي</h4>
                <p>
                  عند ربط ChatGPT أو Claude أو Gemini أو غيرها داخل ULAB، تعمل الجلسة داخل نافذة AI مدمجة. لا يقرر ULAB سياسة الاحتفاظ ببيانات مزود AI؛ أي محتوى تختار إرساله يخضع لسياسة وشروط ذلك المزود. ULAB لا يعتبر حسابك لدى مزود AI جزءًا من حساب ULAB.
                </p>
                <p>
                  الاتصال المحلي بين واجهة ULAB وLocal Agent محدود بمساحة العمل النشطة، وطلبات التغيير الحساسة تمر عبر موافقة بشرية صريحة.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <h4 className="text-white font-bold text-base">1. قبول الشروط</h4>
                <p>
                  باستخدامك ULAB Desktop أو موقع ULAB، فإنك توافق على شروط الاستخدام المعروضة هنا. إذا كنت لا توافق، فلا تستخدم البرنامج أو خدمات الموقع.
                </p>

                <h4 className="text-white font-bold text-base">2. طبيعة الخدمة والمسؤولية</h4>
                <p>
                  ULAB يوفّر واجهة محلية لربط جلسة AI بمساحة عمل محددة، مع أدوات قراءة وبحث واقتراح وتغييرات تتطلب موافقة. يجب عليك مراجعة نتائج AI والتغييرات قبل التطبيق والاحتفاظ بنسخ احتياطية مناسبة لمشروعك. توافق مزودات AI الخارجية وشروطها منفصلة عن ULAB.
                </p>

                <h4 className="text-white font-bold text-base">3. الملكية الفكرية</h4>
                <p>
                  تبقى مشاريعك وملفاتك ومحتواك ملكًا لك، وفق الحقوق التي تملكها أصلًا. ULAB لا يمنح نفسه ملكية على مشروعك لمجرد استخدامه داخل مساحة العمل.
                </p>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <h4 className="text-white font-bold text-base">ما هو ULAB؟</h4>
                <p>
                  ULAB (Universal Local AI Bridge) هو تطبيق Windows يربط جلسات AI التي تستخدمها أصلًا بمساحة عمل محلية محددة، مع Local Agent، سياق محلي، تشخيص لجلسة AI، وطبقة موافقة قبل العمليات الحساسة.
                </p>
                <p>
                  لا يتطلب التطبيق اشتراك ULAB أو مفتاح API خاصًا به. حساب AI الذي تستخدمه يبقى لدى مزوده، بينما يبقى التحكم في مساحة العمل والصلاحيات داخل ULAB.
                </p>

                <h4 className="text-white font-bold text-base">الموقع العام والإعلانات</h4>
                <p>
                  موقع ULAB مخصص للتعريف بالمنتج وتوزيع التطبيق. يمكن دعم الموقع بإعلانات أو شراكات عند تفعيلها، مع الالتزام بالسياسات والشروط المطلوبة من مزودي الإعلانات.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a3a] bg-[#161622]">
            <span className="text-xs text-[#64748b]">آخر تحديث: سبتمبر 2026</span>
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
