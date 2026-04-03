import { useEffect, useRef, useState } from 'react';
import { initializePose } from '../ai/mediapipe';
import { calculateCVA } from '../ai/poseAnalyzer';    // 사용자님 분석기 (CVA)
import { analyzePosture } from '../ai/posetureAnalyzer'; // 의성님 분석기 (정면)
import { savePoseLog } from '../api/poseApi';        // DB 저장 API

export const useUnifiedPose = (videoRef) => {
  const [postureData, setPostureData] = useState({ 
    status: '대기', 
    angle: 0, 
    cva: 0,
    shoulderDiff: 0,
    forwardRatio: 0
  });
  const [rawLandmarks, setRawLandmarks] = useState(null);
  const requestRef = useRef();
  
  // 마지막 서버 전송 시간을 기록 (30초 간격 유지용)
  const lastSentTime = useRef(0); 

  const onResults = async (results) => {
    if (results.poseLandmarks) {
      // 1. 의성님 로직 실행 (정면 상태 분석: 위험/주의/정상)
      const ueseongAnalysis = analyzePosture(results.poseLandmarks);
      
      // 2. 사용자님 로직 실행 (측면 CVA 각도 계산)
      const yehoonCVA = calculateCVA(results.poseLandmarks);

      // 3. 상태 업데이트 (UI 표시용)
      const combinedData = {
        ...ueseongAnalysis,
        cva: yehoonCVA
      };
      setPostureData(combinedData);
      setRawLandmarks(results.poseLandmarks);

      // 4. 서버 전송 로직 (30초마다 자동 저장)
      const now = Date.now();
      if (now - lastSentTime.current > 30000) {
        try {
          // 의성님 분석 데이터를 기준으로 로그 저장
          await savePoseLog(ueseongAnalysis);
          lastSentTime.current = now;
          console.log("실시간 자세 데이터가 DB에 저장되었습니다. (30초 간격)");
        } catch (err) {
          console.warn("데이터 전송 실패: 서버 연결 상태를 확인하세요.");
        }
      }
    }
  };

  const detect = async () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      // 전역 window 객체에 저장된 pose 인스턴스를 통해 분석 요청
      const pose = window.poseInstance; 
      if (pose) {
        await pose.send({ image: videoRef.current });
      }
    }
    requestRef.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    // MediaPipe 초기화 및 결과 콜백 연결
    const pose = initializePose(onResults);
    window.poseInstance = pose; // 전역 참조용 저장
    
    detect();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (pose) pose.close();
    };
  }, []);

  return { postureData, rawLandmarks };
};