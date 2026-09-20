import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language, languageInfo } from '../i18n/translations';
import { Settings as SettingsIcon, Globe, Shield, Cpu, Save, RotateCcw, CheckCircle } from 'lucide-react';

interface Settings {
  theme: 'dark' | 'light';
  language: Language;
  autoSave: boolean;
  maxContextFiles: number;
  maxContextLines: number;
  enableGit: boolean;
  enableTerminal: boolean;
  permissionMode: 'readonly' | 'assisted' | 'agent';
}

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  language: 'ar',
  autoSave: true,
  maxContextFiles: 10,
  maxContextLines: 2000,
  enableGit: true,
  enableTerminal: true,
  permissionMode: 'readonly',
};

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const { language, setLanguage, t } = useLanguage();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(prev => ({ ...prev, language }));
  }, [language]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLanguage(localSettings.language);
    onSettingsChange(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold">{t('workspace.settings')}</h3>
      </div>

      {/* General */}
      <div className="mb-6">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          عام
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">اللغة</span>
            <select
              value={localSettings.language}
              onChange={e => setLocalSettings({ ...localSettings, language: e.target.value as Language })}
              className="px-2 py-1 rounded bg-[#0a0a0f] border border-[#2a2a3a] text-xs text-white"
            >
              {(['ar', 'en', 'es', 'fr', 'ko', 'zh'] as Language[]).map(langCode => (
                <option key={langCode} value={langCode}>{languageInfo[langCode].nativeName}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">حفظ تلقائي</span>
            <button
              onClick={() => setLocalSettings({ ...localSettings, autoSave: !localSettings.autoSave })}
              className={`w-10 h-5 rounded-full transition-colors ${
                localSettings.autoSave ? 'bg-indigo-500' : 'bg-[#2a2a3a]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                localSettings.autoSave ? 'translate-x-5' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Context Engine */}
      <div className="mb-6">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          محرك السياق
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#94a3b8]">أقصى عدد ملفات</span>
              <span className="text-xs text-indigo-400">{localSettings.maxContextFiles}</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={localSettings.maxContextFiles}
              onChange={e => setLocalSettings({ ...localSettings, maxContextFiles: parseInt(e.target.value) })}
              className="w-full h-1 rounded bg-[#2a2a3a] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#94a3b8]">أقصى عدد أسطر</span>
              <span className="text-xs text-indigo-400">{localSettings.maxContextLines}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={localSettings.maxContextLines}
              onChange={e => setLocalSettings({ ...localSettings, maxContextLines: parseInt(e.target.value) })}
              className="w-full h-1 rounded bg-[#2a2a3a] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          المميزات
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">تفعيل Git</span>
            <button
              onClick={() => setLocalSettings({ ...localSettings, enableGit: !localSettings.enableGit })}
              className={`w-10 h-5 rounded-full transition-colors ${
                localSettings.enableGit ? 'bg-indigo-500' : 'bg-[#2a2a3a]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                localSettings.enableGit ? 'translate-x-5' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">تفعيل Terminal</span>
            <button
              onClick={() => setLocalSettings({ ...localSettings, enableTerminal: !localSettings.enableTerminal })}
              className={`w-10 h-5 rounded-full transition-colors ${
                localSettings.enableTerminal ? 'bg-indigo-500' : 'bg-[#2a2a3a]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                localSettings.enableTerminal ? 'translate-x-5' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              تم الحفظ
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              حفظ الإعدادات
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-[#252530] text-[#94a3b8] text-xs hover:bg-[#2a2a3a] transition-colors"
          title="إعادة تعيين"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
