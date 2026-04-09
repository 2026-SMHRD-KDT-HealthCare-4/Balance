  import React, { useEffect } from 'react';

  /**
   * 웹캠 화면만 담당하는 컴포넌트
   * @param {Object} videoRef - 상위 페이지에서 넘겨받은 비디오 참조값
   */
  const WebcamView = ({ videoRef }) => {
    useEffect(() => {
      const startWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("WebcamView: 카메라 연결 실패", error);
        }
      };

      startWebcam();

      // 언마운트 시 트랙 정지 (카메라 불 끄기)
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }, [videoRef]);

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '640px',
            height: '480px',
            borderRadius: '10px',
            backgroundColor: '#222',
            objectFit: 'cover',
            transform: 'scaleX(-1)' // 정면 거울 모드
          }}
        />
      </div>
    );
  };

  export default WebcamView;