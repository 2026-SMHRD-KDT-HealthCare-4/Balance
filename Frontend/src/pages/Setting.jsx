import React, { useState } from 'react';

export default function Settings() {
  const [isAlarmOn, setIsAlarmOn] = useState(true);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: '800' }}>설정</h1>
      </header>

      <main style={{ padding: '1rem' }}>
        {/* 알림 설정 섹션 */}
        <section style={sectionStyle}>
          <div style={itemStyle}>
            <span>거북목 알림 설정</span>
            <input 
              type="checkbox" 
              checked={isAlarmOn} 
              onChange={() => setIsAlarmOn(!isAlarmOn)} 
            />
          </div>
        </section>

        {/* 고객 지원 섹션 */}
        <section style={sectionStyle}>
          <div style={itemStyle} onClick={() => alert('문의 페이지로 이동')}>
            <span>문의 / 피드백 보내기</span>
            <span style={arrowStyle}>&gt;</span>
          </div>
        </section>

        {/* 정보 섹션 */}
        <section style={sectionStyle}>
          <div style={itemStyle}><span>일반</span> <span style={arrowStyle}>&gt;</span></div>
          <div style={itemStyle}><span>이용약관</span> <span style={arrowStyle}>&gt;</span></div>
          <div style={itemStyle}><span>개인정보 처리방침</span> <span style={arrowStyle}>&gt;</span></div>
        </section>

        {/* 탈퇴 영역 */}
        <footer style={deleteAccountArea}>
          <p style={deleteTextStyle}>
            Re:balance를 탈퇴하려면 <span style={linkStyle} onClick={() => confirm('정말 탈퇴하시겠습니까?')}>여기를 클릭하세요</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

// --- 스타일링 (Re:balance 톤앤매너) ---
const containerStyle = { background: '#F9FAFB', minHeight: '100vh' };
const headerStyle = { padding: '1.5rem', background: '#fff', borderBottom: '1px solid #eee' };
const sectionStyle = { background: '#fff', borderRadius: '15px', marginBottom: '1rem', overflow: 'hidden' };
const itemStyle = { 
  padding: '1.2rem', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  borderBottom: '1px solid #F3F4F6',
  cursor: 'pointer'
};
const arrowStyle = { color: '#9CA3AF', fontSize: '0.9rem' };
const deleteAccountArea = { marginTop: '3rem', textAlign: 'center', padding: '1rem' };
const deleteTextStyle = { fontSize: '0.8rem', color: '#9CA3AF' };
const linkStyle = { textDecoration: 'underline', cursor: 'pointer', color: '#6B7280' };