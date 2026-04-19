import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 나중에 auth context로 교체

  const isLanding = location.pathname === '/'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '480px', zIndex: 100,
      background: isLanding ? 'transparent' : '#FAF8F5',
      borderBottom: isLanding ? 'none' : '1px solid #F0EBE3',
      padding: '0 1.5rem',
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'background 0.3s'
    }}>
      {/* 로고 */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7C9E87', letterSpacing: '-0.5px' }}>
          Re:balance
        </span>
      </Link>

      {/* 메뉴 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" style={navLinkStyle}>대시보드</Link>
            <Link to="/mypage" style={navLinkStyle}>마이페이지</Link>
            <button onClick={() => setIsLoggedIn(false)} style={btnStyle}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" style={navLinkStyle}>로그인</Link>
            <button onClick={() => navigate('/login?tab=signup')} style={btnStyle}>회원가입</button>
          </>
        )}
      </div>
    </nav>
  )
}

const navLinkStyle = {
  color: '#01070e',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
}

const btnStyle = {
  background: '#7C9E87',
  color: '#FAF8F5',
  border: 'none',
  borderRadius: '8px',
  padding: '0.5rem 1.2rem',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
}

export default Navbar