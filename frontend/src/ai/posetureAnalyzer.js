/**
 * 정면 기준 자세 분석 로직
 * @param {Array} landmarks - MediaPipe에서 추출된 33개 좌표점
 */
export const analyzePosture = (landmarks) => {
  if (!landmarks) return null;

  // 정면 분석에 필요한 좌표: 코(0), 왼쪽 어깨(11), 오른쪽 어깨(12)
  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // 1. 좌우 어깨 비대칭 확인 (Y축 높낮이 차이)
  const shoulderDiffY = Math.abs(leftShoulder.y - rightShoulder.y);

  // 2. 목의 좌우 기울기 확인
  // 양 어깨의 중앙점을 구한 뒤, 코가 수직선에서 얼마나 벗어났는지 각도 계산
  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const dx = nose.x - midShoulderX;
  const dy = midShoulderY - nose.y; // 화면은 아래로 갈수록 Y가 커지므로 반대로 계산
  const neckTiltAngle = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));

  // 3. 거북목(앞으로 쏠림) 추정 (Z축 깊이 활용)
  // MediaPipe의 Z값은 음수일수록 카메라와 가깝습니다. 코가 어깨보다 비정상적으로 앞으로 나오는지 확인합니다.
  const noseDepth = nose.z;
  const shoulderDepth = (leftShoulder.z + rightShoulder.z) / 2;
  const forwardHeadRatio = shoulderDepth - noseDepth; 

  // 4. 종합 상태 판별 (임계값은 테스트하며 조절 가능)
  let status = '정상';
  // 목이 15도 이상 꺾이거나, 어깨 높낮이 차이가 크거나, 코가 과하게 앞으로 나온 경우
  if (neckTiltAngle > 15 || shoulderDiffY > 0.05 || forwardHeadRatio > 0.15) {
    status = '위험';
  } else if (neckTiltAngle > 8 || shoulderDiffY > 0.03 || forwardHeadRatio > 0.1) {
    status = '주의';
  }

  return {
    angle: neckTiltAngle.toFixed(2), // 메인 각도: 목 기울기
    shoulderDiff: (shoulderDiffY * 100).toFixed(1), // 어깨 불균형 수치
    forwardRatio: (forwardHeadRatio * 100).toFixed(1), // 거북목 전진 수치
    status: status
  };
};