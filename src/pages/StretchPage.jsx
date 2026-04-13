import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; 
import * as tmPose from '@teachablemachine/pose';

const STRETCH_STEPS = [
  { id: "NeckStretch", name: "목 스트레칭", image: "/images/sideneck.jpg" },
  { id: "CrossArm", name: "팔 교차 스트레칭", image: "/images/shoulder.jpg" },
  { id: "SideStretch", name: "옆구리 스트레칭", image: "/images/side.jpg" }
];

const HOLD_TARGET = 5000; // 5초 유지
const REST_TARGET = 3000; // 3초 휴식
const TOTAL_REPEATS = 4;

const StretchPage = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isResting, setIsResting] = useState(false); 

  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const requestRef = useRef();

  // 1. 모델 및 웹캠 초기화 (기존 로직 유지)
  useEffect(() => {
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/2U5oQKq_T/";
    let model;

    const init = async () => {
      model = await tmPose.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json');
      const size = 400; 
      const webcam = new tmPose.Webcam(size, size, true);
      await webcam.setup();
      await webcam.play();
      webcamRef.current = webcam;

      const loop = async () => {
        webcam.update();
        await predict(model);
        requestRef.current = window.requestAnimationFrame(loop);
      };
      requestRef.current = window.requestAnimationFrame(loop);
    };

    init();
    return () => {
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
      if (webcamRef.current) webcamRef.current.stop();
    };
  }, []);

  // 2. 타이머 로직 (게이지 1번당 불 1개 로직)
  useEffect(() => {
    let timer;
    if (isResting) {
      timer = setInterval(() => {
        setHoldTime((prev) => {
          const nextTime = prev + 100;
          if (nextTime >= REST_TARGET) {
            setIsResting(false); 
            return 0;
          }
          return nextTime;
        });
      }, 100);
    } 
    else if (isCorrect) {
      timer = setInterval(() => {
        setHoldTime((prev) => {
          const nextTime = prev + 100;
          if (nextTime >= HOLD_TARGET) {
            // 5초 완료 시점: 여기서 repeatCount를 올리면 즉시 불이 하나 켜짐
            const nextCount = repeatCount + 1;
            if (nextCount < TOTAL_REPEATS) {
              setRepeatCount(nextCount);
              setIsResting(true);
              return 0;
            } else {
              if (currentStep < STRETCH_STEPS.length - 1) {
                setCurrentStep(prev => prev + 1);
                setRepeatCount(0);
                setIsResting(true);
                return 0;
              } else {
                onFinish();
                return 0;
              }
            }
          }
          return nextTime;
        });
      }, 100);
    } else {
      setHoldTime(0);
    }
    return () => clearInterval(timer);
  }, [isCorrect, isResting, repeatCount, currentStep, onFinish]);

  const predict = async (model) => {
    if (!webcamRef.current || !model) return;
    const { pose, posenetOutput } = await model.estimatePose(webcamRef.current.canvas);
    const prediction = await model.predict(posenetOutput);
    const step = STRETCH_STEPS[currentStep];
    const target = prediction.find(p => p.className === step.id);
    setIsCorrect(target && target.probability > 0.9);
    draw(pose);
  };

  const draw = (pose) => {
    if (!canvasRef.current || !webcamRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const video = webcamRef.current.canvas;
    const scale = Math.min(canvas.width / video.width, canvas.height / video.height);
    const x = (canvas.width - video.width * scale) / 2;
    const y = (canvas.height - video.height * scale) / 2;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, video.width, video.height, canvas.width - (x + video.width * scale), y, video.width * scale, video.height * scale);
    ctx.restore();

    if (pose) {
      const normalizedKeypoints = pose.keypoints.map(kp => ({
        ...kp,
        position: {
          x: canvas.width - (x + kp.position.x * scale),
          y: y + kp.position.y * scale
        }
      }));
      tmPose.drawKeypoints(normalizedKeypoints, 0.5, ctx);
      tmPose.drawSkeleton(normalizedKeypoints, 0.5, ctx);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.title}>{STRETCH_STEPS[currentStep].name}</h2>
        
        <div style={styles.countBadge}>
          진행 횟수: <span style={{color: '#38bdf8'}}>{Math.min(repeatCount + 1, TOTAL_REPEATS)} / 4</span>
        </div>

        <div style={styles.imgContainer}>
          <img src={STRETCH_STEPS[currentStep].image} style={styles.guideImg} alt="guide" />
        </div>

        <div style={styles.progressSection}>
          <p style={{ ...styles.statusText, color: isResting ? '#fbbf24' : (isCorrect ? '#22c55e' : '#94a3b8') }}>
            {isResting ? `잠시 쉬세요...` : (isCorrect ? "✨ 그대로 유지하세요!" : "자세를 맞춰보세요")}
          </p>
          
          <div style={styles.gaugeBg}>
            <div style={{ 
              ...styles.gaugeFill, 
              width: isResting ? '0%' : `${(holdTime / HOLD_TARGET) * 100}%`,
              background: isCorrect ? '#22c55e' : '#64748b',
              transition: isCorrect ? 'width 0.1s linear' : 'none'
            }} />
          </div>

          <div style={styles.dotContainer}>
            {[0, 1, 2, 3].map(i => {
              // 5초를 채워서 repeatCount가 올라갔을 때만 초록불로 바뀜
              const isFinished = i < repeatCount;
              return (
                <div key={i} style={{
                  ...styles.dot,
                  backgroundColor: isFinished ? '#22c55e' : '#334155',
                  boxShadow: (i === repeatCount && isCorrect && !isResting) ? '0 0 10px #38bdf8' : 'none',
                  border: isFinished ? 'none' : '1px solid #475569'
                }} />
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
    </div>
  );
};

const styles = {
  container: { position: 'fixed', inset: 0, display: 'flex', background: '#020617', zIndex: 9999 },
  sidebar: { width: '350px', background: '#0f172a', padding: '30px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b' },
  title: { color: '#38bdf8', marginBottom: '20px', fontSize: '1.5rem', textAlign: 'center' },
  countBadge: { backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', textAlign: 'center', color: '#f8fafc', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #38bdf8' },
  imgContainer: { width: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#1e293b', marginBottom: '20px', border: '2px solid #334155' },
  guideImg: { width: '100%', height: 'auto', display: 'block', objectFit: 'contain' },
  statusText: { fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', height: '1.5rem' },
  mainContent: { flex: 1, position: 'relative', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  canvas: { width: '100%', height: '100%', objectFit: 'contain' },
  progressSection: { marginTop: 'auto', paddingBottom: '20px' },
  gaugeBg: { width: '100%', height: '14px', background: '#334155', borderRadius: '7px', overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: '7px' },
  dotContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%', transition: 'all 0.3s' }
};

export default StretchPage;