import React, { useState, useCallback, useRef, useEffect } from 'react';

const calculateDistance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

const STRETCH_STEPS = [
  { id: 1, name: "목 옆으로 당기기", image: "/images/stretch_neck.png" },
  { id: 2, name: "페이커 스트레칭", image: "/images/stretch_faker.png" },
];

const StretchPage = ({ landmarks, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [statusMessage, setStatusMessage] = useState("스트레칭을 시작하세요!");
  const [liveMetrics, setLiveMetrics] = useState({ v1: "0.00", v2: "0.00" });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const prevLandmarksRef = useRef(null);
  const baseDistanceRef = useRef(null);

  // 1. [기능] 5초 유지 타이머 로직
  useEffect(() => {
    if (isHolding) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setHoldTime(prev => (prev >= 5000 ? 5000 : prev + 100));
        }, 100);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setHoldTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isHolding]);

  // 2. [기능] 성공 판정 및 단계 이동
  useEffect(() => {
    if (holdTime >= 5000) {
      setStatusMessage("성공! 다음 단계로...");
      setTimeout(() => {
        if (currentStep < STRETCH_STEPS.length - 1) {
          setCurrentStep(prev => prev + 1);
          setHoldTime(0);
          setIsHolding(false);
          baseDistanceRef.current = null;
        } else {
          alert("모든 스트레칭 완료! 모니터링을 재개합니다.");
          onFinish(); 
        }
      }, 1000);
    }
  }, [holdTime, currentStep, onFinish]);

  // 3. [기능 & 디자인] 실시간 분석 및 대형 캔버스 그리기
  useEffect(() => {
    if (!landmarks || !canvasRef.current || !containerRef.current) return;

    // Smoothing (의성님 요청 반영)
    let smoothLandmarks = landmarks;
    if (prevLandmarksRef.current) {
      smoothLandmarks = landmarks.map((lm, i) => ({
        x: prevLandmarksRef.current[i].x * 0.8 + lm.x * 0.2,
        y: prevLandmarksRef.current[i].y * 0.8 + lm.y * 0.2,
        z: lm.z
      }));
    }
    prevLandmarksRef.current = smoothLandmarks;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const videoElement = document.querySelector('#shared-video'); 
    
    // 캔버스 크기를 컨테이너에 맞춤
    if (videoElement) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // [디자인] 멀어보이는 효과를 위해 캔버스 내부에 Padding(50px) 적용 계산
    const padding = 50;
    const drawW = canvas.width - (padding * 2);
    const drawH = canvas.height - (padding * 2);

    const getPos = (p) => ({ 
      x: (1 - p.x) * drawW + padding, 
      y: p.y * drawH + padding 
    });
    
    ctx.strokeStyle = "#00FF00"; 
    ctx.lineWidth = 5;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
      [9, 10], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24]
    ];

    connections.forEach(([i, j]) => {
      if (smoothLandmarks[i] && smoothLandmarks[j]) {
        const p1 = getPos(smoothLandmarks[i]);
        const p2 = getPos(smoothLandmarks[j]);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
    });

    // 동작 판별 로직 (기존 동일)
    let correct = false;
    if (currentStep === 0) {
      const distL = calculateDistance(smoothLandmarks[7], smoothLandmarks[11]);
      const distR = calculateDistance(smoothLandmarks[8], smoothLandmarks[12]);
      const minD = Math.min(distL, distR);
      if (!baseDistanceRef.current) baseDistanceRef.current = minD;
      const ratio = minD / baseDistanceRef.current;
      setLiveMetrics({ v1: ratio.toFixed(2), v2: "0.85" });
      if (ratio < 0.85) correct = true;
    } else {
      const shoulderY = (smoothLandmarks[11].y + smoothLandmarks[12].y) / 2;
      const headBack = shoulderY - smoothLandmarks[0].y;
      const wristDist = Math.abs(smoothLandmarks[15].x - smoothLandmarks[16].x);
      const shoulderW = calculateDistance(smoothLandmarks[11], smoothLandmarks[12]);
      const spread = wristDist / shoulderW;
      setLiveMetrics({ v1: headBack.toFixed(2), v2: spread.toFixed(1) });
      if (headBack < 0.18 && spread > 1.2) correct = true;
    }
    setIsHolding(correct);
    if (correct) setStatusMessage("자세 유지 중...");
    else setStatusMessage(STRETCH_STEPS[currentStep].name + " 시작!");

  }, [landmarks, currentStep]);

  return (
    <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ display: 'flex', gap: '30px', width: '95%', maxWidth: '1600px', height: '85vh' }}>
        
        {/* 왼쪽 가이드 패널 */}
        <div style={{ flex: '0.7', background: '#1e293b', padding: '30px', borderRadius: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: '#38bdf8', textAlign: 'center' }}>{STRETCH_STEPS[currentStep].name}</h2>
          <img src={STRETCH_STEPS[currentStep].image} alt="guide" style={{ width: '100%', borderRadius: '20px', margin: '20px 0' }} />
          
          <div style={{ padding: '20px', background: '#334155', borderRadius: '20px' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>진행도: {liveMetrics.v1}</p>
            <div style={{ width: '100%', height: '20px', background: '#475569', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${(holdTime / 5000) * 100}%`, height: '100%', background: '#22c55e', transition: 'width 0.1s' }} />
            </div>
          </div>
          <h3 style={{ textAlign: 'center', marginTop: '20px', color: isHolding ? '#4ade80' : '#fb7185' }}>{statusMessage}</h3>
        </div>

        {/* 오른쪽 대형 웹캠 패널 */}
        <div style={{ flex: '1.3', position: 'relative', background: '#000', borderRadius: '30px', overflow: 'hidden', border: '4px solid #334155' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            {/* 비디오는 부모에서 띄우므로 캔버스만 크게 덮음 */}
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }} />
            
            {isHolding && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontSize: '10rem', fontWeight: 'bold', zIndex: 20, textShadow: '0 0 30px rgba(0,0,0,1)' }}>
                {Math.ceil((5000 - holdTime) / 1000)}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StretchPage;