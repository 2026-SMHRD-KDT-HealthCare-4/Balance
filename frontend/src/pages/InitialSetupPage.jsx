import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { saveBaseline } from '../api/poseApi'; 
import WebcamView from '../components/WebcamView';

const InitialSetupPage = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  
  // 상태 관리
  const [isMeasuring, setIsMeasuring] = useState(false); // 5초 측정 중인지 여부
  const [countdown, setCountdown] = useState(5);         // 카운트다운 숫자
  const [isSaving, setIsSaving] = useState(false);

  // 실시간 데이터 가져오기 (기준값 없이 절대값 측정)
  const { angle, shoulderDiff, forwardRatio, isActive } = usePoseDetection(videoRef);

  // 5초 측정 로직
  useEffect(() => {
    let timer;
    if (isMeasuring && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isMeasuring && countdown === 0) {
      // 5초가 끝났을 때 실행되는 함수
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
      // 5초 시점의 현재 좌표값을 기준으로 객체 생성
      const baselineData = {
        angle: parseFloat(angle),
        shoulderDiff: parseFloat(shoulderDiff) / 100, 
        forwardRatio: parseFloat(forwardRatio) / 100
      };

      // 서버에 전송
      await saveBaseline(baselineData);
      
      // 로컬 스토리지 저장 (즉시 사용용)
      localStorage.setItem('user_baseline', JSON.stringify(baselineData));

      alert("정자세 기준 등록이 완료되었습니다!");
      navigate('/monitor'); 
    } catch (error) {
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsMeasuring(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>📏 바른 자세 기준 설정</h1>
      
      {/* 안내 문구 추가 */}
      <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h2 style={{ color: '#1976d2', margin: '0' }}>"정자세로 앉아주세요"</h2>
        <p style={{ color: '#555', marginTop: '10px' }}>
          허리를 곧게 펴고 시선은 정면을 향한 상태에서 버튼을 눌러주세요.
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <WebcamView videoRef={videoRef} isActive={true} />
        
        {/* 측정 중일 때 화면에 카운트다운 표시 */}
        {isMeasuring && countdown > 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            fontSize: '5rem', color: 'white', fontWeight: 'bold', textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
          }}>
            {countdown}
          </div>
        )}
      </div>

      {!isMeasuring ? (
        <button 
          onClick={startSetup}
          style={{
            padding: '15px 40px', fontSize: '1.2rem', backgroundColor: '#4CAF50',
            color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}
        >
          측정 시작 (5초)
        </button>
      ) : (
        <div style={{ fontSize: '1.2rem', color: '#ff5722', fontWeight: 'bold' }}>
          {countdown > 0 ? "자세를 유지해주세요..." : "데이터 저장 중..."}
        </div>
      )}

      <div style={{ marginTop: '20px', color: '#999', fontSize: '0.9rem' }}>
        현재 실시간 각도: {angle}°
      </div>
    </div>
  );
};

export default InitialSetupPage;