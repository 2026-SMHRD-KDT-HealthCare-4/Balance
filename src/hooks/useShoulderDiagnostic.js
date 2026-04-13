// hooks/useShoulderDiagnostic.js
import { analyzeFrontPose } from '../ai/frontPoseAnalyzer';

export const useShoulderDiagnostic = () => {
  /**
   * landmarks를 입력받아 최종 분석 객체를 반환합니다.
   */
  const runAnalysis = (landmarks) => {
    return analyzeFrontPose(landmarks);
  };

  return { runAnalysis };
};