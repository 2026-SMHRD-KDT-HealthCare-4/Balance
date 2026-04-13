  import React, { useEffect } from 'react';

  /**
   * 웹캠 화면만 담당하는 컴포넌트
   * @param {Object} videoRef - 상위 페이지에서 넘겨받은 비디오 참조값
   */
  const WebcamView = ({ videoRef }) => {
  useEffect(() => {
    const startWebcam = async () => {
      try {
        // 팩트: 해상도 제약 조건(constraints)은 브라우저에 '요청'하는 값일 뿐입니다. 
        // 모바일이나 다른 환경을 고려해 가로세로 비율(aspectRatio)만 지정하는 것이 더 유연합니다.
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            facingMode: "user" // 전면 카메라 명시
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("WebcamView: 카메라 연결 실패", error);
        alert("카메라 권한을 허용해주세요.");
      }
    };

      startWebcam();

    // 컴포넌트 언마운트 시 카메라 스트림 종료 (성능 최적화 필수)
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  return (
    <video
      ref={videoRef}
      style={{width: '100%',
              height: '100%',
              objectFit: 'contain', 
              backgroundColor: '#fff', // 검은 배경 대신 페이지 배경색과 일치시킴
              transform: 'scaleX(-1)'
            }}
      autoPlay
      playsInline
      muted
    />
  );
};

// 핵심: 비디오가 부모 박스를 꽉 채우도록 강제하는 스타일
const videoStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain', // 부모 박스 비율에 맞춰 빈틈없이 채움 (잘리는 부분 발생 가능)
  transform: 'scaleX(-1)', // 거울 모드 (사용자 경험상 필수)
  backgroundColor: '#000',
};

  export default WebcamView;