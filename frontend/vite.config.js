import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MediaPipe 라이브러리들이 Vite 환경에서 잘 로드되도록 최적화 대상에 포함시킵니다.
  optimizeDeps: {
    include: [
      '@mediapipe/pose',
      '@mediapipe/camera_utils'
    ],
  },
  // 빌드 시 commonjs 모듈 처리 관련 에러를 방지하기 위한 설정입니다.
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})