import { useFlow } from '../../context/FlowContext';
import { publish } from '../../api/client';
import { MESSAGES, plain } from '../../constants/messages';
import ScreenLayout from '../../components/ScreenLayout';
import BigButton from '../../components/BigButton';
import './P5Confirm.css';

/**
 * P5 · 발행 전 확인: 생성 결과 전문을 큰 글씨로 표시하고 음성으로 읽어준 뒤
 * 예/아니오 확인 (오인식 → 발행 차단의 핵심 관문)
 */
export default function P5Confirm({ speak, speaking, onRetry }) {
  const { storeId, story, setPublicUrl, goTo } = useFlow();

  if (!story) return null;

  const readStory = () =>
    speak([story.title, ...story.story_lines].join('. '));

  const handleYes = async () => {
    const { public_url } = await publish(storeId);   // POST /publish
    setPublicUrl(public_url);
    speak(MESSAGES.P6.tts);
    goTo('P6');
  };

  return (
    <ScreenLayout
      title={MESSAGES.P5.title}
      speaking={speaking}
      hideWave
      actions={
        <div className="p5-actions">
          <BigButton onClick={handleYes}>{MESSAGES.P5.yesBtn}</BigButton>
          <BigButton variant="secondary" onClick={onRetry}>{MESSAGES.P5.noBtn}</BigButton>
        </div>
      }
    >
      <div className="p5-card" role="button" tabIndex={0}
           onClick={readStory} onKeyDown={(e) => e.key === 'Enter' && readStory()}
           aria-label="카드를 누르면 내용을 읽어 드려요">
        <p className="p5-card__title">{story.title}</p>
        <div className="p5-card__divider" aria-hidden="true" />
        <div className="p5-card__tags">
          {story.hashtags.map((t) => <span key={t}>{t}</span>)}
        </div>
        {story.story_lines.map((line, i) => (
          <p key={i} className="p5-card__line">{line}</p>
        ))}
      </div>
    </ScreenLayout>
  );
}
