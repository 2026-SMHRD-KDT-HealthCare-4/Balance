import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/setupusePoseDetection';
import { saveBaseline } from '../api/poseApi'; 
import WebcamView from '../components/WebcamView';

const InitialSetupPage = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // 수정된 훅 데이터 구조 구조분해 할당
  const { shoulderWidth, neckVerticalDist, shoulderDiff } = usePoseDetection(videoRef, true);

  useEffect(() => {
    let timer;
    if (isMeasuring && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (isMeasuring && countdown === 0) {
      completeSetup();
    }
    return () => clearInterval(timer);
  }, [isMeasuring, countdown]);

  const startSetup = () => {
    setIsMeasuring(true);
    setCountdown(5);
  };

  const completeSetup = async () => {
    setIsSaving(true);
    try {
      // 거리 기반 기준값 생성
      const baselineData = {
        baseShoulderWidth: parseFloat(shoulderWidth),
        baseNeckDist: parseFloat(neckVerticalDist),
        baseShoulderDiff: parseFloat(shoulderDiff),
        timestamp: new Date().toISOString()
      };

      await saveBaseline(baselineData);
      localStorage.setItem('user_baseline', JSON.stringify(baselineData));

      alert("거리 기반 정자세 기준 등록이 완료되었습니다!");
      navigate('/monitor'); 
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
      setIsMeasuring(false);
    } finally {
      setIsSaving(false);
    }
  };

  console.log("실시간 데이터:", shoulderWidth, neckVerticalDist);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>📏 거리 기반 기준 설정</h1>
      
      <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
        <h2 style={{ color: '#7b1fa2', margin: '0' }}>"카메라와의 거리를 고정해주세요"</h2>
        <p style={{ color: '#555', marginTop: '10px' }}>
          어깨 넓이와 목 높이를 측정합니다. 평소 작업하는 자세를 잡아주세요.
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <WebcamView videoRef={videoRef} isActive={true} />
        {isMeasuring && countdown > 0 && (
          <div style={overlayStyle}>{countdown}</div>
        )}
      </div>

      {!isMeasuring ? (
        <button onClick={startSetup} style={btnStyle}>측정 시작 (5초)</button>
      ) : (
        <div style={{ fontSize: '1.2rem', color: '#ff5722', fontWeight: 'bold' }}>
          {countdown > 0 ? "데이터 분석 중..." : "저장 중..."}
        </div>
      )}

      <div style={{ marginTop: '20px', color: '#666', background: '#eee', padding: '10px', borderRadius: '5px' }}>
        {/* 값이 없을 경우 '측정 중...' 혹은 '0'이 나오게 처리 */}
        <p>어깨 너비 비율: {shoulderWidth || "0.0000"}</p>
        <p>어깨-코 수직 거리: {neckVerticalDist || "0.0000"}</p>
      </div>

    </div>
  );
};

const overlayStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  fontSize: '5rem', color: 'white', fontWeight: 'bold', textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
};

const btnStyle = {
  padding: '15px 40px', fontSize: '1.2rem', backgroundColor: '#7b1fa2',
  color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
};

export default InitialSetupPage;