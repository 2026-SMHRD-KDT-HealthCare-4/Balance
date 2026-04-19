import { useState, useCallback } from 'react';
import { calculateNeckAngle, getDiagnosticResult } from '../ai/poseAnalyzer';

export const useNeckDiagnostic = () => {
  const [report, setReport] = useState(null);

  const runAnalysis = useCallback((landmarks) => {
    if (!landmarks) return null;

    // 측면 기준 (보통 카메라 기준 더 잘보이는 쪽 7, 11번 사용)
    const ear = landmarks[7];
    const shoulder = landmarks[11];
    
    const angle = calculateNeckAngle(ear, shoulder);
    if (angle !== null) {
      const result = getDiagnosticResult(angle);
      const finalReport = { ...result, angle: angle.toFixed(1) };
      setReport(finalReport);
      return finalReport;
    }
    return null;
  }, []);

  const resetReport = () => setReport(null);

  return { report, runAnalysis, resetReport };
};