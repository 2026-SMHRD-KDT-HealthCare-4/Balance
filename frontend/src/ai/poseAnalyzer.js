// src/ai/poseAnalyzer.js
export const calculateCVA = (landmarks) => {
  // 7번: 왼쪽 귀, 11번: 왼쪽 어깨
  const leftEar = landmarks[7];
  const leftShoulder = landmarks[11];

  if (!leftEar || !leftShoulder) return null;

  // x, y 차이 절대값 계산
  const dx = Math.abs(leftEar.x - leftShoulder.x);
  const dy = Math.abs(leftEar.y - leftShoulder.y);

  // 각도 계산 (라디안 -> 도 단위 변환)
  const radians = Math.atan2(dy, dx);
  const angle = radians * (180 / Math.PI);

  return Math.round(angle);
};