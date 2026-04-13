// ai/frontPoseAnalyzer.js

/**
 * 정면 포즈 데이터를 분석하여 어깨 기울기를 반환합니다.
 */
export const analyzeFrontPose = (landmarks) => {
  if (!landmarks || landmarks.length < 13) return null;

  // MediaPipe Shoulder Indices: Left(11), Right(12)
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // 가시성 체크 (어깨가 명확히 보이지 않으면 분석 스킵)
  if (leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) {
    return null; 
  }

  // x, y 좌표 차이 계산
  const dx = Math.abs(leftShoulder.x - rightShoulder.x);
  const dy = Math.abs(leftShoulder.y - rightShoulder.y);

  // 각도 계산 (atan2를 사용하여 수평 기준 기울기 도출)
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = Number((angleRad * (180 / Math.PI)).toFixed(1));

  // 상태 판정 기준 (사용자 정의 가능)
  let status = "정상";
  if (angleDeg > 2 && angleDeg <= 5) {
    status = "주의";
  } else if (angleDeg > 5) {
    status = "불균형";
  }

  return {
    angle: angleDeg,
    status: status,
    leftShoulderY: leftShoulder.y,
    rightShoulderY: rightShoulder.y
  };
};