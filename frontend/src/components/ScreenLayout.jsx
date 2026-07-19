import SpeechWave from './SpeechWave';
import './ScreenLayout.css';

/**
 * 상인 플로우 공통 화면 틀.
 * [blob 배경] + [진행 바 슬롯] + [타이틀] + [본문(중앙)] + [파형] + [하단 버튼]
 * - 스크롤 없이 100dvh 한 화면 완결 (한 화면 = 한 작업)
 * - title 의 *별표* 구간은 강조색 <em> 으로 렌더링
 */
function Title({ text }) {
  return (
    <h1 className="screen__title">
      {text.split('\n').map((line, i) => (
        <span key={i} className="screen__title-line">
          {line.split('*').map((seg, j) =>
            j % 2 === 1 ? <em key={j}>{seg}</em> : <span key={j}>{seg}</span>
          )}
        </span>
      ))}
    </h1>
  );
}

export default function ScreenLayout({
  title,
  progress,          // <ProgressBar /> 요소
  speaking = false,  // useSpeak().speaking
  hideWave = false,
  actions,           // 하단 버튼 영역
  lemonBg = false,   // 스플래시용 단색 배경
  children,
}) {
  return (
    <div className={`screen${lemonBg ? ' screen--lemon' : ''}`}>
      {!lemonBg && (
        <>
          <div className="screen__blob screen__blob--tr" aria-hidden="true" />
          <div className="screen__blob screen__blob--bl" aria-hidden="true" />
        </>
      )}
      {progress}
      {title && <Title text={title} />}
      <div className="screen__body">{children}</div>
      {!hideWave && (
        <div className="screen__wave">
          <SpeechWave active={speaking} />
        </div>
      )}
      {actions && <div className="screen__actions">{actions}</div>}
    </div>
  );
}
