/**
 * 정면 기준 자세 분석 로직 (거리 기반)
 * @param {Array} landmarks - MediaPipe에서 추출된 33개 좌표점
 */
export const analyzePosture = (landmarks) => {
  if (!landmarks) return null;

  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // 1. 양 어깨의 X축 거리 (사용자의 몸 크기/거리 기준)
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

  // 2. 어깨 중심점 계산
  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

  // 3. 어깨 중심과 코 사이의 Y축 거리 (목의 길이/거북목 정도 파악)
  // MediaPipe Y는 위가 0, 아래가 1이므로 (어깨Y - 코Y)가 양수여야 정상입니다.
  const neckVerticalDist = midShoulderY - nose.y;

  // 4. 어깨 수평 차이 (기존 유지 - 보조 지표)
  const shoulderDiffY = Math.abs(leftShoulder.y - rightShoulder.y);

  // 상태 판별 (임시 임계값)
  let status = '정상';
  if (neckVerticalDist < 0.1 || shoulderDiffY > 0.05) {
    status = '위험';
  }

  return {
    shoulderWidth: shoulderWidth.toFixed(4),    // 양 어깨 X거리
    neckVerticalDist: neckVerticalDist.toFixed(4), // 어깨-코 Y거리
    shoulderDiff: (shoulderDiffY * 100).toFixed(1),
    status: status,
    // 기존 코드와의 호환성을 위해 raw 데이터 포함
    midPoint: { x: midShoulderX, y: midShoulderY }
  };
};