import Landing from './pages/Landing';

export default function App() {
  const goToDownload = () => {
    document.getElementById('download')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <Landing onLaunch={goToDownload} />;
}
