import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import WebcamView from '../components/WebcamView';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { useNeckDiagnostic } from '../hooks/useNeckDiagnostic';
import { savePoseLog } from '../api/poseApi';

// 스타일 변수
const containerStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', zIndex: 2100 };
const backBtnStyle = { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' };
const titleStyle = { fontSize: '1.1rem', fontWeight: '800', margin: 0 };
const contentAreaStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' };
const subTitleLabelStyle = { marginBottom: '20px', fontSize: '1rem', fontWeight: '600', color: '#333' };
const videoContainerStyle = { position: 'relative', width: '100%', maxWidth: '640px', aspectRatio: '4/3', margin: '0 auto', overflow: 'hidden', background: '#000' };
const timerOverlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '80px', color: '#fff', fontWeight: 'bold' };
const footerStyle = { padding: '30px 20px', display: 'flex', justifyContent: 'center', backgroundColor: '#fff' };
const buttonStyle = { width: '100%', maxWidth: '350px', padding: '18px', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '16px', cursor: 'pointer' };

const SideCapturePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const videoRef = useRef(null);
  const isSavingRef = useRef(false);
  
  const [timer, setTimer] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const diagnostic = useNeckDiagnostic();
  const runAnalysis = diagnostic?.runAnalysis || diagnostic; 

  // 🌟 [추가] 측면 거북목 각도를 점수로 환산하는 로직
  const calculateSideScore = (angle) => {
    let score = 97; // 최고점 제한 (100점 방지)
    
    // 거북목 각도 기준 (보통 15~20도 이상부터 주의)
    if (angle <= 15) {
      score = 97 - (angle * 0.5); // 정상 범위 (81~97)
    } else if (angle <= 30) {
      score = 85 - ((angle - 15) * 1.5); // 주의 범위 (61~80)
    } else {
      score = 60 - ((angle - 30) * 2); // 위험 범위 (60 이하)
    }

    return Math.max(10, Math.floor(score));
  };

  useEffect(() => {
    initializeCapturePose(async (results) => {
      if (!results || !results.poseLandmarks || isSavingRef.current) return;

      const analysisResult = typeof runAnalysis === 'function' ? runAnalysis(results.poseLandmarks) : null;
      
      if (analysisResult) {
        isSavingRef.current = true; 
        
        // 🌟 [추가] 점수 환산 적용
        const calculatedScore = calculateSideScore(analysisResult.angle);
        
        const token = localStorage.getItem('token');
        const poseData = {
          angle: analysisResult.angle,
          score: calculatedScore, // 환산된 점수 포함
          status: analysisResult.status,
          type: 'side',
          date: new Date().toISOString()
        };

        try {
          if (token) {
            await savePoseLog(poseData);
          } else {
            localStorage.setItem('temp_side_pose', JSON.stringify(poseData));
          }
          
          if (from === 'mypage') {
            alert("측면 자세가 기록되었습니다!");
            navigate('/mypage', { replace: true });
          } else {
            // 결과 페이지로 이동 시 점수 데이터 함께 전달
            navigate('/diagnosis', { 
              state: { result: { ...analysisResult, score: calculatedScore }, type: 'side' }, 
              replace: true 
            });
          }
        } catch (e) {
          console.error("저장 실패", e);
          isSavingRef.current = false;
          setIsMeasuring(false);
        }
      }
    });
  }, [runAnalysis, navigate, from]); 

  const handleStartCapture = () => {
    setIsMeasuring(true);
    setTimer(5);
  };

  useEffect(() => {
    if (timer === null) return;
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    } else {
      if (videoRef.current) sendToCapturePose(videoRef.current);
      setTimer(null);
      setIsMeasuring(false);
    }
  }, [timer]);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <button onClick={() => navigate(-1)} style={backBtnStyle}><FaIcons.FaChevronLeft /></button>
        <h1 style={titleStyle}>측면 측정</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      <div style={contentAreaStyle}>
        <p style={subTitleLabelStyle}>정확한 측정을 위해 측면으로 서주세요.</p>
        <div style={videoContainerStyle}>
          <WebcamView videoRef={videoRef} />
          {/* 🌟 윤곽선(SVG) 제거됨 */}
          {timer !== null && <div style={timerOverlayStyle}>{timer > 0 ? timer : "📸"}</div>}
        </div>
      </div>

      <div style={footerStyle}>
        <button 
          onClick={handleStartCapture} 
          style={{
            ...buttonStyle, 
            backgroundColor: isMeasuring ? '#ccc' : '#7C9E87' // Re:balance 브랜드 컬러 적용
          }} 
          disabled={isMeasuring}
        >
          {isMeasuring ? "자세 고정 중..." : "측정 시작"}
        </button>
      </div>
    </div>
  );
};

export default SideCapturePage;