import { BottomSection } from '../components/home/BottomSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { TopSection } from '../components/home/TopSection';

// ログイン前TOP画面
export default function LoadingPage() {
  return (
    <>
      <TopSection />
      <FeaturesSection />
      <BottomSection />
    </>
  );
}
