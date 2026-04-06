// src/ai/mediapipe.js

// 1. MediaPipe Pose 객체 생성 (전역 인스턴스)
const pose = new window.Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

// 모델 성능 및 정확도 설정
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

/**
 * @param {HTMLVideoElement} videoElement - 웹캠 영상이 담길 태그
 * @param {Function} onResults - 분석 결과를 처리할 콜백 함수 (usePoseDetection에서 전달)
 */
export const initializePose = (videoElement, onResults) => {
  // 결과 콜백 등록
  pose.onResults(onResults);

  // 2. 🚀 카메라 유틸리티 설정
  if (typeof window !== "undefined" && window.Camera) {
    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        // 비디오 프레임을 MediaPipe 엔진으로 전송하여 분석 시작
        await pose.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });
    
    console.log("📷 MediaPipe 카메라 유틸리티를 시작합니다.");
    camera.start();
  } else {
    console.error("❌ MediaPipe Camera Utils가 로드되지 않았습니다. index.html의 스크립트 태그를 확인하세요.");
  }

  return pose;
};

/**
 * 수동 전송용 함수 (필요시 사용하지만, Camera.start()를 쓰면 자동으로 호출됨)
 */
export const sendToPose = async (image) => {
  if (pose) {
    await pose.send({ image });
  }
};