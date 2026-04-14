import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import './Diagnosis.css';

export default function Diagnosis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [measureData, setMeasureData] = useState(null);
  const [isFrontType, setIsFrontType] = useState(false);

  useEffect(() => {
    // 측정 결과가 location.state를 통해 넘어왔는지 확인
    if (location.state?.result) {
      setMeasureData(location.state.result);
      setIsFrontType(location.state.type === 'front');
    } else {
      // 직접 주소 입력 등으로 접근 시 방어 로직
      navigate('/front-capture', { replace: true });
    }
  }, [location, navigate]);

  // 상태에 따른 색상 정의 (정상/주의/위험)
  const getStatusColor = () => {
    if (measureData?.status === '정상') return '#4ADE80';
    if (measureData?.status === '주의') return '#FACC15';
    return '#F87171'; 
  };

  const activeColor = getStatusColor();

  return (
    <div className="diagnosis-page" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <div className="app-container">
        <header className="app-header" style={headerStyle}>
          <button onClick={() => navigate('/')} className="back-btn" style={backBtnStyle}>
            <FaIcons.FaChevronLeft />
          </button>
        </header>

        <main style={{ padding: '20px' }}>
          <div className="result-card" style={cardStyle}>
            {/* 결과 아이콘 */}
            <div style={{ ...statusIconStyle, backgroundColor: activeColor }}>✔</div>
            
            {/* 결과 텍스트 */}
            <h2 style={{ color: activeColor, fontSize: '1.6rem', fontWeight: '700', marginBottom: '12px' }}>
              {isFrontType ? '어깨 수평' : '거북목'} '{measureData?.status}' 단계
            </h2>
            
            <p style={{ fontSize: '1.2rem', color: '#1F2937', marginBottom: '24px' }}>
              {isFrontType ? '기울기' : '목 각도'}: <span style={{ fontWeight: '800' }}>{measureData?.angle}°</span>
            </p>

            <div style={commentBoxStyle}>
              {isFrontType 
                ? (measureData?.status === '정상' ? "어깨 수평이 아주 안정적입니다." : "어깨 비대칭이 의심됩니다. 꾸준한 스트레칭이 필요해요.")
                : (measureData?.comment || "자세 교정과 스트레칭이 필요합니다.")
              }
            </div>
          </div>

          {/* 하단 버튼 섹션: 여기서의 이동이 Login 컴포넌트의 syncTempPoseData를 트리거함 */}
          <div style={buttonSectionStyle}>
            {isFrontType ? (
              <button 
                className="main-btn" 
                style={primaryBtnStyle}
                onClick={() => navigate('/side-capture')}
              >
                측면 측정하러 가기
              </button>
            ) : (
              <button 
                className="main-btn" 
                style={primaryBtnStyle}
                onClick={() => navigate('/login')}
              >
                결과 저장하고 관리 시작
              </button>
            )}
            
            <button onClick={() => navigate('/')} style={homeBtnStyle}>
              홈으로 이동
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- 스타일 객체 ---
const headerStyle = { backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', padding: '15px 20px', height: '60px' };
const backBtnStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '32px', padding: '40px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', textAlign: 'center', marginTop: '20px' };
const statusIconStyle = { width: '60px', height: '60px', margin: '0 auto 24px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', color: '#fff', border: '3px solid #000' };
const commentBoxStyle = { backgroundColor: '#F3F4F6', padding: '18px', borderRadius: '16px', fontSize: '1rem', color: '#4B5563', lineHeight: '1.6', textAlign: 'center' };
const buttonSectionStyle = { marginTop: '50px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' };
const primaryBtnStyle = { backgroundColor: '#84A59D', borderRadius: '20px', width: '100%', maxWidth: '340px', padding: '18px', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' };
const homeBtnStyle = { background: 'none', color: '#9CA3AF', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: '600', marginTop: '8px' };