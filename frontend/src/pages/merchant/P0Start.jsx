import React, { useState, useEffect } from 'react';

/

🦁 [사연가게 - 1단계: 홈/시작 화면 컴포넌트]

예빈 디자이너님의 최종 디자인 피드백 시안(image_3c0221.jpg)을 100% 반영한 프리미엄 UI입니다.

@param {Function} onStart - 개발자님의 온보딩 시작 핸들러 함수

@param {Function} onClick - 개발자님의 예비 시작 핸들러 함수

@param {Function} handleStart - 개발자님의 예비 시작 핸들러 함수
*/
export default function P0Start({ onStart, onClick, handleStart, ...props }) {
// 개발자님이 정의해둔 여러 형태의 클릭 이벤트명을 안전하게 캐치합니다.
const handleClick = onStart || onClick || handleStart;

// 음성 안내 도우미 재생 중 상태 모사 (TTS 연동 가능 설계)
const [isPlaying, setIsPlaying] = useState(false);
const [assistantText, setAssistantText] = useState('사장님의 목소리를 기다려요');

const startVoiceAnnouncement = () => {
setIsPlaying(true);
setAssistantText('사장님의 목소리를 기다려요...');

// TTS 브라우저 재생 시뮬레이션
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

// 실제 개발자 이벤트 트리거 호출
if (handleClick) {
  handleClick();
}


};

return (


  {/* 1. 상단 아이폰 상태바 영역 */}
  <div className="flex justify-between items-center w-full px-2 pt-1 shrink-0 text-[#2D2825]/80 text-xs font-semibold">
    <span>9:41</span>
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.07 19.57 10.48 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-1.45-1.45C5.4 14.54 2 11.46 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.96-3.4 7.04-8.55 12.05L12 21z"/></svg>
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11h2c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-2v5zm-5 0h2V6h-2v5zm-6 0h2V6H5v5zm12 5h2v-3h-2v3zm-5 0h2v-3h-2v3zm-5 0h2v-3H5v3z"/></svg>
    </div>
  </div>

  {/* 2. 상단 상점 아이콘 데코 및 타이틀 영역 */}
  <div className="text-center mt-3 shrink-0 flex flex-col items-center">
    {/* 예빈님의 스케치 디자인 느낌을 구현한 연두색 지붕 가게 아이콘 */}
    <div className="w-14 h-14 bg-[#EAF5EC] rounded-2xl flex items-center justify-center text-[#1C522C] mb-2.5 shadow-[0_4px_12px_rgba(28,82,44,0.08)]">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.5a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
      </svg>
    </div>
    
    {/* 명조 감성 서체 타이틀 (그린 포인트 컬러 완벽 적용) */}
    <h1 className="font-serif font-black text-[25px] leading-[1.35] text-[#1E293B] tracking-tight">
      우리 가게 이야기,<br />
      <span className="text-[#00B050] font-bold">목소리로 시작해요</span>
    </h1>
    
    {/* 가독성을 높인 연한 보조 서브타이틀 */}
    <p className="text-stone-500 text-xs mt-2 font-medium leading-relaxed">
      글씨를 쓰지 않아도 됩니다.<br />
      편하게 말씀해 주세요.
    </p>

    {/* 시작 1/3 연두색 배지 패치 (Figma 시안 완벽 일치) */}
    <div className="mt-3.5 px-4 py-1.5 bg-[#EAF5EC] border border-[#D5EAD3] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(28,82,44,0.04)]">
      <span className="text-[11px] font-bold text-[#1C522C]">시작 1/3</span>
    </div>
  </div>

  {/* 3. 중앙 카드 영역 (할머니 캐릭터 일러스트 데코) */}
  <div className="flex-1 flex flex-col items-center justify-center my-3 relative">
    <div className="w-full bg-white rounded-[36px] p-5 border border-stone-200/40 shadow-[0_12px_45px_rgba(71,51,33,0.07)] flex flex-col items-center justify-center space-y-5">
      
      {/* 할머니 일러스트 원형 프레임과 초록 점선 데코 가상 적용 */}
      <div className="relative w-40 h-40 rounded-full bg-[#FAF7F2] border-2 border-dashed border-[#82A07D]/40 flex items-center justify-center shadow-inner overflow-hidden">
        <img 
          src="/illust_grandparents.svg" 
          alt="할머니 도우미" 
          className="w-32 h-32 object-contain transform scale-110"
          onError={(e) => {
            e.target.src = "https://i.ibb.co/3sS7sQ2/grandma-fallback.png";
          }}
        />
      </div>

      {/* 마이크 및 동적 안내 음성 비주얼 웨이브 바 */}
      <div className="w-full bg-[#FAF7F2]/90 rounded-2xl p-4 border border-[#EAE4DD] flex flex-col items-center justify-center shadow-sm">
        <div className="flex items-center gap-3 w-full justify-center mb-1">
          <div className="w-8 h-8 rounded-full bg-[#00B050]/10 flex items-center justify-center text-[#00B050]">
            {/* 마이크 아이콘 피드백 */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </div>
          
          {/* 물결 주파수 도트/바 세트 */}
          <div className="flex items-center gap-[3px] h-6 px-1">
            <span className={`w-[3px] rounded-full bg-[#82A07D] transition-all duration-300 ${isPlaying ? 'h-4' : 'h-2'}`}></span>
            <span className={`w-[3px] rounded-full bg-[#00B050] transition-all duration-300 ${isPlaying ? 'h-5' : 'h-3'}`}></span>
            <span className={`w-[3px] rounded-full bg-[#82A07D] transition-all duration-300 ${isPlaying ? 'h-6' : 'h-4'}`}></span>
            <span className={`w-[3px] rounded-full bg-[#00B050] transition-all duration-300 ${isPlaying ? 'h-5' : 'h-2'}`}></span>
            <span className={`w-[3px] rounded-full bg-[#82A07D] transition-all duration-300 ${isPlaying ? 'h-3' : 'h-3'}`}></span>
          </div>
        </div>
        
        {/* 자막 가이드 라인 */}
        <div className="text-center mt-1">
          <p className="text-xs font-bold text-[#2D2825]">
            {assistantText}
          </p>
          <span className="text-[10px] text-stone-400 font-semibold block">안내가 들리면 편하게 말씀해 주세요</span>
        </div>
      </div>
    </div>
  </div>

  {/* 4. 하단 시작하기 버튼 영역 */}
  <div className="shrink-0 space-y-3">
    <button 
      onClick={startVoiceAnnouncement}
      className="w-full bg-[#00B050] hover:bg-[#009040] active:scale-[0.98] text-white py-4.5 px-6 rounded-3xl font-bold text-lg shadow-[0_10px_25px_rgba(0,176,80,0.25)] transition-all flex items-center justify-center gap-3 border-b-4 border-[#008030]"
    >
      {/* 마이크 및 볼륨 바운싱 이펙트 데코 */}
      <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
      </svg>
      <span className="tracking-wide">가게 이야기 시작하기</span>
    </button>
    
    <p className="text-center text-[10px] text-stone-400 font-semibold tracking-wide">
      회원가입 없이 누구나 무료로 이용 가능
    </p>
  </div>

</div>
