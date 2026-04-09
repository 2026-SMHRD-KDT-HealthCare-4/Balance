import { useState, useEffect, useRef } from 'react';
import { usePoseDetection } from './setupusePoseDetection';
import { savePoseLog } from '../api/poseApi';

const CONFIG = {
  CHECK_DURATION: 60 * 1000,      // 1분간 측정
  CHECK_INTERVAL: 60 * 60 * 1000, // 1시간 대기
  SEND_INTERVAL: 10 * 1000        // 10초마다 서버 전송
};

export const useScheduledPose = (videoRef) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('대기');
  const [currentData, setCurrentData] = useState({ sw: "0.0000", nvd: "0.0000" });

  // 실시간 포즈 탐지 훅 연결
  const { shoulderWidth, neckVerticalDist } = usePoseDetection(videoRef, isActive);

  // 1. 스케줄러 로직: 1시간마다 1분씩 활성화 (기존 유지)
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

  // 2. 분석 로직: 실시간 데이터 업데이트 및 ±10% 오차 체크
  useEffect(() => {
    // shoulderWidth가 "0.0000"이거나 null인 경우를 모두 체크
    if (!isActive || !shoulderWidth || parseFloat(shoulderWidth) === 0) return;

    // 문자열로 넘어올 수 있는 데이터를 숫자로 변환
    const curSW = parseFloat(shoulderWidth);
    const curNVD = parseFloat(neckVerticalDist);

    // 기준 데이터 로드
    const baseline = JSON.parse(localStorage.getItem('user_baseline'));
    
    if (baseline) {
      const baseSW = parseFloat(baseline.baseShoulderWidth);
      const baseNVD = parseFloat(baseline.baseNeckDist);

      // 오차 계산
      const swDiff = Math.abs(curSW - baseSW) / baseSW;
      const nvdDiff = Math.abs(curNVD - baseNVD) / baseNVD;

      // 10% 이상 차이 시 주의, 아니면 정상
      if (swDiff > 0.1 || nvdDiff > 0.1) {
        setStatus('주의');
      } else {
        setStatus('정상');
      }
    }

    // 화면 업데이트를 위한 state 설정 (문자열 포맷 유지)
    setCurrentData({ 
      sw: curSW.toFixed(4), 
      nvd: curNVD.toFixed(4) 
    });

  }, [shoulderWidth, neckVerticalDist, isActive]);

  // 3. 서버 전송 로직: 10초마다 로그 저장 (기존 유지)
  useEffect(() => {
    let sendTimer;
    if (isActive && status !== '대기' && status !== '측정 중') {
      sendTimer = setInterval(async () => {
        try {
          const logData = {
            shoulderWidth: currentData.sw,
            neckVerticalDist: currentData.nvd,
            status: status,
            timestamp: new Date().toISOString()
          };
          await savePoseLog(logData);
          console.log("로그 서버 전송 성공", logData);
        } catch (error) {
          console.warn("로그 전송 실패 (서버 연결 확인 필요)");
        }
      }, CONFIG.SEND_INTERVAL);
    }

    return () => clearInterval(sendTimer);
  }, [isActive, currentData, status]);

  return { status, isActive, currentData };
};