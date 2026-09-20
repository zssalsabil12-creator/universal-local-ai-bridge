import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AdContainerProps {
  slotId?: string;
  adClient?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
  label?: string;
}

/**
 * AdContainer: Google AdSense-compatible component with graceful fallback
 * When AdSense script is present and configured, renders the official <ins> tag.
 * Otherwise, renders a sleek developer-friendly sponsor/ad banner placeholder.
 */
export const AdContainer: React.FC<AdContainerProps> = ({
  slotId = '1234567890',
  adClient = 'ca-pub-XXXXXXXXXXXXXXXX',
  format = 'horizontal',
  className = '',
  label = 'مساحة إعلانية مخصصة / Sponsor Space',
}) => {
  const configuredClient = ((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_ADSENSE_CLIENT || adClient).trim();
  const configuredSlot = ((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_ADSENSE_SLOT || slotId).trim();
  const isConfigured = /^ca-pub-\d+$/.test(configuredClient) && /^\d+$/.test(configuredSlot);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (!isConfigured || typeof window === 'undefined') return;
    const script = document.getElementById('ulab-adsense-script');
    if (script) setAdLoaded(true);
  }, [isConfigured]);

  useEffect(() => {
    if (!isConfigured || !adLoaded || typeof window === 'undefined') return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense can reject a placement during review or when inventory is unavailable.
    }
  }, [adLoaded, isConfigured, configuredSlot]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#2a2a3a] bg-[#111118]/80 backdrop-blur-sm p-3 text-center transition-all ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-2 px-1">
        <span className="flex items-center gap-1 font-medium text-left" dir="auto">
          <Sparkles className="w-3 h-3 text-purple-400" />
          {label}
        </span>
        <span className="text-[9px] text-[#4a5568]">Google AdSense Ready</span>
      </div>

      {isConfigured ? (
        <div className="w-full flex justify-center items-center min-h-[90px]">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={configuredClient}
            data-ad-slot={configuredSlot}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <div className="py-4 px-3 rounded-lg border border-dashed border-[#2a2a3a] bg-[#0a0a0f]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-cyan-300">AD</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#e2e8f0]">
                مساحة إعلانات جاهزة لـ Google AdSense
              </p>
              <p className="text-[11px] text-[#94a3b8]">
                مساحة إعلانية مرنة وجاهزة لدمج Google AdSense أو مزود إعلانات آخر بعد استكمال إعدادات الحساب والمراجعة المطلوبة.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2 py-1 rounded bg-[#1e1e28] text-[10px] text-purple-300 border border-purple-500/20 font-mono">
              Auto Responsive
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdContainer;
