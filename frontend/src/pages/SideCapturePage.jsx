import React, { useState, useEffect, useRef } from 'react';
import WebcamView from '../components/WebcamView';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { useNeckDiagnostic } from '../hooks/useNeckDiagnostic';
import { savePoseLog } from '../api/poseApi';

const SideCapturePage = () => {
  const videoRef = useRef(null);
  const [timer, setTimer] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 기능은 2번째 코드의 훅을 사용
  const { report, runAnalysis, resetReport } = useNeckDiagnostic();

  // 1. MediaPipe 결과 수신 설정 (2번째 코드 로직 유지)
  useEffect(() => {
    initializeCapturePose(async (results) => {
      // 5초 카운트가 끝나고 분석 신호를 보낸 직후(timer === null)에만 실행
      if (results && results.poseLandmarks && !isMeasuring && !isSaving) {
        // 분석 실행 (각도 및 상태 계산)
        const analysisResult = runAnalysis(results.poseLandmarks);
        
        // 분석 결과가 성공적으로 나왔다면 서버로 전송
        if (analysisResult && !report) {
          await handleSaveToServer(analysisResult);
        }
      }
    });
  }, [runAnalysis, isMeasuring, isSaving, report]);

  // 2. 서버 저장 로직 (2번째 코드 로직 유지)
  const handleSaveToServer = async (postureData) => {
    setIsSaving(true);
    try {
      // API 파일의 savePoseLog 호출
      await savePoseLog({
        angle: postureData.angle,
        status: postureData.status,
      });
      console.log("데이터가 서버에 성공적으로 저장되었습니다.");
    } catch (error) {
      // 전송 실패 시 사용자에게 알림
      alert("서버 전송에 실패했습니다. 데이터를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. 측정 시작 버튼 클릭 (2번째 코드 로직 유지)
  const handleStartCapture = () => {
    resetReport();
    setIsMeasuring(true);
    setTimer(5);
  };

  // 4. 5초 카운트다운 관리 (2번째 코드 로직 유지)
  useEffect(() => {
    if (timer === null) return;

    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    } else {
      // 0초가 되면 현재 프레임 전송 (1회)
      if (videoRef.current && videoRef.current.readyState >= 2) {
        sendToCapturePose(videoRef.current);
      } else {
        alert("카메라 연결 상태를 확인해주세요.");
        setIsMeasuring(false);
      }
      setTimer(null);
      setIsMeasuring(false);
    }
  }, [timer]);

  // 가이드라인 색상 고정 (실시간 감지가 없으므로 주황색으로 고정)
  const guideColor = '#e67e22'; 

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1>거북목 정밀 측정</h1>
        <p>화면의 눈사람 실루엣에 몸을 측면으로 맞춰주세요.</p>
      </header>
      
      <div style={videoWrapperStyle}>
        {/* WebcamView는 수정 없이 사용 */}
        <WebcamView videoRef={videoRef} />
        
        {/* ★ [요청사항] 눈사람 모양 SVG 가이드 오버레이 */}
        {!report && (
          <svg style={svgOverlayStyle} viewBox="0 0 640 480">
            {/* 눈사람 모양 실루엣 Path */}
            <path
              d="M320,30 
                 C210,30 210,180 210,180 
                 C130,210 120,320 120,400 
                 C120,470 200,480 320,480 
                 C440,480 520,470 520,400 
                 C520,320 510,210 430,180 
                 C430,180 430,30 320,30 Z"
              fill="none" // 속을 비움
              stroke={guideColor} // 주황색 선
              strokeWidth="6" // 선 두께
              strokeDasharray="15,10" // 점선 스타일
              style={{ opacity: 0.6 }} // 평소에는 반투명하게
            />
          </svg>
        )}

        {/* 하단 메시지 (실시간 감지가 없으므로 고정 메시지) */}
        {!report && !isMeasuring && (
          <div style={messageBoxStyle}>
            눈사람 가이드 안으로 몸을 측면으로 맞춰주세요
          </div>
        )}

        {/* 카운트다운 UI (2번째 코드 로직 유지) */}
        {timer !== null && (
          <div style={timerOverlayStyle}>
            {timer > 0 ? timer : "📸"}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={handleStartCapture} 
          disabled={isMeasuring || isSaving}
          style={{
            ...buttonStyle,
            backgroundColor: (isMeasuring || isSaving) ? '#ccc' : '#4A90E2',
            cursor: (isMeasuring || isSaving) ? 'default' : 'pointer'
          }}
        >
          {isMeasuring ? "자세를 고정하세요..." : isSaving ? "저장 중..." : "진단 시작 (5초 후 캡처)"}
        </button>
      </div>

      {/* 결과 리포트 섹션 (2번째 코드 로직 유지) */}
      {report && (
        <div style={{ ...resultCardStyle, borderColor: report.color }}>
          <h2 style={{ color: report.color }}>진단 결과: {report.status}</h2>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>
            측정 각도: <strong>{report.angle}°</strong>
          </p>
          <p style={{ color: '#666' }}>{report.comment}</p>
          <button 
            onClick={resetReport} 
            style={{ marginTop: '15px', cursor: 'pointer' }}
          >
            다시 측정하기
          </button>
        </div>
      )}
    </div>
  );
};

// --- 스타일 객체 정의 (2번째 코드 기반으로 최적화) ---

const containerStyle = {
  textAlign: 'center',
  padding: '40px 20px',
  fontFamily: 'apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f4f7f6', // 배경색 살짝 추가
  minHeight: '100vh'
};

const headerStyle = {
  marginBottom: '30px',
  color: '#333'
};

const videoWrapperStyle = {
  position: 'relative',
  display: 'inline-block',
  width: '640px',
  height: '480px',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 20px 50px rgba(0,0,0,0.2)', // 그림자 강화
  border: '4px solid #444',
  backgroundColor: '#000'
};

const svgOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none', // 클릭 이벤트가 비디오로 전달되도록 함
  zIndex: 2 // 비디오 위에 위치
};

const messageBoxStyle = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(0,0,0,0.7)',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '10px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  zIndex: 3
};

const timerOverlayStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '120px',
  color: 'white',
  fontWeight: 'bold',
  textShadow: '0 0 20px rgba(0,0,0,0.5)',
  pointerEvents: 'none',
  zIndex: 4
};

const buttonStyle = {
  padding: '16px 40px',
  fontSize: '20px',
  fontWeight: 'bold',
  color: 'white',
  border: 'none',
  borderRadius: '50px',
  transition: 'all 0.3s',
  boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
};

const resultCardStyle = {
  marginTop: '40px',
  padding: '30px',
  border: '5px solid',
  borderRadius: '20px',
  backgroundColor: '#fff',
  display: 'inline-block',
  minWidth: '350px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
};

export default SideCapturePage;