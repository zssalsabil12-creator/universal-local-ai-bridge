import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, FolderTree, Brain, Shield, Globe, ArrowLeft, ArrowRight, Rocket } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFolder: () => void;
  onStartDemo: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onOpenFolder, onStartDemo }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'مرحبًا بك في ULAB',
      description: 'الجسر المحلي الموحد للذكاء الاصطناعي',
      content: (
        <div className="text-center space-y-4">
          <p className="text-sm text-[#94a3b8] leading-relaxed">
            حوّل أي Chatbot إلى وكيل محلي لجهازك
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Globe className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <p className="font-bold">عدة مزودين</p>
              <p className="text-[10px] text-[#94a3b8]">ChatGPT, Gemini, Claude وغيرهم</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="font-bold">تحكم محلي</p>
              <p className="text-[10px] text-[#94a3b8]">الملفات تبقى في مساحة العمل</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Brain className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="font-bold">ذاكرة ذكية</p>
              <p className="text-[10px] text-[#94a3b8]">يتعلم من مشروعك</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <FolderTree className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="font-bold">مشاريع ضخمة</p>
              <p className="text-[10px] text-[#94a3b8]">آلاف الملفات</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <FolderTree className="w-12 h-12" />,
      title: 'كيف يعمل؟',
      description: 'ثلاث خطوات بسيطة',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-indigo-400">1</span>
            </div>
            <div>
              <p className="text-sm font-bold">افتح مجلد مشروعك</p>
              <p className="text-xs text-[#94a3b8]">حدد المجلد مرة واحدة - ULAB سيفهرسه محليًا</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-cyan-400">2</span>
            </div>
            <div>
              <p className="text-sm font-bold">اسأل أي Chatbot</p>
              <p className="text-xs text-[#94a3b8]">اكتب سؤالك - ULAB سيستخرج السياق المناسب</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-green-400">3</span>
            </div>
            <div>
              <p className="text-sm font-bold">انسخ والصق</p>
              <p className="text-xs text-[#94a3b8]">ULAB يولد prompt مثالي - الصقه في ChatGPT/Gemini/Claude</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Rocket className="w-12 h-12" />,
      title: 'جاهز للبدء؟',
      description: 'اختر طريقة البدء',
      content: (
        <div className="space-y-3">
          <button
            onClick={() => {
              onOpenFolder();
              onClose();
            }}
            className="w-full p-4 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <FolderTree className="w-5 h-5" />
              <div className="text-right">
                <p className="text-sm font-bold">فتح مجلد مشروع حقيقي</p>
                <p className="text-xs opacity-80">ابدأ العمل على مشروعك الفعلي</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => {
              onStartDemo();
              onClose();
            }}
            className="w-full p-4 rounded-lg bg-[#252530] border border-[#2a2a3a] text-white font-medium hover:border-indigo-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <div className="text-right">
                <p className="text-sm font-bold">تجربة سريعة (Demo)</p>
                <p className="text-xs text-[#94a3b8]">جرب المميزات على مشروع وهمي</p>
              </div>
            </div>
          </button>
          <p className="text-center text-[10px] text-[#64748b] mt-4">
            💡 يمكنك دائمًا التبديل بين الوضعين
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#111118] border border-[#2a2a3a] rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{steps[currentStep].title}</h3>
                  <p className="text-xs text-[#94a3b8]">{steps[currentStep].description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#252530] transition-colors text-[#94a3b8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {steps[currentStep].content}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2a2a3a] flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-[#94a3b8] hover:bg-[#252530] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                السابق
              </button>
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentStep ? 'bg-indigo-500' : 'bg-[#2a2a3a]'
                    }`}
                  />
                ))}
              </div>
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  التالي
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#252530] text-[#94a3b8] text-xs hover:bg-[#2a2a3a] transition-colors"
                >
                  إغلاق
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
