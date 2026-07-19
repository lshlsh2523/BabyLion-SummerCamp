import { useEffect, useRef, useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { generate, getStore } from '../../api/client';
import { usePolling } from '../../hooks/usePolling';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import GrandmaRocking from '../../components/illustrations/GrandmaRocking';
import './P4Generating.css';

/** P4 · 생성 대기: generate → 2초 폴링 → done 시 story 조회 후 P5 */
export default function P4Generating({ retry = false, speak, speaking }) {
  const { storeId, setStory, goTo } = useFlow();
  const { pollJob, cancel } = usePolling();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const run = async () => {
    setFailed(false);
    try {
      const { job_id } = await generate(storeId, { retry });   // POST /generate
      const status = await pollJob(job_id);                    // GET /jobs/{id}
      if (status === 'done') {
        const store = await getStore(storeId);                 // GET /stores/{id}
        setStory(store.story);
        speak(MESSAGES.P5.tts);
        goTo('P5');
      } else {
        setFailed(true);
        speak(MESSAGES.ERROR.generateFailed);
      }
    } catch {
      setFailed(true);
      speak(MESSAGES.ERROR.generateFailed);
    }
  };

  useEffect(() => {
    if (started.current) return;   // StrictMode 중복 실행 방지
    started.current = true;
    run();
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <ScreenLayout
        title={MESSAGES.ERROR.generateFailed}
        speaking={speaking}
        actions={<BigButton onClick={run}>{MESSAGES.ERROR.retryBtn}</BigButton>}
      >
        <GrandmaRocking />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={MESSAGES.P4.title} speaking={speaking} hideWave>
      <GrandmaRocking />
      <div className="p4-dots" aria-label="만드는 중">
        <span /><span /><span />
      </div>
    </ScreenLayout>
  );
}
