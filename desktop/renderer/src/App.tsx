import { useEffect, useState } from 'react';
import Workspace from './pages/Workspace';
import BrandMark from './components/BrandMark';
import { localAgent } from './utils/localAgent';

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const desktop = window.ulabDesktop;
      if (!desktop?.isDesktop) {
        if (!cancelled) setBooting(false);
        return;
      }

      // The bundled Agent may need a short moment to bind localhost while the
      // Electron window is starting. Retry health + WebSocket connection so
      // users do not see a false "Agent offline" state during normal startup.
      for (let attempt = 0; attempt < 12 && !cancelled; attempt += 1) {
        try {
          const health = await desktop.agentHealth();
          if (health?.ok) {
            const config = await desktop.agentConfig();
            const connected = await localAgent.connect(config.url, config.token);
            if (connected) break;
          }
        } catch {
          // Retry below; the main process owns the Agent lifecycle.
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!cancelled) setBooting(false);
    })();
    return () => { cancelled = true; localAgent.disconnect(false); };
  }, []);

  if (booting) {
    return (
      <div className="ulab-boot min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="ulab-boot-mark"><BrandMark size={78} showWordmark={false} /></div>
          <div className="mt-5 text-[13px] font-black tracking-[0.24em]">ULAB</div>
          <div className="mt-2 text-[10px] text-[#71809f] tracking-[0.08em]">UNIVERSAL LOCAL AI BRIDGE</div>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[#8795b0]">
            <span className="ulab-boot-pulse"></span>
            Connecting to Local Agent…
          </div>
        </div>
      </div>
    );
  }
  return <Workspace onBack={() => undefined} />;
}
