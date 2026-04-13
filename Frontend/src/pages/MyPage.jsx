import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { TbStretching } from 'react-icons/tb';
import { FcStatistics } from 'react-icons/fc';
import { VscGear } from 'react-icons/vsc';

const CONFIG = {
  RED: { 
    label: "위험", color: "#EF4444", bgColor: "#FEF2F2", 
    desc: "자세가 많이 무너졌어요", img: "../images/bad_transparent.png",
    advice: "지금 바로 어깨를 뒤로 젖히세요!", animation: "shake 0.5s infinite" 
  },
  YELLOW: { 
    label: "주의", color: "#F59E0B", bgColor: "#FFFBEB",
    desc: "조금씩 좋아지고 있어요", img: "../images/normal_transparent.png",
    advice: "거북목 각도가 줄어들고 있어요!", animation: "bounce 2s infinite"
  },
  GREEN: { 
    label: "양호", color: "#10B981", bgColor: "#F0FDF4",
    desc: "바른 자세 유지 중!", img: "../images/good_transparent.png",
    advice: "완벽합니다! 이대로 유지하세요.", animation: "none"
  },
};

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState(0);

  useEffect(() => {
    // 페이지에 진입할 때마다 로컬 스토리지에서 최신 측정값을 가져와 점수 계산
    const rawData = localStorage.getItem('user_baseline');
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        // 여기서 실제 점수 계산 로직을 넣으세요. 우선은 30점으로 고정 테스트
        setScore(50); 
      } catch (e) {
        console.error("데이터 파싱 에러", e);
      }
    }
  }, []); // 컴포넌트 마운트 시 실행

  // 일주일 주기 로직: 기록이 없거나 7일이 지났으면 true
  const needsSideCapture = useMemo(() => {
    const lastDate = localStorage.getItem('lastSideCaptureDate');
    if (!lastDate) return true; 

    const last = new Date(lastDate).getTime();
    const now = new Date().getTime();
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    
    return diffDays >= 7; 
  }, []);

  const current = useMemo(() => {
    if (score < 40) return CONFIG.RED;
    if (score < 70) return CONFIG.YELLOW;
    return CONFIG.GREEN;
  }, [score]) || CONFIG.GREEN;

  const handleLogout = () => {
    if (window.confirm("로그아웃하시겠습니까?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/', { replace: true });
    }
  };

  if (!current) return <div>Loading...</div>;

  return (
    <div style={{ ...s.layout, background: current?.bgColor || '#FFF' }}>
      {/* 1. 상단 고정 헤더 */}
      <header style={{ ...s.fixedHeader, background: current.bgColor }}>
        <h1 style={s.logo}>Re:balance</h1>
        <button onClick={handleLogout} style={s.logoutBtn}>로그아웃</button>
      </header>

      {/* 2. 스크롤 본문 영역 */}
      <div style={s.scrollBox}>
        <section style={s.llmSection}>
          <div style={{ ...s.aiBadge, color: current.color }}>AI COACH</div>
          <h2 style={s.mainGreeting}>{current.advice}</h2>
          <p style={s.llmText}>
            현재 상태는 <b style={{color: current.color}}>{current.label}</b>입니다.
          </p>
        </section>

        {/* [중요] 일주일 한 번 뜨는 측면 촬영 배너 */}
        {needsSideCapture && (
          <div style={s.sideCaptureBanner}>
            <div style={s.sideCaptureTextArea}>
              <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>📸 주간 측면 기록 시간</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>정확한 개선도를 확인해보세요</span>
            </div>
            <button 
              onClick={() => navigate('/sidecapturepage', { state: { from: 'mypage' }})} 
              style={s.sideCaptureBtn}
            >
              촬영하기
            </button>
          </div>
        )}

        {score < 40 && (
          <div style={s.emergencyBanner}>
            <span style={{flex: 1}}>⚠️ <b>긴급:</b> 1분 스트레칭이 필요합니다</span>
            <button onClick={() => navigate('/monitor')} style={s.emergencyBtn}>지금 하기</button>
          </div>
        )}

        <section style={s.heroSection}>
          <div style={{ ...s.characterHalo, backgroundColor: current.color }} />
          <div style={s.imageWrapper}>
            <img 
              src={current.img} 
              alt="character" 
              style={{ ...s.charImg, animation: current.animation }} 
            />
          </div>

          <div style={s.statusInfoRow}>
            <div style={s.statusLeft}>
              <span style={{ ...s.statusLabel, color: current.color }}>{current.label}</span>
              <div style={s.scoreText}>{score}<small style={{fontSize: '1rem'}}>점</small></div>
            </div>
            <div style={s.statusRight}>
              <p style={s.descText}>{current.desc}</p>
              <p style={s.subDescText}>실시간 센서 데이터 분석 기준</p>
            </div>
          </div>
        </section>

        <section style={s.contentSection}>
          <div style={s.infoGrid}>
            <div style={s.infoCard}>
              <span style={s.infoLabel}>예상 목 나이</span>
              <span style={s.infoVal}>28세</span>
            </div>
            <div style={s.infoCard}>
              <span style={s.infoLabel}>스트레칭</span>
              <span style={{ ...s.infoVal, color: '#7C9E87' }}>4 / 5회</span>
            </div>
          </div>
          <div style={{ height: '180px' }} />
        </section>
      </div>

      {/* 3. 하단 고정 버튼 영역 */}
      <div style={s.fixedBottomArea}>
        <div style={s.buttonGrid}>
          <button onClick={() => navigate('/team-monitor')} style={s.subBtn}>
            자세 모니터링
          </button>
          <button onClick={() => navigate('/initialsetuppage')} style={s.mainBtn}>
            거북목 측정
          </button>
        </div>
      </div>
        
      {/* 4. 내비게이션 푸터 */}
      <footer style={s.footer}>
        {[
          { id: 'home', label: 'HOME', path: '/mypage', icon: <FaHome /> },
          { id: 'stretch', label: '스트레칭', path: '/stretching', icon: <TbStretching /> },
          { id: 'stats', label: '기록', path: '/dashboard', icon: <FcStatistics /> },
          { id: 'settings', label: '설정', path: '/settings', icon: <VscGear /> },
        ].map((menu) => (
          <div key={menu.id} onClick={() => navigate(menu.path)} style={s.navItem(location.pathname === menu.path)}>
            <div style={{ fontSize: '1.5rem' }}>{menu.icon}</div>
            <span style={{ fontSize: '0.6rem', marginTop: '4px' }}>{menu.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}

const s = {
  layout: { position: 'fixed', inset: 0, maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', transition: 'background 0.5s ease', overflow: 'hidden' },
  fixedHeader: { height: '70px', padding: '0 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, flexShrink: 0 },
  logo: { fontSize: '1.2rem', fontWeight: '900', color: '#7C9E87' },
  logoutBtn: { padding: '8px 12px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', fontSize: '0.7rem', color: '#666', cursor: 'pointer' },
  scrollBox: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  llmSection: { padding: '20px 25px 10px' },
  aiBadge: { display: 'inline-block', padding: '4px 8px', background: 'rgba(255,255,255,0.8)', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', marginBottom: '8px' },
  mainGreeting: { fontSize: '1.4rem', fontWeight: '800', color: '#1F2937', margin: '0 0 5px 0' },
  llmText: { fontSize: '0.9rem', color: '#6B7280', margin: 0 },
  
  // 파란 상자 (측면 촬영 배너) 스타일
  sideCaptureBanner: { background: '#4F46E5', color: '#FFF', padding: '18px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', margin: '10px 25px', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)' },
  sideCaptureTextArea: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  sideCaptureBtn: { background: '#FFF', color: '#4F46E5', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer' },

  emergencyBanner: { background: '#EF4444', color: '#FFF', padding: '12px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', margin: '10px 25px', fontSize: '0.85rem' },
  emergencyBtn: { background: '#FFF', color: '#EF4444', border: 'none', padding: '5px 10px', borderRadius: '8px', fontWeight: '800', marginLeft: '10px' },
  heroSection: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 25px' },
  characterHalo: { position: 'absolute', top: '10%', width: '280px', height: '280px', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.2, zIndex: 0 },
  imageWrapper: { zIndex: 1, height: '320px', display: 'flex', alignItems: 'center', marginBottom: '10px' },
  charImg: { height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' },
  statusInfoRow: { width: '100%', display: 'flex', alignItems: 'center', padding: '20px 0', borderTop: '1px solid rgba(0,0,0,0.05)' },
  statusLeft: { flex: '0 0 85px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,0,0,0.05)', marginRight: '20px' },
  statusLabel: { fontSize: '0.8rem', fontWeight: '900', marginBottom: '2px' },
  scoreText: { fontSize: '2.2rem', fontWeight: '900', color: '#1F2937' },
  statusRight: { flex: 1 },
  descText: { fontSize: '1rem', fontWeight: '800', color: '#374151' },
  subDescText: { fontSize: '0.75rem', color: '#9CA3AF' },
  contentSection: { padding: '0 25px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  infoCard: { background: 'rgba(255,255,255,0.6)', padding: '1.2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.4)' },
  infoLabel: { fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '4px' },
  infoVal: { fontSize: '1rem', fontWeight: '800' },
  
  fixedBottomArea: { position: 'absolute', bottom: '80px', left: 0, right: 0, padding: '20px 25px 15px', zIndex: 10, background: 'linear-gradient(to top, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)' },
  buttonGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  // 보라색 버튼으로 수정 (디자인 오류 방지)
  subBtn: { width: '100%', padding: '1.1rem 0', background: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '18px', fontSize: '0.95rem', fontWeight: '800', boxShadow: '0 8px 15px rgba(0,0,0,0.1)', cursor: 'pointer' },
  mainBtn: { width: '100%', padding: '1.1rem 0', background: '#DCFCE7', color: '#166534', border: 'none', borderRadius: '18px', fontSize: '0.95rem', fontWeight: '800', boxShadow: '0 8px 15px rgba(0,0,0,0.1)', cursor: 'pointer' },
  
  footer: { height: '80px', background: '#D9D3D0', display: 'flex', borderTopLeftRadius: '25px', borderTopRightRadius: '25px', flexShrink: 0, zIndex: 1000 },
  navItem: (active) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: active ? '#000' : '#717171', cursor: 'pointer' })
};