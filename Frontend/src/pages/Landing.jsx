import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaCamera, FaLock, FaRegBell, FaShieldAlt } from "react-icons/fa";
import { TbStretching, TbReportAnalytics } from "react-icons/tb";
import { MdOutlineSecurity } from "react-icons/md";
import { useState, useEffect } from 'react';

function Landing() {
  const navigate = useNavigate();
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={pageContainerStyle}>
      <Navbar />

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={badgeStyle}>
          <FaShieldAlt style={{ marginRight: '6px' }} />
          비인지형 자세 교정 솔루션
        </div>

        <h1 style={heroTitleStyle}>
          내 목 나이, 지금 몇 살일까?<br />
          <span style={highlightTextStyle}>AI 30초 정밀 측정</span>
        </h1>

        <div style={heroDescriptionWrapper}>
          <p style={heroDescriptionStyle}>
            거북목 예방의 시작은 정확한 상태 확인부터.<br />
            AI가 분석한 나의 실시간 자세 점수를 확인하세요.
          </p>
          <p style={securityNoticeStyle}>
            영상은 즉시 파기되고, 오직 '바른 자세' 데이터만 기록됩니다.
          </p>
        </div>

        <button
          onClick={() => navigate('/diagnosis')}
          style={mainButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          지금 거북목 진단하러가기 →
        </button>
        
        <p style={socialProofStyle}>거북목 탈출을 위한 첫걸음, 지금 시작하세요</p>
      </section>

      {/* Re:balance Process */}
      <section style={processSectionStyle}>
        <h2 style={sectionTitleStyle}>당신의 하루를 지키는 AI 페이스메이커</h2>
        <p style={sectionSubTitleStyle}>앱을 켜두기만 하세요. 나머지는 Re:balance가 알아서 합니다.</p>
        
        <div style={gridContainerStyle}>
          {processSteps.map((s, idx) => (
            <div key={idx} 
                 style={cardStyle}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateY(-10px)';
                   e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)';
                   e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)';
                 }}>
              <div style={iconBoxStyle}>{s.icon}</div>
              <h3 style={cardTitleStyle}>{s.title}</h3>
              <p style={cardDescStyle}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Focus Section */}
      <section style={securitySectionStyle}>
        <MdOutlineSecurity style={{ fontSize: '3.5rem', color: '#7C9E87', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>"영상이 저장될까 봐 걱정되시나요?"</h2>
        <p style={securityPStyle}>
          Re:balance는 브라우저 내에서 즉시 <strong>좌표값만 추출(Skeleton Tracking)</strong>합니다.<br />
          원본 영상은 서버로 전송되지 않고 즉시 휘발되니 안심하고 업무에만 집중하세요.
        </p>
        <div style={securityBadgeGroupStyle}>
            <div style={securityItemStyle}><FaLock /> 군사급 데이터 암호화</div>
            <div style={securityItemStyle}><FaCamera /> 영상 즉시 파기 원칙</div>
        </div>
      </section>

      {/* Sticky CTA Bar */}
      <div style={{
        ...stickyBarContainerStyle,
        transform: `translateX(-50%) translateY(${showSticky ? '0' : '120px'})`,
        opacity: showSticky ? 1 : 0,
      }}>
        <button onClick={() => navigate('/diagnosis')} style={stickyButtonStyle}>
          <FaCamera /> 지금 거북목 진단하러가기
        </button>
      </div>
    </div>
  );
}

// --- 스타일 객체 (냉정한 디테일 교정) ---

const pageContainerStyle = {
  background: 'linear-gradient(180deg, #FAF8F5 0%, #F4F0EB 100%)',
  minHeight: '100vh',
  color: '#2D2520',
  fontFamily: 'Pretendard, sans-serif',
  paddingBottom: '100px'
};

const heroSectionStyle = {
  minHeight: '95vh',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  textAlign: 'center', padding: '0 1.25rem',
  gap: '1.8rem'
};

const badgeStyle = {
  background: '#7C9E8715', border: '1px solid #7C9E87',
  borderRadius: '999px', padding: '0.5rem 1.2rem',
  fontSize: '0.85rem', color: '#5C7A65', fontWeight: 700,
  display: 'flex', alignItems: 'center'
};

const heroTitleStyle = {
  fontSize: 'clamp(2rem, 9vw, 2.8rem)',
  fontWeight: 900, lineHeight: 1.2, margin: 0,
  letterSpacing: '-0.05em', wordBreak: 'keep-all'
};

const highlightTextStyle = { 
  color: '#7C9E87', display: 'inline-block', marginTop: '0.5rem',
  background: 'linear-gradient(transparent 70%, #7C9E8722 70%)'
};

const heroDescriptionWrapper = { maxWidth: '480px', margin: '0 auto' };

const heroDescriptionStyle = {
  fontSize: '1.1rem', color: '#6D5D54', lineHeight: 1.6,
  margin: '0', wordBreak: 'keep-all', fontWeight: 500
};

const securityNoticeStyle = {
  fontSize: '0.85rem', color: '#A39284', marginTop: '0.8rem',
  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'
};

const mainButtonStyle = {
  background: '#7C9E87', color: '#FAF8F5',
  border: 'none', borderRadius: '16px',
  padding: '1.3rem 3rem', fontSize: '1.15rem',
  fontWeight: 800, cursor: 'pointer',
  boxShadow: '0 20px 30px -10px rgba(124, 158, 135, 0.5)',
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

const socialProofStyle = { fontSize: '0.8rem', color: '#9CA3AF', marginTop: '-0.5rem' };

const processSectionStyle = { padding: '8rem 1.5rem', maxWidth: '1100px', margin: '0 auto' };
const sectionTitleStyle = { textAlign: 'center', fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' };
const sectionSubTitleStyle = { textAlign: 'center', color: '#8C7B6E', marginBottom: '4rem', fontSize: '1.05rem' };

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.5rem'
};

const cardStyle = {
  background: '#FFFFFF', borderRadius: '28px',
  padding: '2.5rem 2rem', border: '1px solid #F0F0F0',
  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
  transition: 'all 0.4s ease'
};

const iconBoxStyle = { 
  width: '56px', height: '56px', background: '#F8F5F2', 
  borderRadius: '16px', display: 'flex', alignItems: 'center', 
  justifyContent: 'center', fontSize: '1.6rem', marginBottom: '1.8rem',
  color: '#7C9E87'
};

const cardTitleStyle = { fontWeight: 800, marginBottom: '0.8rem', fontSize: '1.25rem', letterSpacing: '-0.02em' };
const cardDescStyle = { color: '#8C7B6E', fontSize: '0.95rem', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' };

const securitySectionStyle = { 
  background: '#2D2520', color: '#FAF8F5', 
  padding: '6rem 2rem', borderRadius: '48px', 
  margin: '0 1rem 4rem', textAlign: 'center' 
};

const securityPStyle = { maxWidth: '650px', margin: '0 auto 3rem', opacity: 0.9, lineHeight: 1.9, wordBreak: 'keep-all', fontWeight: 300 };
const securityBadgeGroupStyle = { display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' };
const securityItemStyle = { fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#D9D3D0' };

const stickyBarContainerStyle = {
  position: 'fixed', bottom: '30px', left: '50%',
  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  width: '90%', maxWidth: '420px', zIndex: 1000
};

const stickyButtonStyle = {
  width: '100%', padding: '1.2rem',
  background: '#7C9E87', color: '#FAF8F5',
  border: 'none', borderRadius: '20px',
  fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer',
  boxShadow: '0 20px 40px rgba(124, 158, 135, 0.4)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px'
};

const processSteps = [
  { icon: <FaCamera />, title: '비침습적 모니터링', desc: '1시간마다 조용히 자세를 체크합니다. 업무 흐름을 방해하지 않는 정교한 AI 엔진입니다.' },
  { icon: <FaRegBell />, title: '스마트 피드백', desc: '거북목 임계치를 넘으면 즉시 알림을 보냅니다. 나쁜 자세가 습관이 되기 전에 고쳐앉으세요.' },
  { icon: <TbStretching />, title: '인터랙티브 스트레칭', desc: '가이드에 맞춰 동작을 수행하면 Pass! 게임처럼 즐겁게 목 근육을 풀어줍니다.' },
  { icon: <TbReportAnalytics />, title: '성장 대시보드', desc: '자세 점수와 스트레칭 기록을 시각화합니다. 점차 젊어지는 목 나이를 확인하세요.' },
];

export default Landing;