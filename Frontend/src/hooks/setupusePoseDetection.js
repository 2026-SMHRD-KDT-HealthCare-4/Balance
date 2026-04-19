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
  const lastDataRef = useRef(postureData);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const onResults = useCallback((results) => {
    if (isClosingRef.current || !enabledRef.current) return;
    if (results && results.poseLandmarks) {
      const analysis = analyzePosture(results.poseLandmarks);
      if (analysis) {
        const isSame = 
          parseFloat(lastDataRef.current.shoulderWidth).toFixed(3) === parseFloat(analysis.shoulderWidth).toFixed(3) &&
          parseFloat(lastDataRef.current.neckVerticalDist).toFixed(3) === parseFloat(analysis.neckVerticalDist).toFixed(3) &&
          lastDataRef.current.status === analysis.status;

        if (!isSame) {
          lastDataRef.current = analysis;
          setPostureData(analysis);
        }
      }
    }
  }, []); // 의존성 비움 유지

  // ✅ videoRef를 의존성에서 제거 → ref이므로 Ref로 접근
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
  }, []); // ✅ 빈 배열로 변경 (videoRef는 ref이므로 의존성 불필요)

  useEffect(() => {
    isClosingRef.current = false;

    // ✅ poseInstanceRef 초기화 조건 제거 (StrictMode 중복 방지)
    const initTimer = setTimeout(() => {
      if (!isClosingRef.current) {
        console.log("🚀 AI 모델 초기화 시작");
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
  }, []); // ✅ 의존성 완전히 비움 (onResults, detect 제거)

  return postureData;
};