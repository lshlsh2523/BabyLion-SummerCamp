import { useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { transcribeAudio, saveBasicInfo } from '../../api/client';
import { useRecorder } from '../../hooks/useRecorder';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import BackButton from '../../components/BackButton';
import GrandmaTalking from '../../components/illustrations/GrandmaTalking';
import './AddressVoice.css';

/**
 * ADDRESS · 가게 주소 음성 입력 (회원가입 직후).
 * 탭해서 녹음 → /transcribe STT → basic_info.address 저장 (대표메뉴 마이크와 동일 방식).
 */
// (데모 술수) 어떤 음성이든 주소는 이 고정값으로 저장한다. 실제 인식 결과는 사용하지 않음.
const DEMO_FIXED_ADDRESS = '대전 동구 대전로797번길 33';
export default function AddressVoice({ speak, speaking }) {
  const { storeId, basicInfo, setBasicInfo, goTo } = useFlow();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const { recording, elapsed, error: micError, toggle } = useRecorder({
    onComplete: async (blob) => {
      setBusy(true);
      setError(null);
      try {
        // 실제 녹음·인식 흐름은 유지하되(처리 지연·검증), 결과는 무시하고 고정 주소로 저장 (데모 술수)
        try { await transcribeAudio(storeId, blob); } catch { /* STT 실패해도 데모 진행 */ }
        await saveBasicInfo(storeId, { address: DEMO_FIXED_ADDRESS });
        setBasicInfo({ address: DEMO_FIXED_ADDRESS });
      } catch (e) {
        setError(e?.code || 'SAVE_FAILED');
      } finally {
        setBusy(false);
      }
    },
  });

  const address = basicInfo.address;

  return (
    <ScreenLayout
      title={MESSAGES.ADDRESS.title}
      speaking={speaking}
      actions={
        <>
          <BackButton onClick={() => goTo('SIGNUP')} />
          <BigButton onClick={() => { speak(MESSAGES.P0.tts); goTo('P0'); }} disabled={!address}>
            {MESSAGES.ADDRESS.nextBtn}
          </BigButton>
        </>
      }
    >
      <GrandmaTalking />

      <div className="addr-rec">
        {busy ? (
          <p className="addr-rec__status">{MESSAGES.ADDRESS.listening}</p>
        ) : address ? (
          <p className="addr-rec__value">"{address}"</p>
        ) : (
          <p className="addr-rec__hint">{MESSAGES.ADDRESS.hint}</p>
        )}

        {(error || micError) && !busy && (
          <p className="addr-rec__status" style={{ color: '#c0392b' }}>
            {micError === 'mic_denied'
              ? '마이크 권한을 허용해 주세요'
              : '잘 안 들렸어요. 다시 말씀해 주세요'}
          </p>
        )}

        <button className={`addr-mic${recording ? ' addr-mic--on' : ''}`}
                aria-pressed={recording} aria-label="가게 주소 말하기" disabled={busy}
                onClick={() => { navigator.vibrate?.(15); toggle(); }}>
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {recording
              ? <rect x="7" y="7" width="10" height="10" rx="2" fill="#fff" />
              : <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /></>}
          </svg>
          <span>{busy ? '변환 중…' : recording ? `${elapsed}초 · ${MESSAGES.ADDRESS.stopBtn}` : MESSAGES.ADDRESS.recordBtn}</span>
        </button>
      </div>
    </ScreenLayout>
  );
}
