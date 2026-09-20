import { useEffect, useState } from 'react';
import Workspace from './pages/Workspace';
import BrandMark from './components/BrandMark';
import { localAgent } from './utils/localAgent';

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const desktop = window.ulabDesktop;
        if (desktop?.isDesktop) {
          const config = await desktop.agentConfig();
          await localAgent.connect(config.url, config.token);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => { cancelled = true; };
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
