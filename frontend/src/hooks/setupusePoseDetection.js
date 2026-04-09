// hooks/setupusePoseDetection.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { analyzePosture } from '../ai/setupposeAnalyzer';

export const usePoseDetection = (videoRef, enabled = true) => {
  const [postureData, setPostureData] = useState({ 
    shoulderWidth: "0.0000",
    neckVerticalDist: "0.0000",
    status: '대기'
  });

  const requestRef = useRef();
  const poseInstanceRef = useRef(null);
  const isClosingRef = useRef(false);
  const enabledRef = useRef(enabled);
  
  // ✅ 최신 postureData를 참조하기 위한 Ref (무한 루프 방지의 핵심)
  const lastDataRef = useRef(postureData);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const onResults = useCallback((results) => {
    if (isClosingRef.current || !enabledRef.current) return;
    if (results && results.poseLandmarks) {
      const analysis = analyzePosture(results.poseLandmarks);
      if (analysis) {
        // ✅ 이전 값과 비교하여 소수점 3자리까지 같으면 업데이트 하지 않음
        const isSame = 
          parseFloat(lastDataRef.current.shoulderWidth).toFixed(3) === parseFloat(analysis.shoulderWidth).toFixed(3) &&
          parseFloat(lastDataRef.current.neckVerticalDist).toFixed(3) === parseFloat(analysis.neckVerticalDist).toFixed(3) &&
          lastDataRef.current.status === analysis.status;

        if (!isSame) {
          lastDataRef.current = analysis; // Ref 업데이트
          setPostureData(analysis);      // State 업데이트 (리렌더링 발생)
        }
      }
    }
  }, []); // 의존성 비움

  const detect = useCallback(async () => {
    if (isClosingRef.current || !enabledRef.current) return;
    if (videoRef.current && videoRef.current.readyState >= 3) {
      try {
        await sendToCapturePose(poseInstanceRef.current, videoRef.current);
      } catch (err) {
        if (!err.message?.includes('deleted')) console.warn("AI Loop Error:", err);
      }
    }
    if (!isClosingRef.current && enabledRef.current) {
      requestRef.current = requestAnimationFrame(detect);
    }
  }, [videoRef]);

  useEffect(() => {
    isClosingRef.current = false;
    const initTimer = setTimeout(() => {
      if (!isClosingRef.current && !poseInstanceRef.current) {
        console.log("🚀 AI 모델 초기화 시작");
        // ✅ onResults를 직접 넘겨줌
        poseInstanceRef.current = initializeCapturePose(onResults);
        detect();
      }
    }, 500);

    return () => {
      isClosingRef.current = true;
      clearTimeout(initTimer);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (poseInstanceRef.current) {
        try { poseInstanceRef.current.close(); } catch (e) {}
        poseInstanceRef.current = null;
      }
    };
  }, [onResults, detect]);

  return postureData;
};