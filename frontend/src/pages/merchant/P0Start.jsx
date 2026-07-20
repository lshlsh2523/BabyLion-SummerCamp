import React, { useState } from 'react';

export default function P0Start({ onStart, onClick, handleStart, ...props }) {
  const handleClick = onStart || onClick || handleStart;
  const [isPlaying, setIsPlaying] = useState(false);
  const [assistantText, setAssistantText] = useState('사장님의 목소리를 기다려요');

  const startVoiceAnnouncement = () => {
    setIsPlaying(true);
    setAssistantText('사장님의 목소리를 기다려요...');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("우리 가게 이야기, 목소리로 시작해요. 아래 초록 버튼을 눌러주세요.");
      utterance.lang = 'ko-KR';
      utterance.rate = 0.95;
      utterance.onend = () => {
        setIsPlaying(false);
        setAssistantText('사장님의 목소리를 기다려요');
      };
      window.speechSynthesis.speak(utterance);
    }
    if (handleClick) handleClick();
  };

  return (
    <div style={{ width: '402px', height: '874px', backgroundColor: '#FAF8F2', borderRadius: '48px', boxShadow: '0 24px 60px rgba(74,51,33,0.15)', border: '8px solid #2D2825', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', margin: '16px auto', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* 1. 상단 아이폰 상태바 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '12px', fontWeight: '600', color: 'rgba(45,40,37,0.8)' }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span>📶</span><span>🛜</span><span>🔋</span>
        </div>
      </div>

      {/* 2. 상단 상점 아이콘 데코 및 타이틀 영역 */}
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', backgroundColor: '#EAF5EC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C522C', marginBottom: '10px' }}>
          <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.5a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
          </svg>
        </div>
        
        <h1 style={{ fontFamily: 'serif', fontWeight: '900', fontSize: '24px', lineHeight: '1.35', color: '#1E293B', textAlign: 'center', margin: '0' }}>
          우리 가게 이야기,<br />
          <span style={{ color: '#00B050', fontWeight: 'bold' }}>목소리로 시작해요</span>
        </h1>
        
        <p style={{ color: '#78716c', fontSize: '12px', marginTop: '8px', fontWeight: '500', textAlign: 'center', lineHeight: '1.5', margin: '8px 0 0 0' }}>
          글씨를 쓰지 않아도 됩니다.<br />
          편하게 말씀해 주세요.
        </p>

        <div style={{ marginTop: '14px', padding: '6px 16px', backgroundColor: '#EAF5EC', border: '1px solid #D5EAD3', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1C522C' }}>시작 1/3</span>
        </div>
      </div>

      {/* 3. 중앙 카드 영역 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
        <div style={{ width: '100%', backgroundColor: 'white', borderRadius: '36px', padding: '20px', border: '1px solid rgba(231,229,228,0.4)', boxShadow: '0 12px 45px rgba(71,51,33,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', boxSizing: 'border-box' }}>
          
          <div style={{ width: '160px', height: '160px', borderRadius: '50%', backgroundColor: '#FAF7F2', border: '2px dashed rgba(130,160,125,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img 
              src="/illust_grandparents.svg" 
              alt="할머니 도우미" 
              style={{ width: '128px', height: '128px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.src = "https://i.ibb.co/3sS7sQ2/grandma-fallback.png";
              }}
            />
          </div>

          <div style={{ width: '100%', backgroundColor: 'rgba(250,247,242,0.9)', borderRadius: '16px', padding: '16px', border: '1px solid #EAE4DD', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,176,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00B050' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              </div>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <span style={{ width: '3px', height: isPlaying ? '16px' : '8px', backgroundColor: '#82A07D', borderRadius: '999px', transition: 'all 0.3s' }}></span>
                <span style={{ width: '3px', height: isPlaying ? '20px' : '12px', backgroundColor: '#00B050', borderRadius: '999px', transition: 'all 0.3s' }}></span>
                <span style={{ width: '3px', height: isPlaying ? '24px' : '16px', backgroundColor: '#82A07D', borderRadius: '999px', transition: 'all 0.3s' }}></span>
              </div>
            </div>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#2D2825', margin: '4px 0 0 0' }}>{assistantText}</p>
            <span style={{ fontSize: '10px', color: '#a8a29e', fontWeight: '600', marginTop: '2px' }}>안내가 들리면 편하게 말씀해 주세요</span>
          </div>
        </div>
      </div>

      {/* 4. 하단 시작하기 버튼 영역 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={startVoiceAnnouncement}
          style={{ width: '100%', backgroundColor: '#00B050', color: 'white', padding: '16px', borderRadius: '24px', fontWeight: 'bold', fontSize: '18px', border: 'none', borderBottom: '4px solid #008030', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <span style={{ letterSpacing: '0.05em' }}>가게 이야기 시작하기</span>
        </button>
        <p style={{ textAlign: 'center', fontSize: '10px', color: '#a8a29e', fontWeight: '600', margin: '0' }}>
          회원가입 없이 누구나 무료로 이용 가능
        </p>
      </div>

    </div>
  );
}
