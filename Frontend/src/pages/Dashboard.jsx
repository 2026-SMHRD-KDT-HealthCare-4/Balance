import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar 
} from 'recharts';
import axios from 'axios';

export default function StatisticsDashboard() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // 상태 관리
  const [user, setUser] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpened, setIsOpened] = useState(false); 
  const [aiPrescription, setAiPrescription] = useState(null); 
  const [grassData, setGrassData] = useState([]);
  
  // 약관 관련 상태
  const [scrollDone, setScrollDone] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    const userData = localStorage.getItem('user');
    setUser(userData ? JSON.parse(userData) : { name: '사용자' });

    const fetchAllData = async () => {
      try {
        // AI 리포트와 잔디 데이터를 동시에 가져옵니다.
        const [reportRes, grassRes] = await Promise.all([
          axios.get('/api/stats/latest-report', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/stats/grass', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (reportRes.data) {
          const stats = reportRes.data;
          // 1. 방사형 그래프용 전체 데이터 저장
          setWeeklyStats(stats);
          
          // 2. 갈색 상자(AI 처방전) 데이터 매핑
          setAiPrescription({
            summary: stats.report_text,
            tip: stats.prescription_text,
            score: stats.score
          });
        }
        
        // 3. 잔디 데이터 저장
        setGrassData(processGrassData(grassRes.data));

      } catch (e) {
        console.error('데이터 로드 실패:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  const processGrassData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const uniqueDates = new Set(data.map(item => (item.created_at || item.date).split('T')[0]));
    return Array.from(uniqueDates).map(date => ({ date, count: 1 }));
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) setScrollDone(true);
    }
  };

  // 데이터가 없을 때 억지로 80점을 보여주는 것이 아니라, 실데이터를 투영합니다.
  // 통계 데이터를 차트
  const radarData = [
  { subject: '어깨 수평', A: weeklyStats?.balance_shoulder ?? 0 },
  { subject: '목 각도', A: weeklyStats?.balance_neck ?? 0 },
  { subject: '자세 점수', A: weeklyStats?.balance_head ?? 0 },
  { subject: '수행률', A: weeklyStats?.compliance_score ?? 0 },
];

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>리포트 생성 중...</div>;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: '800' }}>나의 기록 리포트</h1>
      </header>

      <main style={{ padding: '1.5rem' }}>
        
        {/* 1. AI 처방전 (갈색 상자 / 약 봉투) */}
        <section 
          style={isOpened ? aiInsightCard : closedEnvelopeStyle} 
          onClick={() => !isOpened && setIsOpened(true)}
        >
          {!isOpened ? (
            <div style={envelopeContent}>
              <span style={pillIconStyle}>💊</span>
              <h2 style={insightTitle}>오늘의 자세 처방전이 도착했습니다</h2>
              <p style={insightText}>클릭하여 약 봉투를 열어보세요</p>
            </div>
          ) : (
            <div className="fade-in">
              <div style={badgeStyle}>AI 분석 처방전</div>
              <h2 style={insightTitle}>
                {aiPrescription?.summary || "자세 데이터 분석 중..."}
              </h2>
              <p style={insightText}>
                {aiPrescription?.tip || "더 정확한 분석을 위해 측정을 계속해주세요."}
              </p>
              <button style={actionButtonStyle} onClick={(e) => { e.stopPropagation(); navigate('/stretch'); }}>
                추천 스트레칭 시작하기
              </button>
            </div>
          )}
        </section>
        
        {/* 2. 주간 자세 분석 Chart */}
        <section style={whiteCardStyle}>
          <h3 style={sectionTitle}>종합 자세 균형</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                {/* 데이터가 로딩 중이면 투명도를 낮추거나 로딩 표시 */}
                <Radar 
                  name="나의 자세" 
                  dataKey="A" 
                  stroke="#7C9E87" 
                  fill="#7C9E87" 
                  fillOpacity={loading ? 0.1 : 0.5} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. 스트레칭 잔디 */}
        <section style={whiteCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ ...sectionTitle, marginBottom: 0 }}>4월의 스트레칭</h3>
            <span style={{ fontSize: '0.8rem', color: '#7C9E87', fontWeight: 'bold' }}>{grassData.length}일 성공 🌿</span>
          </div>
          <div style={calendarGridStyle}>
            {Array.from({ length: 3 }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-04-${day < 10 ? '0' + day : day}`;
              const isDone = grassData.some(d => d.date === dateStr);
              return (
                <div key={day} style={{ ...dayBoxStyle, background: isDone ? '#7C9E87' : '#F3F4F6', color: isDone ? '#fff' : '#D1D5DB', border: isDone ? 'none' : '1px solid #E5E7EB' }}>
                  {day}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

// --- Styles ---
const containerStyle = { background: '#F9FAFB', minHeight: '100vh', maxWidth: '520px', margin: '0 auto', fontFamily: 'Pretendard, sans-serif' };
const headerStyle = { padding: '1.2rem', textAlign: 'center', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 10 };
const aiInsightCard = { background: '#2D2520', color: '#fff', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem' };
const closedEnvelopeStyle = { ...aiInsightCard, background: '#7C9E87', cursor: 'pointer', textAlign: 'center' };
const envelopeContent = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' };
const pillIconStyle = { fontSize: '2.5rem' };
const badgeStyle = { display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.7rem', marginBottom: '15px' };
const insightTitle = { fontSize: '1.1rem', fontWeight: '800', marginBottom: '10px' };
const insightText = { fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.5', marginBottom: '20px' };
const actionButtonStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#fff', color: '#2D2520', fontWeight: '700', cursor: 'pointer' };
const whiteCardStyle = { background: '#fff', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const sectionTitle = { fontSize: '0.95rem', fontWeight: '700', marginBottom: '15px', color: '#374151' };
const calendarGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' };
const dayBoxStyle = { aspectRatio: '1/1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', transition: 'all 0.3s ease' };
const termsBoxStyle = { height: '100px', overflowY: 'auto', padding: '10px', background: '#F9F9F9', borderRadius: '8px', fontSize: '0.75rem', color: '#666', marginBottom: '10px', border: '1px solid #EEE' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151' };