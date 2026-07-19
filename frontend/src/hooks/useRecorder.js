import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../constants/config';

/**
 * MediaRecorder 토글 녹음 (수행일지 결정 #2: 홀드가 아닌 탭 토글).
 * - start() / stop() / 상태(recording), 경과초(elapsed)
 * - 90초 도달 시 자동 정지 (autoStopped 플래그로 안내 문구 분기)
 * - stop 시 onComplete(Blob) 콜백
 * 기준 기기: 안드로이드 크롬 → audio/webm
 */
export function useRecorder({ onComplete }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [autoStopped, setAutoStopped] = useState(false);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const cleanupTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop(); // onstop에서 마무리
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setAutoStopped(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        cleanupTimer();
        stream.getTracks().forEach((t) => t.stop()); // 마이크 점유 해제
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onComplete?.(blob);
      };

      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((sec) => {
          if (sec + 1 >= CONFIG.RECORD_MAX_SEC) {
            setAutoStopped(true);
            stop();                       // 90초 자동 정지
            return CONFIG.RECORD_MAX_SEC;
          }
          return sec + 1;
        });
      }, 1000);
    } catch {
      setError('mic_denied'); // 마이크 권한 거부 등
    }
  }, [onComplete, stop]);

  const toggle = useCallback(() => (recording ? stop() : start()), [recording, start, stop]);

  useEffect(() => () => { cleanupTimer(); stop(); }, [stop]);

  return { recording, elapsed, autoStopped, error, start, stop, toggle };
}
