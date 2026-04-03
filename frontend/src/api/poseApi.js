import axios from 'axios';

// 백엔드 API 서버의 기본 주소입니다.
const API_URL = 'http://localhost:5000/api/pose';

/**
 * 분석된 자세 데이터를 서버 DB에 저장하는 함수
 * @param {Object} postureData - analyzePosture에서 반환된 객체 (angle, shoulderDiff, forwardRatio, status)
 */
export const savePoseLog = async (postureData) => {
  try {
    const response = await axios.post(`${API_URL}/log`, {
      angle: postureData.angle,           // 목 기울기 각도
      shoulderDiff: postureData.shoulderDiff, // 어깨 비대칭 수치
      forwardRatio: postureData.forwardRatio, // 거북목 전진 지수
      status: postureData.status,         // 정상/주의/위험 상태
      createdAt: new Date().toISOString() // 기록 생성 시간
    });
    
    return response.data; // 서버로부터의 응답 반환
  } catch (error) {
    console.error("서버로 자세 데이터 전송 중 오류 발생:", error);
    // 에러를 무시하지 않고 호출한 곳에서 알 수 있게 던져줍니다.
    throw error;
  }
};