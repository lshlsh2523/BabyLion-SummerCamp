import { useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { uploadAnswer } from '../../api/client';
import { useRecorder } from '../../hooks/useRecorder';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import ProgressBar from '../../components/ProgressBar';
import BigButton from '../../components/BigButton';
import GrandmaTalking from '../../components/illustrations/GrandmaTalking';
import './P3Interview.css';

/** P3 · 음성 인터뷰: 질문 3개, 토글 녹음, 90초 자동 정지, 재녹음 = 덮어쓰기 */
export default function P3Interview({ speak, speaking }) {
  const { storeId, answersDone, markAnswerDone, goTo } = useFlow();
  const [qIdx, setQIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const question = MESSAGES.P3.questions[qIdx];

  const { recording, elapsed, autoStopped, toggle } = useRecorder({
    onComplete: async (blob) => {
      setUploading(true);
      try {
        await uploadAnswer(storeId, question.no, blob);  // POST /answers (STT 포함 5~15초)
        markAnswerDone(question.no);
        setRecorded(true);
        if (autoStopped) speak(MESSAGES.ERROR.recordTooLong);
      } finally {
        setUploading(false);
      }
    },
  });

  const goNext = () => {
    const next = qIdx + 1;
    setRecorded(false);
    if (next < MESSAGES.P3.questions.length) {
      setQIdx(next);
      speak(MESSAGES.P3.questions[next].tts);
    } else {
      speak(MESSAGES.P4.tts);
      goTo('P4');
    }
  };

  return (
    <ScreenLayout
      title={question.title}
      progress={<ProgressBar total={MESSAGES.P3.questions.length} current={qIdx + 1} />}
      speaking={speaking}
      actions={
        recorded && !uploading ? (
          <>
            <BigButton variant="secondary" onClick={() => { setRecorded(false); }}>
              {MESSAGES.P3.reRecordBtn}
            </BigButton>
            <BigButton onClick={goNext}>{MESSAGES.P3.nextBtn}</BigButton>
          </>
        ) : null
      }
    >
      <GrandmaTalking />

      <div className="p3-rec">
        {uploading ? (
          <p className="p3-rec__status">이야기를 듣고 있어요…</p>
        ) : recorded ? (
          <p className="p3-rec__status p3-rec__status--done">잘 들었어요!</p>
        ) : (
          <div className="p3-rec__wrap">
            {recording && (
              <>
                <span className="p3-rec__ring" aria-hidden="true" />
                <span className="p3-rec__ring p3-rec__ring--late" aria-hidden="true" />
              </>
            )}
            <button className={`p3-rec__btn${recording ? ' p3-rec__btn--on' : ''}`}
                    onClick={() => { navigator.vibrate?.(15); toggle(); }}
                    aria-pressed={recording}>
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#fff"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {recording
                  ? <rect x="7" y="7" width="10" height="10" rx="2" fill="#fff" />
                  : <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /></>}
              </svg>
              <span>{recording ? `${elapsed}초 · ${MESSAGES.P3.stopBtn}` : MESSAGES.P3.recordBtn}</span>
            </button>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
