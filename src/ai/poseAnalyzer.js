// 수직선 대비 목 각도 계산
export const calculateNeckAngle = (ear, shoulder) => {
  if (!ear || !shoulder) return null;

  // 수직축 기준의 각도를 구하기 위해 Math.atan2 사용
  const deltaX = Math.abs(shoulder.x - ear.x);
  const deltaY = Math.abs(shoulder.y - ear.y);
  
  // 라디안을 각도로 변환
  const radians = Math.atan2(deltaX, deltaY);
  const angle = radians * (180 / Math.PI);
  
  return angle;
};

export const getDiagnosticResult = (angle) => {
  if (angle < 15) return { status: "정상", color: "#2ecc71", comment: "좋은 자세를 유지하고 계시네요!" };
  if (angle <= 17) return { status: "주의", color: "#f39c12", comment: "목이 조금 앞으로 나왔습니다. 스트레칭이 필요해요." };
  return { status: "거북목 위험", color: "#e74c3c", comment: "거북목이 의심됩니다. 자세 교정을 권장드려요." };
};