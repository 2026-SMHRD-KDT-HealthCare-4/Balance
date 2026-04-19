import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import WebcamView from '../components/WebcamView';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { useShoulderDiagnostic } from '../hooks/useShoulderDiagnostic';
import { savePoseLog } from '../api/poseApi';

const FrontCapturePage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const isSavingRef = useRef(false);
  
  const [timer, setTimer] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const { runAnalysis } = useShoulderDiagnostic();

  // 🌟 [추가] 정면 각도를 점수로 환산하는 로직 (81~97점 정상 기준)
  const calculateFrontScore = (angle) => {
    const absAngle = Math.abs(angle); // 기울기 절대값
    let score = 97; // 시작 최고점 (100점 방지)

    if (absAngle <= 2) {
      // 0~2도 사이는 아주 훌륭한 상태
      score = 97 - (absAngle * 1); 
    } else if (absAngle <= 10) {
      // 주의 단계로 가는 구간 (61~85점 사이)
      score = 95 - (absAngle * 3);
    } else {
      // 위험 단계 (60점 이하)
      score = 65 - (absAngle * 2);
    }

    return Math.max(10, Math.floor(score)); // 최소 10점 보장
  };

  useEffect(() => {
    initializeCapturePose(async (results) => {
      if (!results || !results.poseLandmarks || isSavingRef.current) return;

      const analysisResult = runAnalysis(results.poseLandmarks);
      
      if (analysisResult) {
        isSavingRef.current = true; 
        
        // 🌟 [수정] 각도를 점수로 변환
        const calculatedScore = calculateFrontScore(analysisResult.angle);
        
        const token = localStorage.getItem('token');
        const poseData = {
          angle: analysisResult.angle,
          score: calculatedScore, // 환산된 점수 추가
          status: analysisResult.status,
          type: 'front',
          date: new Date().toISOString()
        };

        try {
          if (token) {
            // 회원: 점수 포함하여 DB 저장
            await savePoseLog(poseData);
          } else {
            // 비회원: 로컬스토리지 저장
            localStorage.setItem('temp_front_pose', JSON.stringify(poseData));
          }
        } catch (e) {
          console.error("데이터 저장 프로세스 실패", e);
        }

        // 결과 페이지로 이동 시 점수 데이터도 함께 전달
        navigate('/diagnosis', { 
          state: { 
            result: { ...analysisResult, score: calculatedScore }, 
            type: 'front' 
          },
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
          {timer !== null && (
            <div style={timerOverlayStyle}>{timer > 0 ? timer : "📸"}</div>
          )}
        </div>
      </div>

      <div style={footerStyle}>
        <button 
          onClick={handleStartCapture} 
          style={{
            ...buttonStyle, 
            backgroundColor: isMeasuring ? '#ccc' : '#7C9E87' // MyPage 브랜드 컬러와 통일
          }}
          disabled={isMeasuring}
        >
          {isMeasuring ? "자세 고정 중..." : "측정 시작"}
        </button>
      </div>
    </div>
  );
};

// 스타일 상수는 기존 코드와 동일하게 유지
const containerStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', zIndex: 2100 };
const titleStyle = { fontSize: '1.1rem', fontWeight: '800', margin: 0 };
const backBtnStyle = { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' };
const contentAreaStyle = { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' };
const subTitleLabelStyle = { marginBottom: '20px', fontSize: '1rem', fontWeight: '600', color: '#333' };
const videoContainerStyle = { position: 'relative', width: '100%', maxWidth: '640px', aspectRatio: '4/3', margin: '0 auto', overflow: 'hidden', background: '#000' };
const timerOverlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '80px', color: '#fff', fontWeight: 'bold' };
const footerStyle = { padding: '30px 20px', display: 'flex', justifyContent: 'center', backgroundColor: '#fff' };
const buttonStyle = { width: '100%', maxWidth: '350px', padding: '18px', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '16px', cursor: 'pointer' };

export default FrontCapturePage;