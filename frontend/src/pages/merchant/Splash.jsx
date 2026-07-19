import { useFlow } from '../../context/FlowContext';
import { MESSAGES } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import './Splash.css';

/**
 * 스플래시. 시안은 자동 전환이었으나 Chrome의 오디오 정책상
 * 사용자 탭 이전에는 TTS가 재생되지 않으므로,
 * "화면 전체 탭 = 첫 제스처 확보 + P0 진입"으로 변경. (팀 공유 사항)
 */
export default function Splash({ speak }) {
  const { goTo } = useFlow();

  const handleTap = () => {
    navigator.vibrate?.(15);
    speak(MESSAGES.P0.tts);   // 제스처 직후 호출 → 재생 허용
    goTo('P0');
  };

  return (
    <div role="button" tabIndex={0} onClick={handleTap}
         onKeyDown={(e) => e.key === 'Enter' && handleTap()}
         aria-label="시작하기">
      <ScreenLayout lemonBg hideWave>
        <div className="splash">
          <div className="splash__rings" aria-hidden="true">
            <span className="splash__ring" />
            <span className="splash__ring splash__ring--late" />
            <div className="splash__speaker">
              <svg viewBox="0 0 24 24" width="56" height="56" fill="none"
                   stroke="#4CA324" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 L6.5 9 H3.5 a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5H6.5L11 19Z" />
                <path d="M15 9.5a4 4 0 0 1 0 5" /><path d="M17.5 7a7.5 7.5 0 0 1 0 10" />
              </svg>
            </div>
          </div>
          <p className="splash__title">
            {MESSAGES.SPLASH.title.split('\n').map((l, i) => <span key={i}>{l}</span>)}
          </p>
          <p className="splash__sub">{MESSAGES.SPLASH.sub}</p>
        </div>
      </ScreenLayout>
    </div>
  );
}
