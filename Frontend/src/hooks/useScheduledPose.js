import { useState, useEffect, useRef } from 'react';
import { usePoseDetection } from './setupusePoseDetection';
import { savePoseLog } from '../api/poseApi';

const CONFIG = {
  CHECK_DURATION:  60 * 1000, // 10분 측정
  CHECK_INTERVAL: 30 * 60 * 1000, // 30분 휴식
  SEND_INTERVAL: 10 * 1000   // 10분마다 1번 저장
};

export const useScheduledPose = (videoRef) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('대기');
  const [currentData, setCurrentData] = useState({ sw: "0.0000", nvd: "0.0000" });

  const stateRef = useRef({ status: '대기', data: { sw: "0.0000", nvd: "0.0000" } });
  
  const detection = usePoseDetection(videoRef, isActive) || { shoulderWidth: 0, neckVerticalDist: 0 };
  const { shoulderWidth, neckVerticalDist } = detection;

  // 1. 스케줄러 (1분 측정 / 1시간 휴식)
  useEffect(() => {
    let checkTimer;
    const startMonitoring = () => {
      setIsActive(true);
      setStatus('측정 중');
      checkTimer = setTimeout(() => {
        setIsActive(false);
        setStatus('휴식 시간');
        setTimeout(startMonitoring, CONFIG.CHECK_INTERVAL);
      }, CONFIG.CHECK_DURATION);
    };
    startMonitoring();
    return () => clearTimeout(checkTimer);
  }, []);

  // 2. 분석 및 상태 업데이트 ✅ status 의존성 제거로 무한루프 방지
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

    const newData = { sw: curSW.toFixed(4), nvd: curNVD.toFixed(4) };
    setStatus(prev => prev !== newStatus ? newStatus : prev); // ✅ 변경 시에만 업데이트
    setCurrentData(newData);
    stateRef.current = { status: newStatus, data: newData };
  }, [shoulderWidth, neckVerticalDist, isActive]); // ✅ status 제거

  // 3. 서버 전송 ✅ angle, type 형식으로 수정
  useEffect(() => {
    let sendTimer;
    if (isActive) {
      sendTimer = setInterval(async () => {
        const { status: currentStatus, data } = stateRef.current;
        if (currentStatus === '정상' || currentStatus === '주의') {
          try {
            await savePoseLog({
              angle: parseFloat(data.sw),  // ✅ shoulderWidth → angle
              status: currentStatus,
              type: 'front'                // ✅ type 추가
            });
          } catch (error) { console.error("전송 실패:", error.message); }
        }
      }, CONFIG.SEND_INTERVAL);
    }
    return () => clearInterval(sendTimer);
  }, [isActive]);

  return { status, isActive, currentData };
};
