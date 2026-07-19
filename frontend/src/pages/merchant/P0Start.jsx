import { useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { createStore } from '../../api/client';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import GrandmaPhone from '../../components/illustrations/GrandmaPhone';

export default function P0Start({ speak, speaking }) {
  const { goTo, setStore } = useFlow();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await createStore();   // POST /stores
      setStore(res);
      speak(MESSAGES.P1.steps[0].tts);
      goTo('P1');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout
      title={MESSAGES.P0.title}
      speaking={speaking}
      actions={<BigButton onClick={handleStart}>{MESSAGES.P0.startBtn}</BigButton>}
    >
      <GrandmaPhone />
    </ScreenLayout>
  );
}
