// ai/mediapipe.js

// 내부적으로 인스턴스를 저장할 변수
let defaultPoseInstance = null;

export const initializeCapturePose = (onResultsCallback) => {
  const pose = new window.Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults(onResultsCallback);
  
  // 새로 생성된 인스턴스를 기본 인스턴스로 등록
  defaultPoseInstance = pose;
  
  return pose;
};

/**
 * 인자가 1개면 기본 인스턴스 사용 (sendToCapturePose(image))
 * 인자가 2개면 지정된 인스턴스 사용 (sendToCapturePose(instance, image))
 */
export const sendToCapturePose = async (arg1, arg2) => {
  let instance;
  let image;

  if (arg2 !== undefined) {
    // 인자가 2개 들어온 경우: 원래 기능 (instance, image)
    instance = arg1;
    image = arg2;
  } else {
    // 인자가 1개만 들어온 경우: 새로운 편의 기능 (image만 넘김)
    instance = defaultPoseInstance;
    image = arg1;
  }

  if (instance && instance.send) {
    try {
      await instance.send({ image });
    } catch (error) {
      console.error("MediaPipe 데이터 전송 에러:", error);
    }
  } else {
    console.error("Pose 인스턴스를 찾을 수 없습니다. 초기화를 먼저 확인하세요.");
  }
};