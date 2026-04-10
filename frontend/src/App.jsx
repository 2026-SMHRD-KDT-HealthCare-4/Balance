import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// 페이지 컴포넌트 임포트
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
import Stretching from './pages/Stretching';
import Setting from './pages/Setting';
import Diagnosis from './pages/Diagnosis';
import SideCapturePage from './pages/SideCapturePage'; // 의성님 페이지 1
import MonitorPage from './pages/MonitorPage';       // 의성님 페이지 2
import InitialSetupPage from './pages/InitialSetupPage';

// 별도로 분리한 Footer 컴포넌트 임포트
import Footer from './components/Footer';

/**
 * 1. 하단 바(Footer)를 포함하는 공통 레이아웃
 */
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
      <div style={mobileFrameStyle}>
        <Routes>
          {/* --- [그룹 1] 하단 바가 필요 없는 페이지 (로그인 전/특수 기능) --- */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          
          {/* 팩트 체크: 로그인 전 체험 페이지는 Footer 없이 풀 스크린으로 측정에 집중하게 합니다 */}
          <Route path="/side-capture" element={<SideCapturePage />} />

          {/* --- [그룹 2] 하단 바가 항상 있어야 하는 페이지 그룹 (로그인 후 서비스) --- */}
          <Route element={<MainLayout />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stretching" element={<Stretching />} />
            <Route path="/setting" element={<Setting />} />
            
            {/* 실시간 측정 페이지: 대시보드에서 들어오기 때문에 레이아웃 유지가 UX상 유리할 수 있음 */}
            {/* 만약 카메라 화면을 더 크게 쓰고 싶다면 그룹 1(위쪽)로 옮기십시오. */}
            <Route path="/monitor" element={<MonitorPage />} />
            <Route path="/setup" element={<InitialSetupPage />} />
            <Route path="/initialsetuppage" element={<InitialSetupPage />} />
            <Route path="/sidecapturepage" element={<SideCapturePage />} />
          </Route>

          {/* 예외 경로 처리 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// --- 스타일링 (프레임 디자인) ---
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