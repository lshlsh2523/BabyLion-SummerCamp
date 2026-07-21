import { useState } from 'react';
import { useFlow } from '../../context/FlowContext';
import { useSpeak } from '../../hooks/useSpeak';
import Splash from './Splash';
import RoleSelect from './RoleSelect';
import Signup from './Signup';
import AddressVoice from './AddressVoice';
import MapScreen from '../map/MapScreen';
import P0Start from './P0Start';
import P1Photo from './P1Photo';
import P2BasicInfo from './P2BasicInfo';
import P3Interview from './P3Interview';
import P4Generating from './P4Generating';
import P5Confirm from './P5Confirm';
import P6Done from './P6Done';

/**
 * 상인 플로우 단일 라우트.
 * URL 을 나누지 않고 step 상태로 화면 전환 →
 * 브라우저 뒤로가기가 플로우에 개입하지 않음 (명시적 '이전' 버튼만 사용)
 */
export default function MerchantFlow() {
  const { step, goTo } = useFlow();
  const { speak, speaking } = useSpeak();     // 플로우 전체가 하나의 TTS 인스턴스 공유
  const [retryGen, setRetryGen] = useState(false);

  const common = { speak, speaking };

  switch (step) {
    case 'SPLASH': return <Splash {...common} />;
    case 'ROLE':   return <RoleSelect {...common} />;
    case 'SIGNUP': return <Signup {...common} />;
    case 'ADDRESS': return <AddressVoice {...common} />;
    case 'MAP':    return <MapScreen />;
    case 'P0':     return <P0Start {...common} />;
    case 'P1':     return <P1Photo {...common} />;
    case 'P2':     return <P2BasicInfo {...common} />;
    case 'P3':     return <P3Interview {...common} />;
    case 'P4':     return <P4Generating {...common} retry={retryGen} />;
    case 'P5':     return (
      <P5Confirm {...common}
                 onRetry={() => { setRetryGen(true); goTo('P4'); }} />  // retry=true 재생성
    );
    case 'P6':     return <P6Done {...common} />;
    default:       return <Splash {...common} />;
  }
}
