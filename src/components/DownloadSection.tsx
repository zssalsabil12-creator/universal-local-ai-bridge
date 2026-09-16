import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Chrome,
  Download,
  HardDriveDownload,
  Lock,
  Monitor,
  PackageCheck,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const INSTALLER_URL = '/downloads/ULAB-Setup.exe';
const ZIP_URL = '/downloads/ULAB-Windows.zip';
const VERSION = '1.0.0';
const INSTALLER_SIZE = '~52 MB';

export default function DownloadSection() {
  const { t } = useLanguage();
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    setIsWindows(/Win/i.test(window.navigator.userAgent));
  }, []);

  return (
    <section id="download" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[10%] top-[20%] w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[10%] bottom-[10%] w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-200 text-xs font-bold tracking-[0.18em] uppercase mb-6">
            <Sparkles className="w-4 h-4" />
            Get started
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5">
            <span className="gradient-text">{t('nav.download')}</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#94a3b8] max-w-3xl mx-auto leading-relaxed">
            Install the local bridge once, then connect ULAB to your projects and browser-based AI tools.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2rem] border border-cyan-400/20 bg-[#0f1019]/90 backdrop-blur-xl p-7 sm:p-9 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative flex flex-col h-full">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <HardDriveDownload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl">ULAB for Windows</p>
                    <p className="text-sm text-[#64748b]">Installer • {VERSION} • {INSTALLER_SIZE}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-400/20 text-green-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  {isWindows ? 'Windows detected' : 'Windows 10 / 11'}
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-8">
                {[
                  { icon: <PackageCheck className="w-4 h-4" />, text: 'Ready-to-run installer' },
                  { icon: <Lock className="w-4 h-4" />, text: 'Local-first design' },
                  { icon: <Shield className="w-4 h-4" />, text: 'Approval-based writes' },
                ].map((item) => (
                  <div key={item.text} className="rounded-xl border border-white/5 bg-white/[0.025] p-3 text-xs text-[#cbd5e1] flex items-center gap-2">
                    <span className="text-cyan-300">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-col sm:flex-row gap-3">
                <a
                  href={INSTALLER_URL}
                  download="ULAB-Setup.exe"
                  className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-black text-lg shadow-2xl shadow-purple-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <Download className="w-5 h-5" />
                  {t('hero.download')}
                </a>
                <a
                  href={ZIP_URL}
                  download="ULAB-Windows.zip"
                  className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border border-purple-400/20 bg-white/[0.02] text-[#cbd5e1] font-bold hover:border-purple-400/40 hover:bg-purple-500/5 transition-all"
                >
                  <HardDriveDownload className="w-4 h-4" />
                  Portable ZIP
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-purple-400/15 bg-[#111118]/90 backdrop-blur-xl p-7 sm:p-8"
          >
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-purple-300 mb-5">Installation flow</p>
            <div className="space-y-5">
              {[
                { icon: <Download className="w-4 h-4" />, title: '1. Download', desc: 'Run the Windows installer from the official ULAB website.' },
                { icon: <Monitor className="w-4 h-4" />, title: '2. Install', desc: 'ULAB installs the local Agent and creates your launch shortcut.' },
                { icon: <Chrome className="w-4 h-4" />, title: '3. Connect', desc: 'Open the ULAB extension, connect the Agent, then select a workspace.' },
                { icon: <Zap className="w-4 h-4" />, title: '4. Build locally', desc: 'Use AI with local project context, approvals, terminal and Git controls.' },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/20 flex items-center justify-center text-cyan-200">
                      {step.icon}
                    </div>
                    {index < 3 && <div className="w-px flex-1 bg-gradient-to-b from-purple-400/30 to-transparent mt-2" />}
                  </div>
                  <div className="pb-2">
                    <p className="font-bold text-white">{step.title}</p>
                    <p className="text-sm text-[#94a3b8] leading-relaxed mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Windows 10 / 11', desc: 'Desktop Agent installer', icon: <Monitor className="w-5 h-5" /> },
            { title: 'Chrome / Edge', desc: 'Browser extension bridge', icon: <Chrome className="w-5 h-5" /> },
            { title: 'Privacy first', desc: 'Local workspace boundary', icon: <Shield className="w-5 h-5" /> },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/5 bg-[#0d0f17]/80 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-cyan-300">{item.icon}</div>
              <div>
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-xs text-[#64748b]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
