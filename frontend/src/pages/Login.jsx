import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. URL의 'tab' 파라미터를 소스로 삼는 상태 관리
  // URL에 tab이 없으면 기본값 'login'
  const currentTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  const [scrollDone, setScrollDone] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const scrollRef = useRef(null);

  // 탭 전환 핸들러: URL의 쿼리 스트링을 직접 변경
  const handleTabChange = (targetTab) => {
    setSearchParams({ tab: targetTab });
  };

  // 스크롤 감지 로직
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setScrollDone(true);
    }
  };

  // 탭이 바뀔 때마다 동의 상태 초기화 (논리적 정합성 유지)
  useEffect(() => {
    setScrollDone(false);
    setAgreed(false);
  }, [currentTab]);

  const handleLoginSubmit = (e) => {
  e.preventDefault();

  // 1. 폼 데이터 가져오기
  const formData = new FormData(e.currentTarget);
  const userId = formData.get("userId")?. trim(); // input에 name="userId"가 있어야 함
  const userPw = formData.get("userPw")?. trim();

  console.log("입력된 아이디:", userId);
  console.log("입력된 비번:", userPw);
  // 2. [임시 검증] 나중에는 서버 API 호출로 대체될 부분
  if (userId && userPw) {
    // 단순 'true'가 아니라 유저 식별 정보를 포함한 객체로 저장
    const userData = {
      id: userId,
      name: userId, // 실제 서비스에선 서버에서 받아온 이름을 넣음
      isLoggedIn: true,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('userToken', JSON.stringify(userData));
    
    // 3. 이동
    navigate('/mypage', { replace: true }); 
  } else {
    alert("아이디와 비밀번호를 입력해주세요.");
  }
};

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('약관에 동의해야 합니다.');
      return;
    }
    
    // 가상의 회원가입 성공 처리
    alert('회원가입이 완료되었습니다. 로그인을 진행해주세요.');
    
    // 핵심 수정 사항: URL을 변경하여 자연스럽게 로그인 탭으로 이동
    setSearchParams({ tab: 'login' });
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7C9E87' }}>Re:balance</span>
        </div>

        {/* 탭 네비게이션 */}
        <div style={tabContainerStyle}>
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTabChange(t)}
              style={{
                ...tabBtnStyle,
                background: currentTab === t ? '#7C9E87' : 'transparent',
                color: currentTab === t ? '#FAF8F5' : '#8C7B6E',
              }}
            >
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        {currentTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={formStyle}>
            <input name="userId" placeholder="아이디" type="text" style={inputStyle} required />
            <input name="userPw" placeholder="비밀번호" type="password" style={inputStyle} required />
            <button type="submit" style={primaryBtn}>로그인</button>

            <div style={dividerStyle}>
              <div style={lineStyle} />
              <span style={{ fontSize: '0.8rem', color: '#475569' }}>또는</span>
              <div style={lineStyle} />
            </div>

            <button type="button" style={googleBtnStyle}><GoogleIcon /> Google로 계속하기</button>
            <button type="button" style={kakaoBtnStyle}><KakaoIcon /> 카카오로 계속하기</button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} style={formStyle}>
            <input placeholder="이름" style={inputStyle} required />
            <input placeholder="아이디" type="text" style={inputStyle} required />
            <input placeholder="비밀번호" type="password" style={inputStyle} required />
            <input placeholder="비밀번호 확인" type="password" style={inputStyle} required />
            <input placeholder="이메일" type="email" style={inputStyle} required />

            <div>
              <p style={{ fontSize: '0.85rem', color: '#8C7B6E', marginBottom: '0.5rem' }}>
                개인정보 처리방침 <span style={{ color: '#f87171' }}>(끝까지 읽어야 동의 가능)</span>
              </p>
              <div ref={scrollRef} onScroll={handleScroll} style={termsBoxStyle}>
                <strong style={{ color: '#2D2520' }}>개인정보 수집 및 이용 동의</strong>
                <br /><br />
                Re:balance는 거북목 예방 및 자세 교정 서비스를 제공하기 위해 다음과 같이 개인정보를 수집·이용합니다.
                <br /><br />
                <strong style={{ color: '#2D2520' }}>1. 영상 처리 방식</strong><br />
                촬영된 영상은 서버에 저장되지 않으며, 신체 좌표값만 추출합니다.
                <br /><br />
                <strong style={{ color: '#2D2520' }}>2. 보유 및 이용 기간</strong><br />
                회원 탈퇴 시 즉시 삭제됩니다.
                <br /><br />
                위 내용을 모두 확인하였습니다.
              </div>

              <label style={{ ...checkboxLabelStyle, opacity: scrollDone ? 1 : 0.4, cursor: scrollDone ? 'pointer' : 'not-allowed' }}>
                <input
                  type="checkbox"
                  disabled={!scrollDone}
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                개인정보 수집 및 이용에 동의합니다
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreed}
              style={{ ...primaryBtn, opacity: agreed ? 1 : 0.4, cursor: agreed ? 'pointer' : 'not-allowed' }}
            >
              회원가입 완료
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* --- 스타일 객체 분리 (가독성 및 유지보수성) --- */
const containerStyle = { minHeight: '100vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' };
const cardStyle = { background: '#F0EBE3', borderRadius: '20px', border: '1px solid #DDD5C8', padding: '2.5rem', width: '100%', maxWidth: '420px' };
const tabContainerStyle = { display: 'flex', background: '#FAF8F5', borderRadius: '10px', padding: '4px', marginBottom: '2rem' };
const tabBtnStyle = { flex: 1, padding: '0.6rem', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const inputStyle = { background: '#FAF8F5', border: '1px solid #DDD5C8', borderRadius: '10px', padding: '0.75rem 1rem', color: '#2D2520', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const primaryBtn = { background: '#7C9E87', color: '#FAF8F5', border: 'none', borderRadius: '10px', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%' };
const dividerStyle = { display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' };
const lineStyle = { flex: 1, height: '1px', background: '#DDD5C8' };
const termsBoxStyle = { height: '160px', overflowY: 'scroll', background: '#FAF8F5', borderRadius: '10px', border: '1px solid #DDD5C8', padding: '1rem', fontSize: '0.82rem', lineHeight: 1.8, color: '#8C7B6E' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.9rem', color: '#2D2520' };

const googleBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#ffffff', color: '#2D2520', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', width: '100%' };
const kakaoBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#FEE500', color: '#191919', border: 'none', borderRadius: '10px', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', width: '100%' };

function GoogleIcon() { return <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>; }
function KakaoIcon() { return <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#191919" d="M12 3C6.48 3 2 6.48 2 10.8c0 2.7 1.6 5.1 4 6.6l-1 3.7 4.3-2.8c.9.2 1.8.3 2.7.3 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/></svg>; }

export default Login;