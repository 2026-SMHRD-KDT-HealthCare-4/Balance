import axios from 'axios';

const API_URL = 'http://localhost:3000/api/pose';

/**
 * [1] 분석된 자세 데이터를 서버 DB에 저장 (간소화 버전)
 */
export const savePoseLog = async (postureData) => {
  try {
    // postureData가 이미 { angle, shoulderDiff, forwardRatio, status }를 가지고 있으므로
    // spread 연산자(...)를 사용하거나 객체 그대로 보낼 수 있습니다.
    const response = await axios.post(`${API_URL}/log`, {
      ...postureData,
      createdAt: new Date().toISOString() // 시간값만 추가해서 전송
    });
    
    return response.data;
  } catch (error) {
    console.error("서버로 자세 데이터 전송 중 오류 발생:", error);
    throw error;
  }
};

/**
 * [2] 사용자의 정자세 기준값(Baseline)을 서버에 저장 (Setup 페이지용)
 */
export const saveBaseline = async (baselineData) => {
  try {
    const response = await axios.post(`${API_URL}/baseline`, {
      ...baselineData,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error("기준값 저장 실패:", error);
    throw error;
  }
};