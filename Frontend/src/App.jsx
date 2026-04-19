import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useNotification } from './hooks/useNotification';

// 페이지 컴포넌트 임포트 (기존 경로 유지)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import Setting from './pages/Setting';
import Diagnosis from './pages/Diagnosis';
import SideCapturePage from './pages/SideCapturePage'; 
import TeamMonitorPage from './pages/TeamMonitorPage';
import InitialSetupPage from './pages/InitialSetupPage';
import StretchPage from './pages/StretchPage';
import Footer from './components/Footer';
import FrontCapturePage from './pages/FrontCapturePage';

// 알림 전용 핸들러
function NotificationHandler() {
  // 💡 중요: "17:13" 처럼 반드시 두 자리 형식으로 적어주세요! (17:2 X)
  useNotification("09:40", "17:50");
  return null;
}

function MainLayout() {
  return (
    <div style={{ paddingBottom: '85px' }}>
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* 알림 핸들러 실행 */}
      <NotificationHandler />
      
      <div style={mobileFrameStyle}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/side-capture" element={<SideCapturePage />} />
          <Route path="/stretch" element={<StretchPage />} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/initialsetuppage" element={<InitialSetupPage />} /> 
            <Route path="/team-monitor" element={<TeamMonitorPage />} /> 
            <Route path="/sidecapturepage" element={<SideCapturePage />} />
            <Route path="/front-capture" element={<FrontCapturePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const mobileFrameStyle = {
  maxWidth: '520px',
  minHeight: '100vh',
  margin: '0 auto',
  background: '#F9FAFB',
  position: 'relative',
  overflowX: 'hidden',
  boxShadow: '0 0 40px rgba(0,0,0,0.05)'
};

export default App;