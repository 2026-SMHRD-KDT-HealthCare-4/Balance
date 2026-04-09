const capturePose = new window.Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

capturePose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

export const initializeCapturePose = (onResults) => {
  capturePose.onResults((results) => {
    
    onResults(results);
  });
  return capturePose;
};

export const sendToCapturePose = async (image) => {
  await capturePose.send({ image });
};