import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaHome } from 'react-icons/fa';
import { TbStretching } from 'react-icons/tb';

const STRETCH_GOAL = 2;

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
  subBtn: { width: '100%', padding: '1.1rem 0', background: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '18px', fontSize: '0.95rem', fontWeight: '800', boxShadow: '0 8px 15px rgba(0,0,0,0.1)', cursor: 'pointer' },
  mainBtn: { width: '100%', padding: '1.1rem 0', background: '#DCFCE7', color: '#166534', border: 'none', borderRadius: '18px', fontSize: '0.95rem', fontWeight: '800', boxShadow: '0 8px 15px rgba(0,0,0,0.1)', cursor: 'pointer' },
  footer: { height: '80px', background: '#D9D3D0', display: 'flex', borderTopLeftRadius: '25px', borderTopRightRadius: '25px', flexShrink: 0, zIndex: 1000 },
  navItem: (active) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: active ? '#000' : '#717171', cursor: 'pointer' })
};

const CONFIG = {
  RED:    { label: "위험", color: "#EF4444", bgColor: "#FEF2F2", desc: "자세가 심각하게 무너졌어요",    img: "/images/bad_transparent.png",    advice: "지금 즉시 스트레칭을 시작하세요!", animation: "shake 0.5s infinite" },
  YELLOW: { label: "주의", color: "#F59E0B", bgColor: "#FFFBEB", desc: "거북목 증상이 의심됩니다",      img: "/images/normal_transparent.png", advice: "어깨를 펴고 고개를 들어주세요.",   animation: "bounce 2s infinite" },
  GREEN:  { label: "정상", color: "#7C9E87", bgColor: "#F0FDF4", desc: "바른 자세를 유지하고 있습니다", img: "/images/good_transparent.png",   advice: "아주 훌륭해요! 지금처럼 유지하세요.", animation: "none" },
};

// ✅ 로컬 temp 데이터에서 점수를 계산하는 헬퍼 함수
const getLocalScore = () => {
  try {
    const rawFront = localStorage.getItem('temp_front_pose')
                  || sessionStorage.getItem('temp_front_pose');
    const rawSide  = localStorage.getItem('temp_side_pose')
                  || sessionStorage.getItem('temp_side_pose');
    const tempFront = rawFront ? JSON.parse(rawFront) : null;
    const tempSide  = rawSide  ? JSON.parse(rawSide)  : null;

    if (!tempFront && !tempSide) return null;

    const frontScore = tempFront?.score != null ? Number(tempFront.score) : null;
    const sideScore  = tempSide?.score  != null ? Number(tempSide.score)  : null;

    let finalScore;
    if (frontScore !== null && sideScore !== null) {
      finalScore = Math.floor((frontScore + sideScore) / 2);
    } else {
      finalScore = frontScore ?? sideScore ?? 0;
    }
    return Math.min(Math.floor(finalScore), 97);
  } catch {
    return null;
  }
};

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState({ score: 0, neckAge: 0, stretchCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const justCompleted = localStorage.getItem('stretch_just_completed'); // 추가
      if (justCompleted) localStorage.removeItem('stretch_just_completed'); // 추가

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (token) {
          // ✅ 로그인 상태: 서버 조회 먼저 시도
          try {
            const response = await axios.get('http://localhost:3000/api/posture/latest', {
              headers: { Authorization: `Bearer ${token}` }
            });

            const serverScore   = response.data?.posture_score ?? 0;
            const serverNeckAge = response.data?.neck_age      ?? 25;
            const serverStretch = response.data?.stretch_count ?? 0;

            // ✅ 서버 score가 0이면 로컬 temp 데이터로 폴백
            if (serverScore === 0) {
              const localScore = getLocalScore();
              if (localScore !== null && localScore > 0) {
                setData({
                  score: localScore,
                  neckAge: serverNeckAge !== 25 ? serverNeckAge : 25 + Math.round((97 - localScore) / 97 * 20),
                  stretchCount: serverStretch  // ✅ 서버 스트레칭 횟수는 유지
                });
                return;
              }
            }

            setData({
              score:        Math.min(serverScore, 97),
              neckAge:      serverNeckAge,
              stretchCount: serverStretch
            });

          } catch (err) {
            console.error("서버 데이터 조회 실패:", err);

            // ✅ 서버 요청 자체 실패 시에도 로컬 데이터로 폴백
            const localScore = getLocalScore();
            if (localScore !== null && localScore > 0) {
              setData({ score: localScore, neckAge: 25, stretchCount: 0 });
            } else {
              setData({ score: 0, neckAge: 25, stretchCount: 0 });
            }
          }

        } else {
          // ✅ 비로그인 상태: localStorage temp 데이터 사용
          const localScore = getLocalScore();
          if (localScore !== null && localScore > 0) {
            const rawFront = localStorage.getItem('temp_front_pose');
            const rawSide  = localStorage.getItem('temp_side_pose');
            const tempFront = rawFront ? JSON.parse(rawFront) : null;
            const tempSide  = rawSide  ? JSON.parse(rawSide)  : null;
            const hasData = tempFront || tempSide;

            setData({
              score:        localScore,
              // 비로그인은 실제 나이 모르므로 점수 기반 추정
              neckAge:      hasData ? 25 + Math.floor((97 - localScore) / 2) : 25,
              stretchCount: 0
            });
          } else {
            setData({ score: 0, neckAge: 25, stretchCount: 0 });
          }
        }

      } catch (e) {
        console.error(e);
        setData({ score: 0, neckAge: 25, stretchCount: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location]);

  const isGoalReached = useMemo(() => data.stretchCount >= STRETCH_GOAL, [data.stretchCount]);

  const current = useMemo(() => {
    let res;
    if (data.score <= 60)      res = { ...CONFIG.RED };
    else if (data.score <= 80) res = { ...CONFIG.YELLOW };
    else                       res = { ...CONFIG.GREEN };

    if (isGoalReached) {
      res.advice = "오늘의 스트레칭 완료! 목 나이가 2살 젊어졌어요! 🎉";
    }
    return res;
  }, [data.score, isGoalReached]);

  if (loading) return (
    <div style={{ ...s.layout, justifyContent: 'center', alignItems: 'center' }}>
      분석 중...
    </div>
  );

  return (
    <div style={{ ...s.layout, background: current.bgColor }}>
      <header style={{ ...s.fixedHeader, background: current.bgColor }}>
        <h1 style={s.logo}>Re:balance</h1>
        <button
          onClick={() => { localStorage.clear(); sessionStorage.clear(); navigate('/'); }}
          style={s.logoutBtn}
        >
          로그아웃
        </button>
      </header>

      <div style={s.scrollBox}>
        <section style={s.llmSection}>
          <div style={{ ...s.aiBadge, color: current.color }}>AI COACH</div>
          <h2 style={s.mainGreeting}>{current.advice}</h2>
          <p style={s.llmText}>
            현재 상태는 <b style={{ color: current.color }}>{current.label}</b> 단계입니다.
          </p>
        </section>

        {data.score <= 60 && !isGoalReached && (
          <div style={s.emergencyBanner}>
            <span style={{ flex: 1 }}>⚠️ {current.label} 자세 감지!</span>
            <button onClick={() => navigate('/stretching')} style={s.emergencyBtn}>운동하기</button>
          </div>
        )}

        <section style={s.heroSection}>
          <div style={{ ...s.characterHalo, backgroundColor: current.color }} />
          <div style={s.imageWrapper}>
            <img
              src={current.img}
              alt="char"
              style={{ ...s.charImg, animation: current.animation }}
            />
          </div>
          <div style={s.statusInfoRow}>
            <div style={s.statusLeft}>
              <span style={{ ...s.statusLabel, color: current.color }}>{current.label}</span>
              <div style={s.scoreText}>
                {data.score}<small style={{ fontSize: '1rem' }}>점</small>
              </div>
            </div>
            <div style={s.statusRight}>
              <p style={s.descText}>{current.desc}</p>
              <p style={s.subDescText}>실시간 센서 분석</p>
            </div>
          </div>
        </section>

        <section style={s.contentSection}>
          <div style={s.infoGrid}>
            <div style={s.infoCard}>
              <span style={s.infoLabel}>예상 목 나이</span>
              <span style={{ ...s.infoVal, color: isGoalReached ? '#4F46E5' : '#1F2937' }}>
                {isGoalReached ? data.neckAge - 2 : data.neckAge}세
              </span>
            </div>
            <div style={s.infoCard}>
              <span style={s.infoLabel}>스트레칭</span>
              <span style={{ ...s.infoVal, color: isGoalReached ? '#4F46E5' : '#7C9E87' }}>
                {data.stretchCount} / {STRETCH_GOAL}회
              </span>
            </div>
          </div>
          <div style={{ height: '180px' }} />
        </section>
      </div>

      <div style={s.fixedBottomArea}>
        <div style={s.buttonGrid}>
          <button onClick={() => navigate('/team-monitor')} style={s.subBtn}>모니터링</button>
          <button onClick={() => navigate('/initialsetuppage')} style={s.mainBtn}>측정하기</button>
        </div>
      </div>

      <footer style={s.footer}>
        {[
          { id: 'home',    icon: <FaHome />,       path: '/mypage' },
          { id: 'stretch', icon: <TbStretching />, path: '/stretching' }
        ].map(menu => (
          <div
            key={menu.id}
            onClick={() => navigate(menu.path)}
            style={s.navItem(location.pathname === menu.path)}
          >
            {menu.icon}
          </div>
        ))}
      </footer>
    </div>
  );
}