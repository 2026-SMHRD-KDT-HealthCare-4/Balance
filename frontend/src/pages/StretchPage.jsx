import React, { useState, useRef, useEffect } from 'react';

// 1. 수집한 실제 데이터 기반 정답지 및 이미지 경로 설정
const STRETCH_STEPS = [
  { 
    id: 1, 
    name: "목 옆으로 당기기", 
    image: "/images/sideneck.jpg", 
    targetNoseY: 0.515,
    targetWidth: 0.450, 
    toleranceY: 0.04, 
    toleranceWidth: 0.05,
    condition: (data) => data.angle > 15.0 
  },
  { 
    id: 2, 
    name: "목 앞으로 숙이기", 
    image: "/images/frontneck.jpg",
    targetNoseY: 0.585,
    targetWidth: 0.460, 
    toleranceY: 0.03, 
    toleranceWidth: 0.06,
    condition: (data) => data.angle < 10.0 
  },
  {
    id: 3,
    name: "어깨 으쓱하기", 
    image: "/images/shoulder.jpg",
    targetNoseY: 0.565,
    targetWidth: 0.510,
    toleranceY: 0.03,
    toleranceWidth: 0.04,
    condition: (data) => data.angle < 10.0 
  }
];

const StretchPage = ({ landmarks, currentData, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [statusMessage, setStatusMessage] = useState("준비하세요!");
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const prevLandmarksRef = useRef(null);

  // ⭐ 상수 설정 (8초)
  const HOLD_TARGET = 8000;

  // 1. 8초 유지 타이머 로직
  useEffect(() => {
    if (isHolding) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setHoldTime(prev => (prev >= HOLD_TARGET ? HOLD_TARGET : prev + 100));
        }, 100);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setHoldTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isHolding]);

  // 2. 성공 판정 및 단계 전환 (8000ms 기준)
  useEffect(() => {
    if (holdTime >= HOLD_TARGET) {
      if (currentStep < STRETCH_STEPS.length - 1) {
        setStatusMessage("좋아요! 다음 동작으로 넘어갑니다.");
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setHoldTime(0);
          setIsHolding(false);
        }, 1500);
      } else {
        setStatusMessage("참 잘했어요! 모든 스트레칭 완료!");
        setTimeout(() => onFinish(), 1500);
      }
    }
  }, [holdTime, currentStep, onFinish]);

  // 3. 실시간 데이터 판정 및 스켈레톤 시각화
  useEffect(() => {
    if (!landmarks || !canvasRef.current || !containerRef.current) return;

    let smoothLandmarks = landmarks;
    if (prevLandmarksRef.current) {
      smoothLandmarks = landmarks.map((lm, i) => ({
        x: prevLandmarksRef.current[i].x * 0.7 + lm.x * 0.3,
        y: prevLandmarksRef.current[i].y * 0.7 + lm.y * 0.3,
        z: lm.z
      }));
    }
    prevLandmarksRef.current = smoothLandmarks;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const stepGoal = STRETCH_STEPS[currentStep];
    
    // usePoseDetection에서 넘어오는 평균값(avgNoseY, avgWidth) 비교
    const noseMatch = Math.abs(currentData.avgNoseY - stepGoal.targetNoseY) < stepGoal.toleranceY;
    const widthMatch = Math.abs(currentData.avgWidth - stepGoal.targetWidth) < stepGoal.toleranceWidth;
    const customMatch = stepGoal.condition(currentData);
    
    const correct = noseMatch && widthMatch && customMatch;
    
    setIsHolding(correct);
    setStatusMessage(correct ? "잘하고 있어요! 유지하세요!" : `${stepGoal.name} 자세를 취해주세요.`);

    const drawPos = (p) => ({ 
      x: (1 - p.x) * canvas.width, 
      y: p.y * canvas.height 
    });

    ctx.strokeStyle = correct ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [0, 11], [0, 12]
    ];

    connections.forEach(([i, j]) => {
      if (smoothLandmarks[i] && smoothLandmarks[j]) {
        const p1 = drawPos(smoothLandmarks[i]);
        const p2 = drawPos(smoothLandmarks[j]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
  }, [landmarks, currentData, currentStep]);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0f172a', overflow: 'hidden' }}>
       {/* 배경 스켈레톤 캔버스 */}
       <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
       
       {/* 🏠 가이드 UI 박스 */}
       <div 
         style={{ 
           position: 'absolute', top: 30, left: 30, zIndex: 10, color: 'white', 
           background: 'rgba(30, 41, 59, 0.9)', padding: '25px', borderRadius: '20px', 
           backdropFilter: 'blur(10px)', width: '350px'
         }}
       >
         <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#38bdf8' }}>{STRETCH_STEPS[currentStep].name}</h2>
         
         {/* 동작 가이드 이미지 영역 */}
         <div style={{ 
           width: '100%', height: '220px', background: '#1e293b', borderRadius: '12px', 
           overflow: 'hidden', marginBottom: '20px', border: '2px solid #475569' 
         }}>
           <img 
             src={STRETCH_STEPS[currentStep].image} 
             alt={STRETCH_STEPS[currentStep].name}
             style={{ width: '100%', height: '100%', objectFit: 'contain' }}
           />
         </div>

         <p style={{ fontSize: '1.1rem', marginBottom: '20px', minHeight: '3em' }}>{statusMessage}</p>
         
         {/* 진행률 바 (8000ms 기준 계산) */}
         <div style={{ width: '100%', height: '12px', background: '#475569', borderRadius: '6px', overflow: 'hidden' }}>
           <div style={{ 
             width: `${(holdTime / 8000) * 100}%`, height: '100%', 
             background: '#22c55e', transition: 'width 0.1s linear' 
           }} />
         </div>
       </div>

       {/* 중앙 카운트다운 숫자 (8000ms 기준 계산) */}
       {isHolding && (
         <div style={{ 
           position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
           color: '#fff', fontSize: '12rem', fontWeight: 'bold', zIndex: 5, 
           textShadow: '0 0 50px rgba(34, 197, 94, 0.8)', pointerEvents: 'none' 
         }}>
           {Math.ceil((8000 - holdTime) / 1000)}
         </div>
       )}
    </div>
  );
};

export default StretchPage;