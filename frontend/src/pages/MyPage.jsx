import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { TbStretching } from 'react-icons/tb';
import { FcStatistics } from 'react-icons/fc';
import { VscGear } from 'react-icons/vsc';

const GREETINGS = [
  "좋은 아침이에요! 기지개 한 번 켜고 시작할까요?",
  "오늘도 바른 자세와 함께 활기찬 하루 보내세요!",
  "어제보다 더 곧은 허리를 위하여! 화이팅!",
  "자세가 곧아야 집중력도 올라가는 법!"
];

const CONFIG = {
  RED: { label: "위험", color: "#EF4444", desc: "자세가 많이 무너졌어요", img: "../images/bad.png" },
  YELLOW: { label: "주의", color: "#F59E0B", desc: "조금씩 좋아지고 있어요", img: "../images/normal.png" },
  GREEN: { label: "양호", color: "#10B981", desc: "바른 자세 유지 중!", img: "../images/good.png" },
};

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [score] = useState(32);

  const current = useMemo(() => {
    if (score < 40) return CONFIG.RED;
    if (score < 70) return CONFIG.YELLOW;
    return CONFIG.GREEN;
  }, [score]);

  return (
    <div style={s.layout}>
      {/* 1. 상단 고정 헤더 */}
      <header style={s.fixedHeader}>
        <h1 style={s.logo}>Re:balance</h1>
        <button onClick={() => navigate('/')} style={s.logoutBtn}>로그아웃</button>
      </header>

      {/* 2. 독립 스크롤 영역 (중간만 움직임) */}
      <div style={s.scrollBox}>
        {/* LLM 인사말 */}
        <section style={s.llmSection}>
          <div style={s.aiBadge}>AI COACH</div>
          <h2 style={s.mainGreeting}>안녕하세요!<br/>오늘의 자세 분석입니다.</h2>
          <p style={s.llmText}>
            오후 3시경 거북목 각도가 평소보다 15도 깊어졌어요.<br/>
            현재 상태는 <b>{current.label}</b>입니다.
          </p>
        </section>

        {/* 캐릭터 섹션 */}
        <section style={s.heroSection}>
          <div style={{ ...s.characterHalo, backgroundColor: current.color }} />
          <div style={s.imageWrapper}>
            <img src={current.img} alt="character" style={s.charImg} />
          </div>

          {/* 점수 및 메시지 (박스 제거, 심플하게) */}
          <div style={s.statusInfoRow}>
            <div style={s.statusLeft}>
              <span style={{ ...s.statusLabel, color: current.color }}>{current.label}</span>
              <div style={s.scoreText}>{score}<small style={{fontSize: '1rem'}}>점</small></div>
            </div>
            <div style={s.statusRight}>
              <p style={s.descText}>자세가 많이 무너졌어요</p>
              <p style={s.subDescText}>실시간 센서 데이터 분석 기준</p>
            </div>
          </div>
        </section>

        {/* 정보 카드 */}
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
          <div style={{ height: '50px' }} />
        </section>
      </div>

      {/* 3. 하단 고정 영역 (버튼 + 네비게이션 합체) */}
      <div style={s.fixedBottomArea}>
        <div style={s.buttonContainer}>
          <button onClick={() => navigate('/camera')} style={s.cameraBtn}>
            지금 자세 측정 시작하기
          </button>
        </div>
        
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
    </div>
  );
}

const s = {
  // 전체 레이아웃 고정
  layout: { position: 'fixed', inset: 0, background: '#FFF', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column' },
  
  // 헤더 고정
  fixedHeader: { height: '70px', padding: '0 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF', zIndex: 1000 },
  logo: { fontSize: '1.2rem', fontWeight: '900', color: '#7C9E87' },
  logoutBtn: { padding: '8px 12px', background: '#F9FAFB', border: '1px solid #EEE', borderRadius: '10px', fontSize: '0.7rem', color: '#999' },

  // 🔥 핵심: 중간 영역만 스크롤 (이게 뻑뻑함을 잡는 열쇠)
  scrollBox: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '20px' },

  llmSection: { padding: '20px 25px' },
  aiBadge: { display: 'inline-block', padding: '4px 8px', background: '#F0F4F1', color: '#7C9E87', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', marginBottom: '10px' },
  mainGreeting: { fontSize: '1.5rem', fontWeight: '800', color: '#1F2937', lineHeight: '1.3', margin: '0 0 10px 0' },
  llmText: { fontSize: '0.95rem', color: '#6B7280', lineHeight: '1.6', margin: 0 },

  heroSection: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 25px', marginBottom: '30px' },
  characterHalo: { position: 'absolute', top: '20%', width: '320px', height: '320px', borderRadius: '50%', filter: 'blur(70px)', opacity: 0.12, zIndex: 0 },
  imageWrapper: { zIndex: 1, height: '300px', display: 'flex', alignItems: 'center', marginBottom: '20px' },
  charImg: { height: '100%', objectFit: 'contain' },

  statusInfoRow: { width: '100%', display: 'flex', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #F3F4F6' },
  statusLeft: { flex: '0 0 90px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #F3F4F6', marginRight: '20px' },
  statusLabel: { fontSize: '0.85rem', fontWeight: '900', marginBottom: '4px' },
  scoreText: { fontSize: '2.5rem', fontWeight: '900', color: '#1F2937' },
  statusRight: { flex: 1 },
  descText: { fontSize: '1.1rem', fontWeight: '800', color: '#374151', margin: '0 0 4px 0' },
  subDescText: { fontSize: '0.8rem', color: '#9CA3AF' },

  contentSection: { padding: '0 25px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  infoCard: { background: '#F9FAFB', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  infoLabel: { fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '6px' },
  infoVal: { fontSize: '1.1rem', fontWeight: '800' },

  // 🔥 하단 완전 고정 (절대 숨지 않음)
  fixedBottomArea: { position: 'relative', background: '#FFF' },
  buttonContainer: { padding: '0 25px 20px 25px' },
  cameraBtn: { width: '100%', padding: '1.3rem', background: '#1F2937', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '800' },
  footer: { height: '85px', background: '#D9D3D0', display: 'flex', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' },
  navItem: (active) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: active ? '#000' : '#717171' })
};