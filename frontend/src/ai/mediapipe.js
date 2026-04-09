// ai/mediapipe.js
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
  return pose;
};

// 특정 인스턴스에 이미지를 보내도록 매개변수 추가
export const sendToCapturePose = async (poseInstance, image) => {
  if (poseInstance && poseInstance.send) {
    await poseInstance.send({ image });
  }
};