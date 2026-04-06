import { useEffect, useRef, useState } from 'react';
import { initializePose } from '../ai/mediapipe';
import { analyzePosture } from '../ai/posetureAnalyzer'; // 의성님의 정면 분석 로직
import { savePoseLog } from '../api/poseApi';

export const usePoseDetection = (videoRef) => {
  // postureData에 스트레칭 판정용 avgNoseY, avgWidth 추가
  const [postureData, setPostureData] = useState({ 
    angle: 0, 
    shoulderDiff: 0, 
    forwardRatio: 0, 
    status: '대기', 
    landmarks: null,
    avgNoseY: 0, 
    avgWidth: 0 
  });
  
  const lastSentTime = useRef(0);
  const lastLogTime = useRef(0);
  
  // 스트레칭 판정에 필요한 데이터 히스토리 (최근 5프레임)
  const history = useRef({ noseY: [], width: [] });

  const getAverage = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b) / arr.length;

  const onResults = (results) => {
    if (results.poseLandmarks) {
      const now = Date.now();
      const lms = results.poseLandmarks;

      // 1. 스트레칭 판정용 현재 좌표값 추출
      const currentNoseY = lms[0].y; // 코의 Y좌표 (숙임 정도)
      const currentWidth = Math.abs(lms[11].x - lms[12].x); // 양쪽 어깨 x축 거리

      // 2. 히스토리에 추가 및 5개 유지 (노이즈 방지용)
      history.current.noseY = [...history.current.noseY, currentNoseY].slice(-5);
      history.current.width = [...history.current.width, currentWidth].slice(-5);

      // 3. 평균값 계산
      const avgNoseY = getAverage(history.current.noseY);
      const avgWidth = getAverage(history.current.width);

      // [디버깅] 1초마다 평균값 데이터 출력 (필요 없으면 삭제 가능)
      if (now - lastLogTime.current > 1000) {
        console.log(`====== [스트레칭용 평균 데이터] ======`);
        console.log(`평균 코 Y: ${avgNoseY.toFixed(3)}`);
        console.log(`평균 어깨너비: ${avgWidth.toFixed(3)}`);
        console.log(`====================================`);
        lastLogTime.current = now;
      }

      // 4. 의성님의 분석 로직 실행 (감시용)
      const analysis = analyzePosture(lms); 
      
      // 5. 모든 데이터를 통합하여 상태 업데이트
      setPostureData({
        ...analysis,
        avgNoseY,   // StretchPage에서 판정에 사용됨
        avgWidth,   // StretchPage에서 판정에 사용됨
        landmarks: lms 
      });

      // 6. 서버 로그 저장 (30초 간격)
      if (now - lastSentTime.current > 30000) {
        savePoseLog(analysis).catch(() => {});
        lastSentTime.current = now;
      }
    }
  };

  useEffect(() => {
    let poseInstance = null;

    const startCamera = async () => {
      if (videoRef.current) {
        try {
          // 웹캠 설정
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              width: { ideal: 1280 }, 
              height: { ideal: 720 }, 
              aspectRatio: { ideal: 1.7777777778 } 
            }
          });
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            // mediapipe 설정 파일(mediapipe.js)을 통해 초기화
            poseInstance = initializePose(videoRef.current, onResults);
          };
        } catch (err) {
          console.error("카메라를 시작할 수 없습니다:", err);
          // 카메라 실패 시에도 poseInstance 초기화 시도 (폴백)
          poseInstance = initializePose(videoRef.current, onResults);
        }
      }
    };

    startCamera();

    return () => { 
      if (poseInstance) poseInstance.close(); 
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef]); // videoRef 의존성 추가

  return postureData;
};