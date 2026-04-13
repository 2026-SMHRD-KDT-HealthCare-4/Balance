import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 팀원분의 포트(3000)를 사용하되, 예훈님의 상세 설정을 유지합니다.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    // 🔥 예훈님의 Teachable Machine과 팀원의 MediaPipe 설정을 모두 포함합니다.
    include: [
      '@mediapipe/pose', 
      '@mediapipe/camera_utils',
      '@mediapipe/drawing_utils', 
      '@teachablemachine/pose', 
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-converter',
      '@tensorflow/tfjs-backend-webgl'
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/], // TensorFlow.js 등 CommonJS 라이브러리 호환성 해결
    },
  },
})