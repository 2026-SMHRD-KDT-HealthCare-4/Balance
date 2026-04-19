import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SNOOZE_DURATION = 10 * 60 * 1000; // 닫기 클릭 후 재알림까지 대기 시간 (10분)

export const useNotification = (morningTime = "10:00", afternoonTime = "15:30") => {
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    // 오전/오후 각각 오늘 날짜 기준으로 발송 여부를 추적
    const notifiedDates = {
      morning: null,
      afternoon: null,
    };

    const requestPermission = async () => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    };
    requestPermission();

    const sendNotification = (title, body, type) => {
      if (Notification.permission !== "granted") return;

      const noti = new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3048/3048398.png',
        tag: `stretch-alert-${type}`, // 오전/오후 tag 분리
        requireInteraction: true,
      });

      // ✅ 본문 클릭 → 스트레칭 페이지 이동
      noti.onclick = (event) => {
        event.preventDefault();
        navigate('/stretch');
        window.focus();
        noti.close();
      };

      // ✅ 닫기(X) 클릭 → SNOOZE_DURATION 후 재알림
      noti.onclose = () => {
        // onclick으로 닫힌 경우는 재알림 안 함 (플래그로 구분)
        if (noti._clickedThrough) return;

        setTimeout(() => {
          // 재알림 시 해당 type의 발송 기록 초기화 → 다음 루프에서 다시 발송
          notifiedDates[type] = null;
        }, SNOOZE_DURATION);
      };

      // onclick 플래그 설정 (onclose와 구분용)
      const originalOnclick = noti.onclick;
      noti.onclick = (event) => {
        noti._clickedThrough = true;
        originalOnclick(event);
      };
    };

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const today = now.toDateString(); // "Thu Apr 16 2026" 형태
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // 오전 알림: 오늘 아직 안 보냈을 때만
      if (currentTime === morningTime && notifiedDates.morning !== today) {
        notifiedDates.morning = today;
        sendNotification("☀️ 오전 스트레칭 시간", "거북목 예방을 위해 잠시 몸을 풀어주세요!", "morning");
      }

      // 오후 알림: 오늘 아직 안 보냈을 때만
      if (currentTime === afternoonTime && notifiedDates.afternoon !== today) {
        notifiedDates.afternoon = today;
        sendNotification("☕ 오후 스트레칭 시간", "집중력이 떨어질 땐 스트레칭이 최고예요.", "afternoon");
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [navigate, morningTime, afternoonTime]);
};