import { useEffect, useRef, useState } from 'react';
import { initializePose, sendToPose } from '../ai/mediapipe';
import { analyzePosture } from '../ai/poseAnalyzer';
import { savePoseLog } from '../api/poseApi';

export const usePoseDetection = (videoRef) => {
  const [postureData, setPostureData] = useState({ 
    angle: 0, shoulderDiff: 0, forwardRatio: 0, status: '대기' 
  });
  
  const requestRef = useRef();
  // 마지막 전송 시간을 기억하기 위한 변수
  const lastSentTime = useRef(0); 

  const onResults = async (results) => {
    if (results.poseLandmarks) {
      // 1. 현재 프레임의 자세 분석 (정면 기준)
      const analysis = analyzePosture(results.poseLandmarks);
      setPostureData(analysis);

      // 2. 서버 전송 제어 로직 (순수 시간 기준)
      const now = Date.now();
      
      /**
       * 수정된 조건: 
       * 상태와 상관없이 오직 마지막 전송으로부터 30초가 지났을 때만 보냅니다.
       */
      if (now - lastSentTime.current > 30000) {
        try {
          await savePoseLog(analysis);
          
          // 전송 성공 시 현재 시간을 기록하여 다음 30초를 기다립니다.
          lastSentTime.current = now; 
          console.log("정기 데이터 저장 완료 (30초 간격)");
        } catch (err) {
          console.warn("데이터 전송 실패: 네트워크 상태를 확인하세요.");
        }
      }
    }
  };

  const detect = async () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      await sendToPose(videoRef.current);
    }
    requestRef.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    const poseInstance = initializePose(onResults);
    detect();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      poseInstance.close();
    };
  }, []);

  return postureData;
};