-- ============================================================
-- Rebalance 프로젝트 가데이터 시드 (user_id = 1, 최근 2주치)
-- 사용법: MySQL에서 아래 명령어 실행
--   mysql -u root -p rebalance_db < seed_fixed.sql
-- ============================================================

USE rebalance_db;

-- ============================================================
-- 0. 기존 데이터 초기화 (재실행 시 중복 방지)
-- ============================================================
-- 필요시 주석 해제
-- DELETE FROM ai_reports WHERE user_id = 1;
-- DELETE FROM stretching_logs_table WHERE session_id IN (SELECT session_id FROM sessions_table WHERE user_id = 1);
-- DELETE FROM posture_data_table WHERE session_id IN (SELECT session_id FROM sessions_table WHERE user_id = 1);
-- DELETE FROM sessions_table WHERE user_id = 1;

-- ============================================================
-- 1. 세션 데이터 (14일치, 하루 1~3개 세션)
--    INTERVAL 계산: 14일 = 14*24*60 = 20160분
--    "INTERVAL 14 DAY - INTERVAL 55 MINUTE" → INTERVAL (20160-55) MINUTE
-- ============================================================
INSERT INTO sessions_table (user_id, start_time, end_time) VALUES
-- D-14 오전: 14일 전 정각 시작, 55분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 20160 MINUTE),       DATE_SUB(NOW(), INTERVAL 20105 MINUTE)),
-- D-14 오후: 14일 전 8시간 후 시작, 9시간 30분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 19680 MINUTE),       DATE_SUB(NOW(), INTERVAL 19590 MINUTE)),

-- D-13: 13일 전 1시간 후 시작, 2시간 10분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 18660 MINUTE),       DATE_SUB(NOW(), INTERVAL 18590 MINUTE)),

-- D-12 오전: 12일 전 정각 시작, 1시간 20분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 17280 MINUTE),       DATE_SUB(NOW(), INTERVAL 17200 MINUTE)),
-- D-12 오후: 12일 전 7시간 후 시작, 8시간 후 종료
(1, DATE_SUB(NOW(), INTERVAL 16860 MINUTE),       DATE_SUB(NOW(), INTERVAL 16800 MINUTE)),

-- D-11: 11일 전 2시간 후 시작, 3시간 30분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 15720 MINUTE),       DATE_SUB(NOW(), INTERVAL 15630 MINUTE)),

-- D-10 오전: 10일 전 1시간 후 시작, 2시간 45분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 14340 MINUTE),       DATE_SUB(NOW(), INTERVAL 14235 MINUTE)),
-- D-10 오후: 10일 전 6시간 후 시작, 7시간 후 종료
(1, DATE_SUB(NOW(), INTERVAL 13920 MINUTE),       DATE_SUB(NOW(), INTERVAL 13860 MINUTE)),

-- D-9: 9일 전 정각 시작, 1시간 15분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 12960 MINUTE),       DATE_SUB(NOW(), INTERVAL 12885 MINUTE)),

-- D-8 오전: 8일 전 2시간 후 시작, 3시간 20분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 11400 MINUTE),       DATE_SUB(NOW(), INTERVAL 11320 MINUTE)),
-- D-8 오후: 8일 전 8시간 후 시작, 9시간 후 종료
(1, DATE_SUB(NOW(), INTERVAL 10920 MINUTE),       DATE_SUB(NOW(), INTERVAL 10860 MINUTE)),

-- D-7: 7일 전 1시간 후 시작, 2시간 30분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 9990 MINUTE),        DATE_SUB(NOW(), INTERVAL 9870 MINUTE)),

-- D-6 오전: 6일 전 정각 시작, 1시간 40분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 8640 MINUTE),        DATE_SUB(NOW(), INTERVAL 8540 MINUTE)),
-- D-6 오후: 6일 전 5시간 후 시작, 6시간 10분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 8340 MINUTE),        DATE_SUB(NOW(), INTERVAL 8270 MINUTE)),

-- D-5: 5일 전 2시간 후 시작, 3시간 후 종료
(1, DATE_SUB(NOW(), INTERVAL 7080 MINUTE),        DATE_SUB(NOW(), INTERVAL 7020 MINUTE)),

-- D-4 오전: 4일 전 1시간 후 시작, 2시간 20분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 5700 MINUTE),        DATE_SUB(NOW(), INTERVAL 5620 MINUTE)),
-- D-4 오후: 4일 전 7시간 후 시작, 8시간 30분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 5340 MINUTE),        DATE_SUB(NOW(), INTERVAL 5250 MINUTE)),

-- D-3: 3일 전 정각 시작, 2시간 후 종료
(1, DATE_SUB(NOW(), INTERVAL 4320 MINUTE),        DATE_SUB(NOW(), INTERVAL 4200 MINUTE)),

-- D-2 오전: 2일 전 1시간 후 시작, 2시간 45분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 2820 MINUTE),        DATE_SUB(NOW(), INTERVAL 2715 MINUTE)),
-- D-2 오후: 2일 전 6시간 후 시작, 7시간 후 종료
(1, DATE_SUB(NOW(), INTERVAL 2520 MINUTE),        DATE_SUB(NOW(), INTERVAL 2460 MINUTE)),

-- D-1 오전: 어제 정각 시작, 1시간 30분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 1440 MINUTE),        DATE_SUB(NOW(), INTERVAL 1350 MINUTE)),
-- D-1 오후: 어제 5시간 후 시작, 6시간 20분 후 종료
(1, DATE_SUB(NOW(), INTERVAL 1140 MINUTE),        DATE_SUB(NOW(), INTERVAL 1060 MINUTE)),

-- D-0 (오늘): 2시간 전 시작, 1시간 전 종료
(1, DATE_SUB(NOW(), INTERVAL 120 MINUTE),         DATE_SUB(NOW(), INTERVAL 60 MINUTE));

-- ============================================================
-- @s: 방금 삽입한 24개 세션 중 첫 번째 session_id
-- ============================================================
SET @s = (
  SELECT MIN(session_id)
  FROM (
    SELECT session_id
    FROM sessions_table
    WHERE user_id = 1
    ORDER BY session_id DESC
    LIMIT 24
  ) AS t
);

SELECT @s AS base_session_id; -- 확인용

-- ============================================================
-- 2. 자세 데이터
-- ============================================================
INSERT INTO posture_data_table (session_id, neck_angle, shoulder_angle, posture_score, posture_measurement_time) VALUES
-- 세션 1~2 (D-14, 자세 나쁨)
(@s+0,  22.5, 6.2, 62, DATE_SUB(NOW(), INTERVAL 20150 MINUTE)),
(@s+0,  25.1, 7.0, 55, DATE_SUB(NOW(), INTERVAL 20135 MINUTE)),
(@s+0,  19.8, 5.5, 68, DATE_SUB(NOW(), INTERVAL 20120 MINUTE)),
(@s+1,  21.0, 6.8, 60, DATE_SUB(NOW(), INTERVAL 19665 MINUTE)),
(@s+1,  18.5, 5.2, 72, DATE_SUB(NOW(), INTERVAL 19635 MINUTE)),

-- 세션 3 (D-13, 보통)
(@s+2,  16.3, 4.5, 76, DATE_SUB(NOW(), INTERVAL 18640 MINUTE)),
(@s+2,  17.8, 4.8, 74, DATE_SUB(NOW(), INTERVAL 18610 MINUTE)),
(@s+2,  14.2, 3.9, 80, DATE_SUB(NOW(), INTERVAL 18580 MINUTE)),

-- 세션 4~5 (D-12, 보통)
(@s+3,  18.0, 5.0, 73, DATE_SUB(NOW(), INTERVAL 17270 MINUTE)),
(@s+3,  20.3, 5.8, 67, DATE_SUB(NOW(), INTERVAL 17240 MINUTE)),
(@s+3,  22.0, 6.1, 63, DATE_SUB(NOW(), INTERVAL 17210 MINUTE)),
(@s+4,  15.5, 4.2, 79, DATE_SUB(NOW(), INTERVAL 16840 MINUTE)),
(@s+4,  13.8, 3.5, 83, DATE_SUB(NOW(), INTERVAL 16810 MINUTE)),

-- 세션 6 (D-11, 조금 좋아짐)
(@s+5,  15.0, 4.0, 80, DATE_SUB(NOW(), INTERVAL 15700 MINUTE)),
(@s+5,  13.5, 3.2, 84, DATE_SUB(NOW(), INTERVAL 15660 MINUTE)),
(@s+5,  12.8, 3.0, 86, DATE_SUB(NOW(), INTERVAL 15620 MINUTE)),

-- 세션 7~8 (D-10, 좋음)
(@s+6,  12.0, 2.8, 88, DATE_SUB(NOW(), INTERVAL 14320 MINUTE)),
(@s+6,  11.5, 2.5, 90, DATE_SUB(NOW(), INTERVAL 14270 MINUTE)),
(@s+6,  10.8, 2.3, 91, DATE_SUB(NOW(), INTERVAL 14220 MINUTE)),
(@s+7,  13.2, 3.1, 85, DATE_SUB(NOW(), INTERVAL 13900 MINUTE)),
(@s+7,  12.5, 2.9, 87, DATE_SUB(NOW(), INTERVAL 13870 MINUTE)),

-- 세션 9 (D-9, 좋음)
(@s+8,  11.0, 2.4, 91, DATE_SUB(NOW(), INTERVAL 12945 MINUTE)),
(@s+8,  10.5, 2.2, 93, DATE_SUB(NOW(), INTERVAL 12915 MINUTE)),
(@s+8,  12.0, 2.7, 88, DATE_SUB(NOW(), INTERVAL 12885 MINUTE)),

-- 세션 10~11 (D-8, 살짝 악화)
(@s+9,  16.5, 4.5, 77, DATE_SUB(NOW(), INTERVAL 11380 MINUTE)),
(@s+9,  18.2, 5.0, 73, DATE_SUB(NOW(), INTERVAL 11340 MINUTE)),
(@s+9,  17.0, 4.7, 75, DATE_SUB(NOW(), INTERVAL 11300 MINUTE)),
(@s+10, 15.8, 4.2, 79, DATE_SUB(NOW(), INTERVAL 10900 MINUTE)),
(@s+10, 14.5, 3.8, 81, DATE_SUB(NOW(), INTERVAL 10870 MINUTE)),

-- 세션 12 (D-7, 회복)
(@s+11, 13.5, 3.3, 84, DATE_SUB(NOW(), INTERVAL 9970 MINUTE)),
(@s+11, 12.8, 3.0, 86, DATE_SUB(NOW(), INTERVAL 9920 MINUTE)),
(@s+11, 11.5, 2.6, 89, DATE_SUB(NOW(), INTERVAL 9870 MINUTE)),

-- 세션 13~14 (D-6, 좋음)
(@s+12, 11.0, 2.5, 91, DATE_SUB(NOW(), INTERVAL 8620 MINUTE)),
(@s+12, 10.5, 2.3, 93, DATE_SUB(NOW(), INTERVAL 8580 MINUTE)),
(@s+12, 10.0, 2.1, 94, DATE_SUB(NOW(), INTERVAL 8540 MINUTE)),
(@s+13, 12.5, 2.8, 87, DATE_SUB(NOW(), INTERVAL 8320 MINUTE)),
(@s+13, 11.8, 2.6, 89, DATE_SUB(NOW(), INTERVAL 8290 MINUTE)),

-- 세션 15 (D-5, 보통)
(@s+14, 14.0, 3.6, 82, DATE_SUB(NOW(), INTERVAL 7060 MINUTE)),
(@s+14, 15.5, 4.0, 79, DATE_SUB(NOW(), INTERVAL 7030 MINUTE)),

-- 세션 16~17 (D-4, 좋음)
(@s+15, 11.2, 2.5, 91, DATE_SUB(NOW(), INTERVAL 5680 MINUTE)),
(@s+15, 10.8, 2.3, 92, DATE_SUB(NOW(), INTERVAL 5630 MINUTE)),
(@s+15, 10.2, 2.1, 94, DATE_SUB(NOW(), INTERVAL 5600 MINUTE)),
(@s+16, 12.0, 2.7, 88, DATE_SUB(NOW(), INTERVAL 5320 MINUTE)),
(@s+16, 11.5, 2.5, 90, DATE_SUB(NOW(), INTERVAL 5270 MINUTE)),
(@s+16, 10.8, 2.3, 92, DATE_SUB(NOW(), INTERVAL 5220 MINUTE)),

-- 세션 18 (D-3, 매우 좋음)
(@s+17, 9.5,  2.0, 95, DATE_SUB(NOW(), INTERVAL 4300 MINUTE)),
(@s+17, 9.2,  1.9, 96, DATE_SUB(NOW(), INTERVAL 4260 MINUTE)),
(@s+17, 8.8,  1.8, 97, DATE_SUB(NOW(), INTERVAL 4220 MINUTE)),
(@s+17, 9.0,  1.9, 96, DATE_SUB(NOW(), INTERVAL 4180 MINUTE)),

-- 세션 19~20 (D-2, 매우 좋음)
(@s+18, 9.8,  2.1, 94, DATE_SUB(NOW(), INTERVAL 2800 MINUTE)),
(@s+18, 9.5,  2.0, 95, DATE_SUB(NOW(), INTERVAL 2750 MINUTE)),
(@s+18, 9.0,  1.9, 96, DATE_SUB(NOW(), INTERVAL 2700 MINUTE)),
(@s+19, 10.2, 2.2, 93, DATE_SUB(NOW(), INTERVAL 2500 MINUTE)),
(@s+19, 10.5, 2.3, 92, DATE_SUB(NOW(), INTERVAL 2470 MINUTE)),

-- 세션 21~22 (어제, 좋음 유지)
(@s+20, 10.0, 2.2, 93, DATE_SUB(NOW(), INTERVAL 1420 MINUTE)),
(@s+20, 10.5, 2.3, 92, DATE_SUB(NOW(), INTERVAL 1380 MINUTE)),
(@s+20, 9.8,  2.1, 94, DATE_SUB(NOW(), INTERVAL 1340 MINUTE)),
(@s+21, 11.0, 2.4, 91, DATE_SUB(NOW(), INTERVAL 1120 MINUTE)),
(@s+21, 10.8, 2.3, 92, DATE_SUB(NOW(), INTERVAL 1080 MINUTE)),

-- 세션 23 (오늘)
(@s+22, 9.5,  2.0, 95, DATE_SUB(NOW(), INTERVAL 110 MINUTE)),
(@s+22, 9.2,  1.9, 96, DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
(@s+22, 8.8,  1.8, 97, DATE_SUB(NOW(), INTERVAL 50 MINUTE));

-- ============================================================
-- 3. 스트레칭 기록
-- ============================================================
INSERT INTO stretching_logs_table (session_id, target_part, duration, description, alarm_message) VALUES
(@s+0,  '목',   30, '목 앞으로 기울이기',   '목 자세가 나빠졌어요! 스트레칭 해주세요.'),
(@s+0,  '어깨', 45, '어깨 돌리기',          '어깨가 불균형해요. 스트레칭 추천!'),
(@s+1,  '목',   30, '목 좌우 스트레칭',     '목 각도 초과 알림'),
(@s+2,  '목',   30, '목 앞뒤 스트레칭',     '목 자세를 확인하세요.'),
(@s+2,  '허리', 60, '허리 스트레칭',        NULL),
(@s+3,  '어깨', 45, '어깨 스트레칭',        '어깨 균형이 틀어졌어요.'),
(@s+5,  '목',   30, '목 스트레칭',          '목 자세 교정 필요'),
(@s+6,  '어깨', 45, '어깨 스트레칭',        NULL),
(@s+6,  '목',   30, '목 좌우 기울이기',     NULL),
(@s+8,  '목',   30, '목 앞으로 기울이기',   NULL),
(@s+9,  '어깨', 45, '어깨 돌리기',          '어깨 자세 알림'),
(@s+11, '목',   30, '목 스트레칭',          NULL),
(@s+12, '전신', 90, '전신 스트레칭',        NULL),
(@s+14, '목',   30, '목 좌우 스트레칭',     '목 각도 주의'),
(@s+15, '어깨', 45, '어깨 스트레칭',        NULL),
(@s+17, '전신', 90, '전신 스트레칭',        NULL),
(@s+18, '목',   30, '목 스트레칭',          NULL),
(@s+20, '어깨', 45, '어깨 스트레칭',        NULL),
(@s+22, '목',   30, '목 앞으로 기울이기',   NULL);

-- ============================================================
-- 4. AI 리포트
-- ============================================================
INSERT INTO ai_reports (user_id, posture_id, report_text, prescription_text, score, balance_shoulder, balance_neck, balance_head, compliance_score, accuracy_score, report_type, created_at) VALUES
(1, NULL,
 '2주 전 자세 데이터를 분석한 결과, 목 각도가 기준치를 초과하는 경향이 있었습니다. 장시간 모니터 사용 시 거북목 자세가 반복적으로 관찰되었습니다.',
 '목 스트레칭을 하루 3회 이상 권장합니다. 모니터 높이를 눈높이에 맞게 조정해보세요.',
 63, 58, 55, 62, 70, 68, 'weekly', DATE_SUB(NOW(), INTERVAL 14 DAY)),

(1, NULL,
 '지난주 대비 자세가 눈에 띄게 개선되었습니다. 목 각도와 어깨 균형이 안정화되고 있으며, 스트레칭 수행률도 높아졌습니다.',
 '현재 개선 추세를 유지하세요. 특히 장시간 앉아 있을 때 1시간마다 스트레칭을 꾸준히 해주세요.',
 82, 80, 78, 84, 88, 81, 'weekly', DATE_SUB(NOW(), INTERVAL 7 DAY)),

(1, NULL,
 '오늘 자세 점수가 전날보다 소폭 하락했습니다. 오후 시간대 자세 유지에 어려움이 있었던 것으로 보입니다.',
 '오후 집중 근무 시간대에 특히 목 자세를 의식적으로 교정해보세요.',
 79, 77, 75, 80, 82, 79, 'daily', DATE_SUB(NOW(), INTERVAL 5 DAY)),

(1, NULL,
 '오늘은 전반적으로 좋은 자세를 유지했습니다. 스트레칭도 꾸준히 수행했으며, 어깨 균형도 안정적이었습니다.',
 '이 페이스를 유지해보세요. 수면 전 목과 어깨 스트레칭도 추가해보면 좋습니다.',
 91, 90, 89, 93, 94, 91, 'daily', DATE_SUB(NOW(), INTERVAL 4 DAY)),

(1, NULL,
 '이번 주 최고 자세 점수를 기록한 날입니다! 목과 어깨 모두 안정적인 자세를 꾸준히 유지했습니다.',
 '훌륭한 자세 유지입니다. 현재 루틴과 스트레칭 습관을 계속 이어가세요.',
 96, 95, 94, 97, 98, 95, 'daily', DATE_SUB(NOW(), INTERVAL 3 DAY)),

(1, NULL,
 '어제도 전반적으로 자세가 양호했습니다. 오전보다 오후에 더 집중된 자세를 유지한 점이 인상적입니다.',
 '좋은 흐름을 유지하고 있어요. 오늘도 1시간 간격으로 스트레칭 알람을 활용해보세요.',
 92, 91, 90, 93, 95, 91, 'daily', DATE_SUB(NOW(), INTERVAL 1 DAY)),

(1, NULL,
 '오늘 자세 분석 결과, 매우 안정적인 자세를 유지하고 있습니다. 목 각도와 어깨 균형 모두 기준치 이내입니다.',
 '오늘 자세 관리 아주 잘하고 계세요! 하루 마무리 전신 스트레칭으로 마무리해보세요.',
 95, 94, 93, 96, 97, 94, 'daily', NOW());

-- ============================================================
-- 결과 확인
-- ============================================================
SELECT '✅ sessions_table'       AS 테이블, COUNT(*) AS 삽입된_행 FROM sessions_table WHERE user_id = 1
UNION ALL
SELECT '✅ posture_data_table',  COUNT(*) FROM posture_data_table WHERE session_id >= @s
UNION ALL
SELECT '✅ stretching_logs_table', COUNT(*) FROM stretching_logs_table WHERE session_id >= @s
UNION ALL
SELECT '✅ ai_reports',          COUNT(*) FROM ai_reports WHERE user_id = 1;
