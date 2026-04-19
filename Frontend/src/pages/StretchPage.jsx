import React, { useState, useRef, useEffect } from 'react';
import * as tmPose from '@teachablemachine/pose';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STRETCH_STEPS = [
  { id: "NeckStretch", name: "목 스트레칭", image: "/images/sideneck.jpg" },
  { id: "CrossArm", name: "옆구리 스트레칭", image: "/images/crossarm.jpg" }
];

const HOLD_TARGET = 3000;
const REST_TARGET = 2000;
const TOTAL_REPEATS = 2;

const StretchPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [repeatCount, setRepeatCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const holdTimeRef = useRef(0);
  const repeatCountRef = useRef(0);
  const currentStepRef = useRef(0);
  const isRestingRef = useRef(false);
  const isCorrectRef = useRef(false);
  const isDoneRef = useRef(false);
  const isTransitioningRef = useRef(false); // ✅ 추가

  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const requestRef = useRef();
  const lastSpokenRef = useRef("");
  const lastSpokenTimeRef = useRef(0);

  const setRepeatCountSync = (val) => { repeatCountRef.current = val; setRepeatCount(val); };
  const setCurrentStepSync = (val) => { currentStepRef.current = val; setCurrentStep(val); };
  const setIsRestingSync = (val) => { isRestingRef.current = val; setIsResting(val); };
  const setIsDoneSync = (val) => { isDoneRef.current = val; setIsDone(val); };
  const setIsTransitioningSync = (val) => { isTransitioningRef.current = val; setIsTransitioning(val); }; // ✅ 추가

  const speak = (text, minInterval = 0, onEnd = null) => {
    if (!window.speechSynthesis) { onEnd?.(); return; }
    const now = Date.now();
    if (minInterval > 0 && now - lastSpokenTimeRef.current < minInterval) { onEnd?.(); return; }
    lastSpokenTimeRef.current = now;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    currentStepRef.current = currentStep;
    if (!isDone) {
      speak(`${STRETCH_STEPS[currentStep].name}을 시작합니다. 화면의 그림을 보고 자세를 잡아보세요.`);
    }
  }, [currentStep, isDone]);

  useEffect(() => {
    if (!isDone) return;
    if (requestRef.current) { window.cancelAnimationFrame(requestRef.current); requestRef.current = null; }
    speak("모든 스트레칭이 완료되었습니다. 수고하셨습니다!", 0, async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/api/posture/stretching', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ 스트레칭 기록 저장 성공");
      } catch (err) {
        console.error("❌ 스트레칭 기록 저장 실패:", err);
      } finally {
        localStorage.setItem('stretch_just_completed', 'true');
        navigate('/mypage');
      }
    });
  }, [isDone, navigate]);

  useEffect(() => {
    isCorrectRef.current = isCorrect;
    if (isCorrect && !isResting && lastSpokenRef.current !== "correct") {
      speak("그대로 유지하세요.", 3000);
      lastSpokenRef.current = "correct";
    }
    if (!isCorrect) lastSpokenRef.current = "";
  }, [isCorrect, isResting]);

  useEffect(() => {
    isRestingRef.current = isResting;
    if (isResting && lastSpokenRef.current !== "rest") {
      speak("잠시 쉬세요.");
      lastSpokenRef.current = "rest";
    }
  }, [isResting]);

  useEffect(() => {
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/fXjCbnIhU/";

    const init = async () => {
      try {
        const model = await tmPose.load(MODEL_URL + 'model.json', MODEL_URL + 'metadata.json');
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
      } catch (err) {
        console.error("모델 또는 웹캠 초기화 실패:", err);
      }
    };

    const timer = setInterval(() => {
      if (isDoneRef.current) return;
      if (isTransitioningRef.current) return; // ✅ 핵심 수정 — 전환 중엔 타이머 멈춤

      if (isRestingRef.current) {
        holdTimeRef.current += 100;
        setHoldTime(holdTimeRef.current);

        if (holdTimeRef.current >= REST_TARGET) {
          holdTimeRef.current = 0;
          setHoldTime(0);
          lastSpokenRef.current = "";
          setIsRestingSync(false);
        }

      } else if (isCorrectRef.current) {
        holdTimeRef.current += 100;
        setHoldTime(holdTimeRef.current);

        if (holdTimeRef.current >= HOLD_TARGET) {
          holdTimeRef.current = 0;
          setHoldTime(0);

          const nextCount = repeatCountRef.current + 1;
          if (nextCount < TOTAL_REPEATS) {
            speak(`${nextCount}회 완료. 다음 횟수를 준비하세요.`);
            setRepeatCountSync(nextCount);
            setIsRestingSync(true);
            lastSpokenRef.current = "";
          } else {
            const nextStep = currentStepRef.current + 1;
            if (nextStep < STRETCH_STEPS.length) {
              
              setIsTransitioningSync(true); // ✅ speak 호출 전에 먼저 막기!
              
              speak("이 동작을 모두 마쳤습니다. 다음 스트레칭으로 넘어갑니다.", 0, () => {
                setTimeout(() => {
                  setCurrentStepSync(nextStep);
                  setRepeatCountSync(0);
                  setIsRestingSync(true);
                  lastSpokenRef.current = "";
                  setIsTransitioningSync(false);
                }, 500);
              });
            } else {
              setIsDoneSync(true);
            }
          }
        }

      } else {
        if (holdTimeRef.current !== 0) {
          holdTimeRef.current = 0;
          setHoldTime(0);
          lastSpokenRef.current = "";
        }
      }
    }, 100);

    init();

    return () => {
      clearInterval(timer);
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
      if (webcamRef.current) webcamRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const predict = async (model) => {
    if (!webcamRef.current || !webcamRef.current.canvas) return;
    if (!model) return;
    try {
      const { pose, posenetOutput } = await model.estimatePose(webcamRef.current.canvas);
      if (!posenetOutput) return;
      const prediction = await model.predict(posenetOutput);
      const step = STRETCH_STEPS[currentStepRef.current];
      if (!step) return;
      const target = prediction.find(p => p.className === step.id);
      setIsCorrect(target && target.probability > 0.8);
      draw(pose);
    } catch (err) {
      console.warn("predict 스킵 (일시적 에러):", err.message);
    }
  };

  const draw = (pose) => {
    if (!canvasRef.current || !webcamRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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

  const currentStepData = STRETCH_STEPS[currentStep];

  return (
    <div style={styles.container}>
      {(isTransitioning || isDone || !currentStepData) && (
        <div style={styles.transitionOverlay}>
          <p style={styles.transitionText}>
            {isDone ? "스트레칭 완료! 데이터를 저장 중입니다... 🎉" : "다음 동작 준비 중..."}
          </p>
        </div>
      )}
      {currentStepData && !isDone && (
        <>
          <div style={styles.sidebar}>
            <h2 style={styles.title}>{currentStepData.name}</h2>
            <div style={styles.countBadge}>
              {currentStep + 1} / {STRETCH_STEPS.length} 번째 동작 :
              <span style={{color: '#38bdf8'}}> {Math.min(repeatCount + 1, TOTAL_REPEATS)} / {TOTAL_REPEATS}회</span>
            </div>
            <div style={styles.imgContainer}>
              <img src={currentStepData.image} style={styles.guideImg} alt="guide" />
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
                {[0, 1].map(i => {
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
        </>
      )}
    </div>
  );
};

const styles = {
  container: { position: 'fixed', inset: 0, display: 'flex', background: '#020617', zIndex: 9999 },
  transitionOverlay: { position: 'absolute', inset: 0, zIndex: 10000, background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  transitionText: { color: '#38bdf8', fontSize: '1.5rem', fontWeight: 'bold' },
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