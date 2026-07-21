import { useFlow } from '../../context/FlowContext';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import GrandmaPhone from '../../components/illustrations/GrandmaPhone';

export default function P0Start({ speak, speaking }) {
  const { goTo } = useFlow();   // store 는 Signup 단계에서 이미 생성됨

  const handleStart = () => {
    speak(MESSAGES.P1.steps[0].tts);
    goTo('P1');
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
