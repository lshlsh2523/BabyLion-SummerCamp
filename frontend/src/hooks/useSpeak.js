import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * speechSynthesis 래퍼.
 * - speak(text): 진행 중이던 음성은 취소하고 새로 읽음
 * - speaking: 파형(SpeechWave) 표시 토글용 상태
 *
 * ⚠️ Chrome 정책: 사용자 제스처(탭) 이후에만 재생됨.
 *    첫 speak()는 반드시 스플래시 탭 이후에 호출할 것.
 */
export function useSpeak() {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback((text) => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.9;          // 시니어 대상: 기본보다 약간 느리게
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);

    utterRef.current = u;  // GC로 인한 조기 중단 방지
    window.speechSynthesis.speak(u);
  }, [supported]);

  useEffect(() => stop, [stop]); // 언마운트 시 정리

  return { speak, stop, speaking, supported };
}
