import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // 라이브러리 가정

// LLM이 생성해준 것으로 가정하는 유저 맞춤형 인사이트
const AI_INSIGHT = {
  summary: "어깨 균형이 지난주 대비 12% 개선되었어요!",
  tip: "오후 3시경 집중력이 떨어질 때 고개가 15도 이상 숙여지는 패턴이 보입니다. 알람을 설정해볼까요?"
};

// 샘플 데이터 (월간 변화 그래프용)
const data = [
  { name: '1주', score: 70 },
  { name: '2주', score: 75 },
  { name: '3주', score: 82 },
  { name: '4주', score: 88 },
];

export default function StatisticsDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/", { replace: true });
    } else {
      try {
      // 위에서 가져온 'token' 변수를 파싱해야 함!
      // 만약 Login에서 'true'라고만 저장했다면 JSON.parse는 생략 가능
      setUser(token === 'true' ? { name: '사용자' } : JSON.parse(token));
    } catch (e) {
      console.error("데이터 파싱 에러:", e);
      navigate("/", { replace: true });
    }
  }
}, [navigate]);

  return (
    <div style={containerStyle}>
      {/* 상단 헤더 */}
      <header style={headerStyle}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: '800' }}>나의 기록 리포트</h1>
      </header>

      <main style={{ padding: '1.5rem' }}>
        {/* 1. LLM 기반 AI 분석 섹션 (가장 중요) */}
        <section style={aiInsightCard}>
          <div style={badgeStyle}>AI 분석</div>
          <h2 style={insightTitle}>{AI_INSIGHT.summary}</h2>
          <p style={insightText}>{AI_INSIGHT.tip}</p>
        </section>

        {/* 2. 월간 성장 그래프 */}
        <section style={chartSection}>
          <h3 style={sectionTitle}>자세 점수 추이</h3>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#7C9E87" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. 활동 달력 (간소화 버전) */}
        <section style={calendarSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={sectionTitle}>스트레칭 달력</h3>
            <span style={{ fontSize: '0.8rem', color: '#7C9E87' }}>이번 달 달성률 85%</span>
          </div>
          <div style={calendarGrid}>
            {/* 달력 UI 구현 로직 (생략) */}
            <div style={placeholderStyle}>[4월 달력 영역 - 잔디 심기 UI]</div>
          </div>
        </section>
      </main>
    </div>
  );
}

// --- Styles (기존 MyPage와 톤앤매너 통일) ---
const containerStyle = { background: '#F9FAFB', minHeight: '100vh', maxWidth: '520px', margin: '0 auto' };
const headerStyle = { padding: '1.2rem', textAlign: 'center', background: '#fff', borderBottom: '1px solid #eee' };
const aiInsightCard = { background: '#2D2520', color: '#fff', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem' };
const badgeStyle = { display: 'inline-block', padding: '4px 8px', background: '#7C9E87', borderRadius: '6px', fontSize: '0.7rem', marginBottom: '10px' };
const insightTitle = { fontSize: '1rem', fontWeight: '800', marginBottom: '8px' };
const insightText = { fontSize: '0.85rem', color: '#D1D5DB', lineHeight: '1.4' };
const chartSection = { background: '#fff', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem' };
const sectionTitle = { fontSize: '0.95rem', fontWeight: '700', marginBottom: '15px' };
const calendarSection = { background: '#fff', borderRadius: '24px', padding: '1.5rem' };
const calendarGrid = { marginTop: '10px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const placeholderStyle = { color: '#9CA3AF', fontSize: '0.85rem' };