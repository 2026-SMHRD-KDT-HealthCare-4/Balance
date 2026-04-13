import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// [팀원 페이지 임포트]
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import Setting from './pages/Setting';
import Diagnosis from './pages/Diagnosis';
import SideCapturePage from './pages/SideCapturePage'; 
import TeamMonitorPage from './pages/TeamMonitorPage'; // 👈 팀원 기존 페이지 다시 추가
import InitialSetupPage from './pages/InitialSetupPage';
// [예훈님 페이지 임포트]
import MonitorPageStretch from './pages/MonitorPage_Stretch'; 
import StretchPage from './pages/StretchPage';

// 컴포넌트 임포트
import Footer from './components/Footer';
import FrontCapturePage from './pages/FrontCapturePage';
// import NotificationManager from "./components/Notification/NotificationManager";

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
      {/* <NotificationManager /> */}
      
      <div style={mobileFrameStyle}>
        <Routes>
          {/* --- [그룹 1] 하단 바 없는 페이지 --- */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/side-capture" element={<SideCapturePage />} />
          <Route path="/stretch" element={<StretchPage />} />

          {/* --- [그룹 2] 하단 바 있는 페이지 --- */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/setup" element={<InitialSetupPage />} />
            {/* ✅ 두 가지 모니터링 페이지를 모두 유지합니다 */}
            <Route path="/monitor" element={<MonitorPageStretch />} /> {/* 예훈님: 스트레칭 연동 모드 */}
            <Route path="/team-monitor" element={<TeamMonitorPage />} /> {/* 팀원: PIP 알림 모드 */}
            
            {/* 더 이상 필요 없는 InitialSetupPage 경로는 삭제했습니다 */}
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