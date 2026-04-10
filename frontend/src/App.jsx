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

// 별도로 분리한 Footer 컴포넌트 임포트
import Footer from './components/Footer';

/**
 * 1. 하단 바(Footer)를 포함하는 공통 레이아웃
 * 로그인 후의 모든 페이지는 이 레이아웃 안에서 렌더링됩니다.
 */
function MainLayout() {
  return (
    <div style={{ paddingBottom: '85px' }}> {/* 푸터 높이만큼 하단 여백 확보 */}
      <Outlet /> {/* 여기에 실제 페이지 내용(MyPage 등)이 들어갑니다 */}
      <Footer /> {/* 모든 페이지 하단에 고정되는 네비게이션 바 */}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* 2. 모바일 프레임 설정: 모든 페이지를 감싸는 고정 너비 컨테이너 */}
      <div style={mobileFrameStyle}>
        <Routes>
          {/* 3. 하단 바가 필요 없는 페이지 (온보딩/로그인) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          
          {/* 4. 하단 바가 항상 있어야 하는 페이지 그룹 (중첩 라우팅) */}
          <Route element={<MainLayout />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stretching" element={<Stretching />} />
            <Route path="/setting" element={<Setting />} />
            
            {/* 추가될 수 있는 설정(/settings) 등도 여기에 위치 */}
          </Route>

          {/* 5. 예외 경로 처리: 잘못된 주소로 들어오면 랜딩으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// --- 스타일링 (프레임 디자인) ---
const mobileFrameStyle = {
  maxWidth: '520px',      // 모바일 친화적 가로 너비 제한
  minHeight: '100vh',     // 화면 전체 높이 사용
  margin: '0 auto',       // 데스크탑에서 중앙 정렬
  background: '#F9FAFB',  // 전체 배경색
  position: 'relative',
  overflowX: 'hidden',    // 가로 스크롤 방지
  boxShadow: '0 0 40px rgba(0,0,0,0.05)' // 화면 구분용 그림자
};

export default App;