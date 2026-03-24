import { BottomSection } from './components/home/BottomSection';
import { FeaturesSection } from './components/home/FeaturesSection';
import { TopFooter } from './components/home/TopFooter';
import { TopHeader } from './components/home/TopHeader';
import { TopSection } from './components/home/TopSection';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopHeader />
      <main>
        <TopSection />
        <FeaturesSection />
        <BottomSection />
      </main>
      <TopFooter />
    </div>
  );
}

export default App;
