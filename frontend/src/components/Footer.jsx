import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// 아이콘 라이브러리 (설치 필요: npm install react-icons)
import { VscGear } from "react-icons/vsc";
import { TbStretching } from "react-icons/tb";
import { FcStatistics } from "react-icons/fc";
import { FaHome } from "react-icons/fa";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 메뉴 데이터 정의
  const navMenus = [
    { id: 'home', label: 'HOME', path: '/mypage', icon: <FaHome /> },
    { id: 'stretch', label: '스트레칭', path: '/stretching', icon: <TbStretching /> },
    { id: 'stats', label: '기록', path: '/dashboard', icon: <FcStatistics /> },
    { id: 'setting', label: '설정', path: '/setting', icon: <VscGear /> },
  ];

  return (
    <footer style={footerStyle}>
      {navMenus.map((menu) => {
        // 2. 현재 활성화된 메뉴인지 확인
        const isActive = location.pathname === menu.path;

        return (
          <div
            key={menu.id}
            onClick={() => navigate(menu.path)} // 3. 클릭 시 이동
            style={{
              ...navItemStyle,
              color: isActive ? '#070707' : '#9CA3AF', // 활성화 시 검정, 아니면 회색
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{menu.icon}</div>
            <span style={{ 
              fontSize: '0.65rem', 
              fontWeight: isActive ? '900' : '500',
              opacity: isActive ? 1 : 0.7 
            }}>
              {menu.label}
            </span>
          </div>
        );
      })}
    </footer>
  );
}

// --- 스타일 (Re:balance 브랜드 톤 유지) ---
const footerStyle = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: '520px',
  background: '#D9D3D0', // 기존 마이페이지와 통일된 색상
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: '85px',
  borderTopLeftRadius: '24px',
  borderTopRightRadius: '24px',
  zIndex: 1000,
  boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
};

const navItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out'
};