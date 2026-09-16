import { useEffect } from 'react';

/** Loads AdSense once when a real publisher client ID is configured. */
export default function AdSenseScript() {
  const client = (((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_ADSENSE_CLIENT) || '').trim();

  useEffect(() => {
    if (!/^ca-pub-\d+$/.test(client)) return;
    if (document.getElementById('ulab-adsense-script')) return;

    const script = document.createElement('script');
    script.id = 'ulab-adsense-script';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    document.head.appendChild(script);
  }, [client]);

  return null;
}
