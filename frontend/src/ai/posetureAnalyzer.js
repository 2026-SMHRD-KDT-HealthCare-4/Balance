/**
 * 정면 기준 자세 분석 로직 (실제 측정 데이터 기반 임계값 적용)
 */
export const analyzePosture = (landmarks) => {
  if (!landmarks) return { status: '대기', angle: 0, shoulderDiff: 0, forwardRatio: 0 };

  const nose = landmarks[0];
  const leftS = landmarks[11];
  const rightS = landmarks[12];

  // 1. 좌우 어깨 비대칭 (Y축 차이)
  // 측정 데이터: 정상 시 거의 0에 수렴
  const shoulderDiffY = Math.abs(leftS.y - rightS.y);

  // 2. 목의 좌우 기울기 (각도 계산)
  const midShoulderX = (leftS.x + rightS.x) / 2;
  const midShoulderY = (leftS.y + rightS.y) / 2;
  const dx = nose.x - midShoulderX;
  const dy = midShoulderY - nose.y; 
  const neckTiltAngle = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));

  // 3. 거북목 추정 (코의 Y축 깊이 변화 활용)
  // 측정 데이터: 정상 위치일 때 코의 Y값이 약 0.54
  // 고개를 앞으로 숙일수록 카메라에 가까워지며 Y값이 커지는 특성을 이용합니다.
  const currentNoseY = nose.y;
  const normalNoseY = 0.54; // Ye-hoon님의 정상 자세 평균값
  const forwardHeadScale = currentNoseY - normalNoseY;

  // 4. 종합 상태 판별 (Ye-hoon님의 데이터에 맞춘 임계값)
  let status = '정상';

  // [수치 조정 이유]
  // - neckTiltAngle: 10도 이상이면 육안으로도 확연히 기운 상태입니다.
  // - shoulderDiffY: 0.04(전체 높이의 4%) 이상이면 어깨 불균형이 눈에 띕니다.
  // - forwardHeadScale: 정상(0.54)보다 0.1(10%) 이상 내려오면 거북목으로 판단합니다.

  if (neckTiltAngle > 15 || shoulderDiffY > 0.05 || forwardHeadScale > 0.15) {
    status = '위험';
  } else if (neckTiltAngle > 10 || shoulderDiffY > 0.03 || forwardHeadScale > 0.08) {
    status = '주의';
  }

  return {
    angle: neckTiltAngle.toFixed(2),
    shoulderDiff: (shoulderDiffY * 100).toFixed(1), 
    forwardRatio: (forwardHeadScale * 100).toFixed(1), // 얼마나 앞으로 나왔는지 %로 표시
    status: status
  };
};