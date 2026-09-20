import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, Code2, FolderTree, Search, GitBranch, 
  Terminal, Eye, Lock, Globe, Cpu, Layers, Download,
  ChevronDown, Menu, X, Sparkles,
  AlertTriangle,
  CheckCircle, Brain, Map, 
  RefreshCw, Users, Rocket, Plug
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CosmicBackground from '../components/CosmicBackground';
import AdContainer from '../components/AdContainer';
import DownloadSection from '../components/DownloadSection';
import LegalModal from '../components/LegalModal';

function Navbar({ onLaunch }: { onLaunch: () => void }) {
  const { t } = useLanguage();
  const downloadUrl = 'https://github.com/zssalsabil12-creator/universal-local-ai-bridge/releases/download/v3.10.5/ULAB-Setup-3.10.5-Windows-x64.exe';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '#features', label: t('nav.features') },
    { href: '#how-it-works', label: t('nav.howItWorks') },
    { href: '#advantages', label: t('nav.advantages') },
    { href: '#architecture', label: t('nav.architecture') },
    { href: '#roadmap', label: t('nav.roadmap') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-purple-500/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">ULAB</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-[#94a3b8] hover:text-white transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a href={downloadUrl} download="ULAB-Setup-3.10.5-Windows-x64.exe" className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827]/80 border border-cyan-400/25 text-cyan-200 text-sm font-bold hover:border-cyan-300/50 hover:bg-cyan-400/10 transition-all">
              <Download className="w-4 h-4" />
              {t('nav.download')}
            </a>
            <button onClick={onLaunch} className="hidden md:block px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              {t('nav.launch')}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#111118] border-b border-purple-500/20"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map(link => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-[#94a3b8] hover:text-white py-2">
                  {link.label}
                </a>
              ))}
              <a href={downloadUrl} download="ULAB-Setup-3.10.5-Windows-x64.exe" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200 text-sm font-bold">
                <Download className="w-4 h-4" />
                {t('nav.download')}
              </a>
              <button onClick={() => { onLaunch(); setMobileOpen(false); }} className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white text-sm font-bold">
                {t('nav.launch')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero({ onLaunch }: { onLaunch: () => void }) {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 mb-8 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-medium text-[#94a3b8]">{t('hero.badge')}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-tight mb-6">
            <span className="gradient-text block mb-2">{t('hero.title1')}</span>
            <span className="text-white block">{t('hero.title2')}</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#94a3b8] max-w-3xl mx-auto mb-12 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <a href="https://github.com/zssalsabil12-creator/universal-local-ai-bridge/releases/download/v3.10.5/ULAB-Setup-3.10.5-Windows-x64.exe" download="ULAB-Setup-3.10.5-Windows-x64.exe" className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/30 transition-all animate-pulse-glow">
              <span className="flex items-center gap-3">
                <Download className="w-6 h-6" />
                {t('hero.download')}
              </span>
            </a>
            <button onClick={onLaunch} className="px-10 py-4 rounded-2xl bg-[#111827]/80 border-2 border-purple-500/30 text-white font-bold text-lg hover:border-purple-400/60 transition-all">
              <span className="flex items-center gap-3">
                <Rocket className="w-6 h-6" />
                {t('hero.cta')}
              </span>
            </button>
            <a href="#how-it-works" className="px-10 py-4 rounded-2xl bg-[#111118] border-2 border-purple-500/30 text-white font-bold text-lg hover:border-purple-500/50 transition-all">
              <span className="flex items-center gap-3">
                <Eye className="w-6 h-6" />
                {t('hero.watch')}
              </span>
            </a>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="mt-20">
            <p className="text-sm text-[#94a3b8] mb-6 font-medium">{t('hero.compatible')}</p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {[
                { name: 'ChatGPT', icon: <Zap className="w-5 h-5" /> },
                { name: 'Gemini', icon: <Sparkles className="w-5 h-5" /> },
                { name: 'Claude', icon: <Brain className="w-5 h-5" /> },
                { name: 'DeepSeek', icon: <Search className="w-5 h-5" /> },
                { name: 'Qwen', icon: <Globe className="w-5 h-5" /> },
                { name: 'Mistral', icon: <Code2 className="w-5 h-5" /> },
                { name: 'Llama', icon: <Cpu className="w-5 h-5" /> },
                { name: 'Grok', icon: <Zap className="w-5 h-5" /> },
                { name: 'Copilot', icon: <Shield className="w-5 h-5" /> },
                { name: 'Perplexity', icon: <Search className="w-5 h-5" /> },
              ].map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium text-[#94a3b8] hidden sm:block">{item.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    { icon: <FolderTree className="w-7 h-7" />, title: t('features.context.title'), desc: t('features.context.desc'), gradient: 'from-purple-500 to-pink-500' },
    { icon: <Search className="w-7 h-7" />, title: t('features.search.title'), desc: t('features.search.desc'), gradient: 'from-cyan-500 to-blue-500' },
    { icon: <Shield className="w-7 h-7" />, title: t('features.privacy.title'), desc: t('features.privacy.desc'), gradient: 'from-green-500 to-emerald-500' },
    { icon: <Globe className="w-7 h-7" />, title: t('features.universal.title'), desc: t('features.universal.desc'), gradient: 'from-violet-500 to-purple-500' },
    { icon: <GitBranch className="w-7 h-7" />, title: t('features.git.title'), desc: t('features.git.desc'), gradient: 'from-orange-500 to-red-500' },
    { icon: <Terminal className="w-7 h-7" />, title: t('features.terminal.title'), desc: t('features.terminal.desc'), gradient: 'from-pink-500 to-rose-500' },
  ];

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            <span className="gradient-text">{t('features.title')}</span>
          </h2>
          <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto">{t('features.subtitle')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl blur-xl`}></div>
              
              <div className="relative p-8 rounded-3xl bg-[#111118] border-2 border-[#2a2a3a] hover:border-purple-500/50 transition-all duration-500">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-[#94a3b8] text-base leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { value: 'Local', label: t('stats.local'), icon: <Lock className="w-8 h-8" />, gradient: 'from-green-400 to-emerald-500' },
    { value: 'Multi', label: t('stats.providers'), icon: <Globe className="w-8 h-8" />, gradient: 'from-purple-400 to-pink-500' },
    { value: '∞', label: t('stats.projects'), icon: <Cpu className="w-8 h-8" />, gradient: 'from-cyan-400 to-blue-500' },
    { value: 'Local', label: t('stats.servers'), icon: <Shield className="w-8 h-8" />, gradient: 'from-indigo-400 to-violet-500' },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className="p-8 rounded-3xl bg-[#111118] border-2 border-[#2a2a3a] hover:border-purple-500/50 transition-all duration-500 text-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500`}>
                  {stat.icon}
                </div>
                
                <p className="text-5xl sm:text-6xl font-black gradient-text mb-2">
                  {stat.value}
                </p>
                
                <p className="text-base text-[#94a3b8] font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    { num: '01', title: t('howItWorks.step1.title'), desc: t('howItWorks.step1.desc'), icon: <FolderTree className="w-6 h-6" />, gradient: 'from-purple-500 to-pink-500' },
    { num: '02', title: t('howItWorks.step2.title'), desc: t('howItWorks.step2.desc'), icon: <Brain className="w-6 h-6" />, gradient: 'from-cyan-500 to-blue-500' },
    { num: '03', title: t('howItWorks.step3.title'), desc: t('howItWorks.step3.desc'), icon: <Search className="w-6 h-6" />, gradient: 'from-green-500 to-emerald-500' },
    { num: '04', title: t('howItWorks.step4.title'), desc: t('howItWorks.step4.desc'), icon: <Layers className="w-6 h-6" />, gradient: 'from-violet-500 to-purple-500' },
    { num: '05', title: t('howItWorks.step5.title'), desc: t('howItWorks.step5.desc'), icon: <Sparkles className="w-6 h-6" />, gradient: 'from-orange-500 to-red-500' },
    { num: '06', title: t('howItWorks.step6.title'), desc: t('howItWorks.step6.desc'), icon: <CheckCircle className="w-6 h-6" />, gradient: 'from-pink-500 to-rose-500' },
  ];

  return (
    <section id="how-it-works" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            <span className="gradient-text">{t('howItWorks.title')}</span>
          </h2>
          <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto">{t('howItWorks.subtitle')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl blur-xl`}></div>
              
              <div className="relative p-8 rounded-3xl bg-[#111118] border-2 border-[#2a2a3a] hover:border-purple-500/50 transition-all duration-500">
                <div className="absolute top-6 right-6 text-7xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                  {step.num}
                </div>

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {step.icon}
                </div>

                <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-[#94a3b8] text-base leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdvantagesSection() {
  const { t } = useLanguage();

  const advantages = [
    { icon: <Brain className="w-7 h-7" />, title: t('advantages.memory.title'), desc: t('advantages.memory.desc'), gradient: 'from-purple-500 to-pink-500' },
    { icon: <Shield className="w-7 h-7" />, title: t('advantages.permissions.title'), desc: t('advantages.permissions.desc'), gradient: 'from-cyan-500 to-blue-500' },
    { icon: <CheckCircle className="w-7 h-7" />, title: t('advantages.approval.title'), desc: t('advantages.approval.desc'), gradient: 'from-green-500 to-emerald-500' },
    { icon: <Map className="w-7 h-7" />, title: t('advantages.map.title'), desc: t('advantages.map.desc'), gradient: 'from-violet-500 to-purple-500' },
    { icon: <RefreshCw className="w-7 h-7" />, title: t('advantages.compare.title'), desc: t('advantages.compare.desc'), gradient: 'from-orange-500 to-red-500' },
    { icon: <Layers className="w-7 h-7" />, title: t('advantages.tasks.title'), desc: t('advantages.tasks.desc'), gradient: 'from-pink-500 to-rose-500' },
    { icon: <Plug className="w-7 h-7" />, title: t('advantages.plugins.title'), desc: t('advantages.plugins.desc'), gradient: 'from-indigo-500 to-violet-500' },
    { icon: <Users className="w-7 h-7" />, title: t('advantages.team.title'), desc: t('advantages.team.desc'), gradient: 'from-teal-500 to-cyan-500' },
  ];

  return (
    <section id="advantages" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            <span className="gradient-text">{t('advantages.title')}</span>
          </h2>
          <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto">{t('advantages.subtitle')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${adv.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl blur-xl`}></div>
              
              <div className="relative p-6 rounded-3xl bg-[#111118] border-2 border-[#2a2a3a] hover:border-purple-500/50 transition-all duration-500">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${adv.gradient} flex items-center justify-center mb-5 text-white shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                  {adv.icon}
                </div>

                <h3 className="text-lg font-bold mb-2 text-white">{adv.title}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{adv.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  const { t } = useLanguage();

  return (
    <section id="architecture" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            <span className="gradient-text">{t('architecture.title')}</span>
          </h2>
          <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto">{t('architecture.subtitle')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="group relative"
          >
            <div className="p-8 rounded-3xl bg-[#111118] border-2 border-green-500/30 hover:border-green-500/50 transition-all duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-400">{t('architecture.local')}</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                {[t('architecture.local.user'), t('architecture.local.aiChat'), t('architecture.local.extension'), t('architecture.local.engine'), t('architecture.local.files')].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 hover:bg-green-500/10 transition-colors"
                  >
                    <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-500/50"></div>
                    <span className="text-base text-white font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30">
                <p className="text-sm text-green-300 font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('architecture.localNote')}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="group relative"
          >
            <div className="p-8 rounded-3xl bg-[#111118] border-2 border-red-500/30 hover:border-red-500/50 transition-all duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-400">{t('architecture.cloud')}</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                {[t('architecture.cloud.userFiles'), t('architecture.cloud.server'), t('architecture.cloud.aiServer'), t('architecture.cloud.user')].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-colors"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-lg shadow-red-500/50"></div>
                    <span className="text-base text-white font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-300 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t('architecture.cloudNote')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function RoadmapSection() {
  const { t } = useLanguage();

  const phases = [
    { phase: t('roadmap.phase1'), title: t('roadmap.phase1'), status: 'current', desc: t('roadmap.phase1.desc'), gradient: 'from-purple-500 to-pink-500' },
    { phase: t('roadmap.phase2'), title: t('roadmap.phase2'), status: 'upcoming', desc: t('roadmap.phase2.desc'), gradient: 'from-cyan-500 to-blue-500' },
    { phase: t('roadmap.phase3'), title: t('roadmap.phase3'), status: 'upcoming', desc: t('roadmap.phase3.desc'), gradient: 'from-green-500 to-emerald-500' },
    { phase: t('roadmap.phase4'), title: t('roadmap.phase4'), status: 'upcoming', desc: t('roadmap.phase4.desc'), gradient: 'from-violet-500 to-purple-500' },
    { phase: t('roadmap.phase5'), title: t('roadmap.phase5'), status: 'upcoming', desc: t('roadmap.phase5.desc'), gradient: 'from-orange-500 to-red-500' },
    { phase: t('roadmap.phase6'), title: t('roadmap.phase6'), status: 'upcoming', desc: t('roadmap.phase6.desc'), gradient: 'from-pink-500 to-rose-500' },
  ];

  return (
    <section id="roadmap" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            <span className="gradient-text">{t('roadmap.title')}</span>
          </h2>
          <p className="text-xl text-[#94a3b8] max-w-3xl mx-auto">{t('roadmap.subtitle')}</p>
        </motion.div>

        <div className="relative">
          <div className="absolute right-6 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500 hidden sm:block rounded-full"></div>
          
          <div className="space-y-8">
            {phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: -10 }}
                className="relative flex items-start gap-6 group"
              >
                <div className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center flex-shrink-0 ${
                  phase.status === 'current' 
                    ? `bg-gradient-to-br ${phase.gradient} shadow-2xl` 
                    : 'bg-[#1a1a2e] border-2 border-[#2a2a4a]'
                }`}>
                  <span className="text-sm font-bold text-white">{i + 1}</span>
                </div>

                <div className="flex-1">
                  <div className={`p-6 rounded-3xl bg-[#111118] border-2 ${
                    phase.status === 'current' ? 'border-purple-500/50' : 'border-[#2a2a3a] hover:border-purple-500/50'
                  } transition-all duration-500`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-sm font-mono font-bold bg-gradient-to-r ${phase.gradient} bg-clip-text text-transparent`}>
                        {phase.phase}
                      </span>
                      {phase.status === 'current' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          {t('roadmap.current')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{phase.title}</h3>
                    <p className="text-[#94a3b8] text-base">{phase.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ onLaunch }: { onLaunch: () => void }) {
  const { t } = useLanguage();
  const downloadUrl = 'https://github.com/zssalsabil12-creator/universal-local-ai-bridge/releases/download/v3.10.5/ULAB-Setup-3.10.5-Windows-x64.exe';

  return (
    <section className="py-32 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-[3rem] blur-2xl"></div>
          
          <div className="relative p-12 sm:p-20 rounded-[3rem] bg-[#111118] border-2 border-purple-500/30 hover:border-purple-500/50 transition-all duration-500">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                className="inline-block mb-10"
              >
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-2xl animate-float">
                  <Zap className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black mb-6"
              >
                <span className="gradient-text">{t('cta.title')}</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-xl text-[#94a3b8] max-w-3xl mx-auto mb-12"
              >
                {t('cta.subtitle')}
              </motion.p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href={downloadUrl}
                  download="ULAB-Setup-3.10.5-Windows-x64.exe"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold text-xl shadow-2xl hover:shadow-cyan-500/40 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <Download className="w-7 h-7" />
                    {t('cta.download')}
                  </span>
                </motion.a>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLaunch}
                  className="px-10 py-5 rounded-2xl bg-[#111118] border-2 border-purple-500/40 text-white font-bold text-xl hover:border-purple-400/70 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <Rocket className="w-7 h-7" />
                    {t('cta.button')}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ onOpenLegal }: { onOpenLegal: (tab: 'privacy' | 'terms' | 'about') => void }) {
  const { t } = useLanguage();

  return (
    <footer className="py-16 border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl gradient-text">ULAB</span>
          </div>

          <p className="text-center text-[#94a3b8] max-w-2xl">
            {t('footer.rights')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111118] border border-purple-500/30 hover:border-cyan-400/50 transition-all text-sm text-[#94a3b8] hover:text-white"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => onOpenLegal('terms')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111118] border border-purple-500/30 hover:border-purple-400/50 transition-all text-sm text-[#94a3b8] hover:text-white"
            >
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Terms</span>
            </button>
            <button
              onClick={() => onOpenLegal('about')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111118] border border-purple-500/30 hover:border-pink-400/50 transition-all text-sm text-[#94a3b8] hover:text-white"
            >
              <Globe className="w-4 h-4 text-pink-400" />
              <span>Monetization</span>
            </button>
          </div>

          <div className="w-full max-w-4xl my-4">
            <AdContainer format="horizontal" label="Sponsor / Advertising" />
          </div>

          <div className="pt-8 border-t border-purple-500/20 w-full text-center">
            <p className="text-sm text-[#64748b]">
              Universal Local AI Bridge — Desktop application with a bundled Local Agent and controlled workspace access
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'about'>('privacy');

  const handleOpenLegal = (tab: 'privacy' | 'terms' | 'about') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      <CosmicBackground />
      <div className="relative z-10">
        <Navbar onLaunch={onLaunch} />
        <Hero onLaunch={onLaunch} />
        <FeaturesSection />
        <StatsSection />
        <div className="max-w-5xl mx-auto px-4 my-8">
          <AdContainer format="horizontal" label="Google AdSense / Advertising" />
        </div>
        <DownloadSection />
        <HowItWorksSection />
        <AdvantagesSection />
        <ArchitectureSection />
        <RoadmapSection />
        <CTASection onLaunch={onLaunch} />
        <Footer onOpenLegal={handleOpenLegal} />
      </div>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}
