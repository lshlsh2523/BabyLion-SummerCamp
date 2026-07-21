import { useFlow } from '../../context/FlowContext';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import GrandmaGreeting from '../../components/illustrations/GrandmaGreeting';
import './RoleSelect.css';

/** ROLE · 스플래시 다음 진입 화면: 가게 사장님(→회원가입) / 일반 사용자(→지도) 분기 */
export default function RoleSelect({ speak, speaking }) {
  const { goTo } = useFlow();

  const handleOwner = () => {
    speak(MESSAGES.SIGNUP.tts);   // 다음 화면 진입 전 미리 낭독 (제스처 직후 호출 원칙)
    goTo('SIGNUP');
  };

  return (
    <ScreenLayout
      title={MESSAGES.ROLE.title}
      speaking={speaking}
      hideWave
      className="role-select"
      actions={
        <>
          <BigButton onClick={handleOwner}>{MESSAGES.ROLE.ownerBtn}</BigButton>
          <BigButton variant="secondary" onClick={() => goTo('MAP')}>
            {MESSAGES.ROLE.guestBtn}
          </BigButton>
        </>
      }
    >
      <GrandmaGreeting />
    </ScreenLayout>
  );
}
