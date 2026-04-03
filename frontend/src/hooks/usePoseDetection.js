import { useEffect, useRef, useState } from 'react';
import { initializePose, sendToPose } from '../ai/mediapipe';
import { analyzePosture } from '../ai/poseAnalyzer';
import { savePoseLog } from '../api/poseApi';

export const usePoseDetection = (videoRef) => {
  // --- ⚙️ 시간 설정 구간 (여기 숫자만 수정하면 주기가 바뀝니다) ---
  const SETTINGS = {
    CHECK_DURATION: 60 * 1000,      // [1] 웹캠 유지 시간 (현재 1분)
    CHECK_INTERVAL: 60 * 60 * 1000, // [2] 다음 웹캠 켜짐까지 대기 시간 (현재 1시간)
    SEND_INTERVAL: 10 * 1000        // [3] 서버 데이터 전송 주기 (현재 10초)
  };
  // ----------------------------------------------------------

  const [postureData, setPostureData] = useState({ angle: 0, status: '대기' });
  const [isActive, setIsActive] = useState(false); 
  const requestRef = useRef();
  const lastSentTime = useRef(0);

  const onResults = async (results) => {
    // 웹캠이 활성화된 상태에서만 로직 실행
    if (results.poseLandmarks && isActive) {
      const analysis = analyzePosture(results.poseLandmarks);
      setPostureData(analysis);

      const now = Date.now();
      // 설정한 SEND_INTERVAL(10초) 마다 서버에 저장
      if (now - lastSentTime.current > SETTINGS.SEND_INTERVAL) {
        try {
          await savePoseLog(analysis);
          lastSentTime.current = now;
          console.log(`[데이터 기록] 10초 주기 서버 전송 완료 (${new Date().toLocaleTimeString()})`);
        } catch (err) {
          console.warn("데이터 전송 실패: 서버 연결 상태를 확인하세요.");
        }
      }
    }
  };

  const detect = async () => {
    if (isActive && videoRef.current && videoRef.current.readyState === 4) {
      await sendToPose(videoRef.current);
    }
    requestRef.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    const poseInstance = initializePose(onResults);

    const scheduleNextCheck = () => {
      setIsActive(true);
      lastSentTime.current = 0; // 웹캠이 켜질 때마다 전송 타이머 리셋 (즉시 전송 유도)
      console.log("=== 자세 검사 시작 (1분간 유지) ===");

      // 1분 후 웹캠 자동 종료 예약
      setTimeout(() => {
        setIsActive(false);
        console.log("=== 자세 검사 종료 (대기 모드 진입) ===");
        
        // 1시간 후 다시 실행 예약
        setTimeout(scheduleNextCheck, SETTINGS.CHECK_INTERVAL); 
      }, SETTINGS.CHECK_DURATION);
    };

    scheduleNextCheck();
    detect();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      poseInstance.close();
    };
  }, [isActive]);

  return { ...postureData, isActive };
};