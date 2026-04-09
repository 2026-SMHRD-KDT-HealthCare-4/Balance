import { useState, useEffect, useRef } from 'react';
import { usePoseDetection } from './setupusePoseDetection';
import { savePoseLog } from '../api/poseApi';

const CONFIG = {
  CHECK_DURATION: 60 * 1000,
  CHECK_INTERVAL: 60 * 60 * 1000,
  SEND_INTERVAL: 10 * 1000
};

export const useScheduledPose = (videoRef) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('대기');
  const [currentData, setCurrentData] = useState({ sw: "0.0000", nvd: "0.0000" });

  // ✅ 실시간 값을 타이머가 참조할 수 있도록 Ref 사용 (핵심 해결책)
  const stateRef = useRef({ status: '대기', data: { sw: "0.0000", nvd: "0.0000" } });
  
  const { shoulderWidth, neckVerticalDist } = usePoseDetection(videoRef, isActive);

  // 1. 스케줄러 로직
  useEffect(() => {
    let checkTimer;
    const startMonitoring = () => {
      setIsActive(true);
      setStatus('측정 중');
      console.log("%c[시스템] 모니터링 시작 (1분간 측정)", "color: #1e90ff; font-weight: bold;");
      
      checkTimer = setTimeout(() => {
        setIsActive(false);
        setStatus('휴식 시간');
        console.log("%c[시스템] 모니터링 종료 (1시간 휴식)", "color: #ff4757; font-weight: bold;");
        setTimeout(startMonitoring, CONFIG.CHECK_INTERVAL);
      }, CONFIG.CHECK_DURATION);
    };
    startMonitoring();
    return () => clearTimeout(checkTimer);
  }, []);

  // 2. 분석 로직 및 Ref 업데이트
  useEffect(() => {
    if (!isActive || !shoulderWidth || parseFloat(shoulderWidth) === 0) return;

    const curSW = parseFloat(shoulderWidth);
    const curNVD = parseFloat(neckVerticalDist);
    const baseline = JSON.parse(localStorage.getItem('user_baseline'));
    
    let newStatus = '정상';
    if (baseline) {
      const baseSW = parseFloat(baseline.baseShoulderWidth);
      const baseNVD = parseFloat(baseline.baseNeckDist);
      if (Math.abs(curSW - baseSW) / baseSW > 0.1 || Math.abs(curNVD - baseNVD) / baseNVD > 0.1) {
        newStatus = '주의';
      }
    }

    // 상태와 데이터를 State와 Ref에 동시에 기록
    const newData = { sw: curSW.toFixed(4), nvd: curNVD.toFixed(4) };
    
    if (status !== newStatus) setStatus(newStatus);
    setCurrentData(newData);
    
    // ✅ Ref는 리렌더링과 상관없이 항상 최신값을 유지함
    stateRef.current = { status: newStatus, data: newData };
    
  }, [shoulderWidth, neckVerticalDist, isActive, status]);

  // 3. 서버 전송 로직 (Ref 참조 방식)
  useEffect(() => {
    let sendTimer;

    if (isActive) {
      console.log("%c[전송 루프] 10초 주기 타이머 가동", "color: #ffa500;");
      
      sendTimer = setInterval(async () => {
        // ✅ State 대신 Ref를 읽어서 현재 시점의 최신 데이터를 가져옴
        const { status: currentStatus, data } = stateRef.current;

        if (currentStatus === '정상' || currentStatus === '주의') {
          const logData = {
            shoulderWidth: data.sw,
            neckVerticalDist: data.nvd,
            status: currentStatus,
            timestamp: new Date().toLocaleTimeString()
          };

          console.group(`📤 서버 전송 (${logData.timestamp})`);
          console.table(logData);
          
          try {
            await savePoseLog(logData);
            console.log("%c✅ 전송 성공", "color: #2ed573;");
          } catch (error) {
            console.error("❌ 전송 실패:", error.message);
          }
          console.groupEnd();
        } else {
          console.log("[전송 대기] 현재 상태가 '측정 중'이거나 데이터가 아직 없습니다.");
        }
      }, CONFIG.SEND_INTERVAL);
    }

    return () => {
      if (sendTimer) {
        clearInterval(sendTimer);
        console.log("[전송 루프] 타이머 중단");
      }
    };
  }, [isActive]); // isActive가 바뀔 때만 타이머 재설정

  return { status, isActive, currentData };
};