import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import WebcamView from '../components/WebcamView';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { useShoulderDiagnostic } from '../hooks/useShoulderDiagnostic';
import { savePoseLog } from '../api/poseApi';

const FrontCapturePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const videoRef = useRef(null);
  const isSavingRef = useRef(false);
  
  const [timer, setTimer] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // 정면 어깨 진단 훅 사용
  const { runAnalysis } = useShoulderDiagnostic();

  useEffect(() => {
    initializeCapturePose(async (results) => {
      if (!results || !results.poseLandmarks || isSavingRef.current) return;

      const analysisResult = runAnalysis(results.poseLandmarks);
      
      if (analysisResult) {
        isSavingRef.current = true; 
        try {
          await savePoseLog({
            angle: analysisResult.angle,
            status: analysisResult.status,
            type: 'front'
          });
        } catch (e) {
          console.error("서버 저장 실패");
        }

        navigate('/diagnosis', { 
          state: { result: analysisResult, type: 'front' },
          replace: true 
        });
      }
    });
  }, [runAnalysis, navigate]);

  const handleBackWithConfirm = () => {
    const leave = window.confirm("지금 나가면 측정 결과가 저장되지 않습니다. 그래도 나가시겠습니까?");
    if (leave) navigate(-1);
  };

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
      if (videoRef.current && videoRef.current.readyState >= 2) {
        sendToCapturePose(videoRef.current);
      }
      setTimer(null);
      setIsMeasuring(false);
    }
  }, [timer]);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <button onClick={handleBackWithConfirm} style={backBtnStyle}>
          <FaIcons.FaChevronLeft />
        </button>
        <h1 style={titleStyle}>정면 측정</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      <div style={contentAreaStyle}>
        <p style={subTitleLabelStyle}>어깨 수평이 보이도록 정면으로 서주세요.</p>
        
        <div style={videoContainerStyle}>
          <WebcamView videoRef={videoRef} />
          {/* 정면은 가이드 SVG를 제외하고 타이머만 표시 */}
          {timer !== null && (
            <div style={timerOverlayStyle}>{timer > 0 ? timer : "📸"}</div>
          )}
        </div>
      </div>

      <div style={footerStyle}>
        <button 
          onClick={handleStartCapture} 
          style={{...buttonStyle, backgroundColor: isMeasuring ? '#ccc' : '#4A90E2'}}
          disabled={isMeasuring}
        >
          {isMeasuring ? "자세 고정 중..." : "측정 시작"}
        </button>
      </div>
    </div>
  );
};

// --- 스타일 객체 (SideCapturePage와 100% 동일하게 유지) ---
const containerStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', zIndex: 2100 };
const titleStyle = { fontSize: '1.1rem', fontWeight: '800', margin: 0 };
const backBtnStyle = { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' };

const contentAreaStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' };
const subTitleLabelStyle = { marginBottom: '20px', fontSize: '1rem', fontWeight: '600', color: '#333' };

// 여기서 maxWidth와 aspectRatio를 똑같이 맞춰 영상 크기를 동일하게 만듭니다.
const videoContainerStyle = { position: 'relative', width: '100%', maxWidth: '640px', aspectRatio: '4/3', margin: '0 auto', overflow: 'hidden', background: '#000' };

const timerOverlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '80px', color: '#fff', fontWeight: 'bold' };
const footerStyle = { padding: '30px 20px', display: 'flex', justifyContent: 'center', backgroundColor: '#fff' };
const buttonStyle = { width: '100%', maxWidth: '350px', padding: '18px', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '16px', cursor: 'pointer' };

export default FrontCapturePage;