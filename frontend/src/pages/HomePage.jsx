import { BottomSection } from '../components/home/BottomSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { UpperSection } from '../components/home/UpperSection';

// ログイン前HOME画面
export default function HomePage() {
  return (
    <>
      <UpperSection />
      <FeaturesSection />
      <BottomSection />
    </>
  );
}
