import React, { useEffect, useRef } from 'react';

const WebcamView = ({ onResult }) => {
  const videoRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // 전역 객체 사용 (index.html에 스크립트가 있어야 함)
    const Pose = window.Pose;
    const Camera = window.Camera;

    if (!Pose || !Camera) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (results.poseLandmarks && poseRef.current) {
        onResult(results.poseLandmarks);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (poseRef.current) {
          await pose.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });
    camera.start();

    poseRef.current = pose;
    cameraRef.current = camera;

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    };
  }, [onResult]);

  return (
    <video
      ref={videoRef}
      style={{
        width: '100%',
        height: '100%',
        // ✅ 영상이 잘리지 않고 박스 안에 쏙 들어가게 설정
        objectFit: 'contain', 
        transform: 'rotateY(180deg)',
        backgroundColor: '#000' 
      }}
    />
  );
};

export default WebcamView;