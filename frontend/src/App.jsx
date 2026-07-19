import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FlowProvider } from './context/FlowContext';
import MerchantFlow from './pages/merchant/MerchantFlow';
import StoryPage from './pages/public/StoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 상인 플로우: 단일 라우트 + step 상태 전환 */}
        <Route path="/" element={
          <FlowProvider>
            <MerchantFlow />
          </FlowProvider>
        } />
        {/* 소비자용 공개 스토리 페이지 */}
        <Route path="/s/:storeId" element={<StoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}
