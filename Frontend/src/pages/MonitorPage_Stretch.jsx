import React, { useState, useRef } from 'react';
import StretchPage from './StretchPage';
import WebcamView from '../components/WebcamView'; // 웹캠 화면을 보여주기 위해 필요

const MonitorPageStretch = () => {
  const videoRef = useRef(null);
  // 1. 처음부터 스트레칭 모드로 시작합니다 (팀원 페이지에서 이미 판정을 받았으므로)
  const [isStretchMode, setIsStretchMode] = useState(true);

  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      backgroundColor: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* 2. 감시 단계 없이 바로 StretchPage를 렌더링합니다 */}
      {isStretchMode ? (
        <StretchPage 
          videoRef={videoRef} 
          key="stretch-page-session"
          onFinish={() => {
            // 스트레칭이 끝나면 다시 팀원의 감시 페이지로 돌아가게 만들 수 있습니다.
            window.location.href = '/team-monitor'; // 또는 navigate('/team-monitor')
          }} 
        />
      ) : (
        // 만약의 상황을 대비한 기본 웹캠 뷰 (보통은 실행되지 않음)
        <WebcamView videoRef={videoRef} />
      )}
    </div>
  );
};

export default MonitorPageStretch;