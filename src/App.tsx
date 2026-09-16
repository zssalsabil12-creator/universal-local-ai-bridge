import { useState } from 'react';
import Landing from './pages/Landing';
import Workspace from './pages/Workspace';
import AdSenseScript from './components/AdSenseScript';

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');

  if (view === 'workspace') {
    return <Workspace onBack={() => setView('landing')} />;
  }

  return (
    <>
      <AdSenseScript />
      <Landing onLaunch={() => setView('workspace')} />
    </>
  );
}
