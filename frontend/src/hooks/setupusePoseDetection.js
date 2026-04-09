import { useEffect, useRef, useState, useCallback } from 'react';
import { initializeCapturePose, sendToCapturePose } from '../ai/mediapipe';
import { analyzePosture } from '../ai/setupposeAnalyzer';

export const usePoseDetection = (videoRef, enabled = true) => {
  const [postureData, setPostureData] = useState({ 
    shoulderWidth: "0.0000",
    neckVerticalDist: "0.0000",
    shoulderDiff: "0.0",
    status: '대기'
  });

  const requestRef = useRef();
  const poseInstanceRef = useRef(null);
  const isClosingRef = useRef(false);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const onResults = useCallback((results) => {
    if (isClosingRef.current || !enabledRef.current) return;

    if (results && results.poseLandmarks) {
      const analysis = analyzePosture(results.poseLandmarks);
      if (analysis) setPostureData(analysis);
    }
  }, []);

  const detect = useCallback(async () => {
    // 중단 조건 체크 강화
    if (isClosingRef.current || !poseInstanceRef.current || !enabledRef.current) {
      return;
    }

    if (
      videoRef.current && 
      videoRef.current.readyState >= 3 && 
      !videoRef.current.paused
    ) {
      try {
        await sendToCapturePose(videoRef.current);
      } catch (err) {
        if (!isClosingRef.current) console.warn("Detection loop error:", err);
      }
    }
    
    // 다음 프레임 요청 전 다시 확인
    if (!isClosingRef.current && enabledRef.current) {
      requestRef.current = requestAnimationFrame(detect);
    }
  }, [videoRef]);

  useEffect(() => {
    isClosingRef.current = false;

    const initTimer = setTimeout(() => {
      if (!isClosingRef.current) {
        poseInstanceRef.current = initializeCapturePose(onResults);
        detect();
      }
    }, 200);

    return () => {
      isClosingRef.current = true;
      clearTimeout(initTimer);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (poseInstanceRef.current) {
        const instance = poseInstanceRef.current;
        poseInstanceRef.current = null;
        instance.close();
      }
    };
  }, [onResults, detect]);

  return postureData;
};