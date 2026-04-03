// CDN을 통해 Pose 모델을 불러옵니다.
const pose = new window.Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

export const initializePose = (onResults) => {
  pose.onResults(onResults);
  return pose;
};

export const sendToPose = async (image) => {
  await pose.send({ image });
};