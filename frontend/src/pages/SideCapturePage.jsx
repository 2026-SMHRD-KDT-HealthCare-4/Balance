import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import WebcamView from '../components/WebcamView';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { useNeckDiagnostic } from '../hooks/useNeckDiagnostic';
import { savePoseLog } from '../api/poseApi';

const SideCapturePage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [timer, setTimer] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { runAnalysis } = useNeckDiagnostic();

  

  // SideCapturePage.jsx 내의 useEffect 수정
useEffect(() => {
  initializeCapturePose(async (results) => {
    // 팩트: 결과가 없으면 즉시 종료
    if (!results || !results.poseLandmarks) return;

    // 분석 실행
    const analysisResult = runAnalysis(results.poseLandmarks);
    
    // 분석 결과가 존재할 때만 '딱 한 번' 실행되도록 함
    if (analysisResult && !isSaving) {
      console.log("📸 데이터 포착 성공:", analysisResult);
      
      setIsSaving(true); // 중복 실행 방지
      
      try {
        // 서버 저장 (실패해도 일단 이동은 하게 처리)
        await savePoseLog({
          angle: analysisResult.angle,
          status: analysisResult.status,
        });
      } catch (e) {
        console.error("서버 저장 실패, 하지만 결과 페이지로 이동합니다.");
      }

      // 결과 데이터를 들고 Diagnosis로 즉시 이동
      navigate('/diagnosis', { 
        state: { result: analysisResult },
        replace: true 
      });
    }
  });
}, [runAnalysis, isSaving, navigate]); // isMeasuring 의존성 제거


  // 뒤로가기 버튼 핸들러 (알림창 추가)
  const handleBackWithConfirm = () => {
    const leave = window.confirm("지금 나가면 측정 결과가 저장되지 않습니다. 그래도 나가시겠습니까?");
    if (leave) navigate('/');
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
        <h1 style={titleStyle}>측면 측정</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      <div style={contentAreaStyle}>
        <p style={subTitleStyle}>실루엣에 맞춰 측면으로 서주세요.</p>
        
        {/* 1. 비디오와 가이드라인을 묶는 고정 비율 컨테이너 */}
        <div style={videoContainerStyle}>
          
          {/* 실제 비디오 (WebcamView 내부 video에 objectFit: cover 적용 권장) */}
          <WebcamView videoRef={videoRef} />
          
          {/* 2. 가이드라인을 비디오와 완전히 겹침 */}
          <svg style={svgOverlayStyle} viewBox="0 0 640 480" preserveAspectRatio="xMidYMid meet">
            <path
              d="M320,30 C210,30 210,180 210,180 C130,210 120,320 120,400 C120,470 200,480 320,480 C440,480 520,470 520,400 C520,320 510,210 430,180 C430,180 430,30 320,30 Z"
              fill="none" 
              stroke="#e67e22" 
              strokeWidth="6" 
              strokeDasharray="15,10" 
              style={{ opacity: 0.6 }}
            />
          </svg>

          {timer !== null && (
            <div style={timerOverlayStyle}>{timer > 0 ? timer : "📸"}</div>
          )}
        </div>
      </div>

      <div style={footerStyle}>
        <button onClick={handleStartCapture} style={buttonStyle}>
          {isMeasuring ? "자세 고정 중..." : "측정 시작"}
        </button>
      </div>
    </div>
  );
};

// --- 스타일 개선: 중앙 정렬 및 가독성 최적화 ---

const videoContainerStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '800px', // 전체 박스 크기 조절 (카메라 너무 커지지 않게)
  aspectRatio: '4 / 3',
  backgroundColor: '#fff',
  borderRadius: '24px',
  display: 'flex', // 자식(cameraWrapper)을 중앙에 배치
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  margin: '0 auto'
};

const containerStyle = {
  position: 'fixed', 
  top: 0, 
  left: 0, 
  width: '100vw', 
  height: '100vh',
  backgroundColor: '#fff', // 전체 배경은 깔끔하게 화이트
  zIndex: 2000, 
  display: 'flex', 
  flexDirection: 'column'
};

const headerStyle = {
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '15px 20px',
  zIndex: 2100 // 카메라보다 위에 위치
};



const backBtnStyle = { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' };
const titleStyle = { fontSize: '1.1rem', fontWeight: '800', margin: 0 };
const subTitleStyle = { 
  position: 'absolute',
  top: '20px',
  textAlign: 'center', 
  color: 'black', // 카메라 위에서 잘 보이도록 화이트
  fontSize: '1rem', 
  fontWeight: '600',
  textShadow: '0px 2px 4px rgba(0,0,0,0.5)', // 가독성을 위한 그림자
  zIndex: 10
};

const contentAreaStyle = {
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'center', 
  alignItems: 'center',
  position: 'relative', // 가이드라인과 텍스트 배치를 위해
  overflow: 'hidden'
};

const cameraWrapperStyle = {
  position: 'relative',
  width: '100%', // 부모(videoContainer) 안에서 꽉 차게
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const svgOverlayStyle = {
  position: 'absolute',
  top: 50,
  left: 100,
  width: '80%', // 이제 흰 배경이 아니라 비디오 박스의 100%입니다.
  height: 'auto',
  pointerEvents: 'none',
  zIndex: 10
};

const timerOverlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '80px', color: '#fff', fontWeight: 'bold' };
const footerStyle = { 
  padding: '30px 20px', 
  display: 'flex', 
  justifyContent: 'center',
  backgroundColor: '#fff'
};
const buttonStyle = { width: '100%', maxWidth: '350px', padding: '18px', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', backgroundColor: '#4A90E2', border: 'none', borderRadius: '16px' };

export default SideCapturePage;