import './SpeechWave.css';

/**
 * TTS 파형 캡슐. useSpeak().speaking 을 active 로 넘겨 연동.
 * ※ speechSynthesis 는 오디오 스트림을 노출하지 않으므로
 *    파형은 '말하는 중' 상태 표시용 장식 애니메이션이다 (실제 음량 아님).
 */
const BARS = [
  { anim: 'eq1', dur: '0.9s',  d: '0s',    c: 'var(--green-600)' },
  { anim: 'eq2', dur: '1.1s',  d: '0.1s',  c: 'var(--yellow-400)' },
  { anim: 'eq4', dur: '0.8s',  d: '0.2s',  c: 'var(--green-600)' },
  { anim: 'eq2', dur: '1.0s',  d: '0.3s',  c: 'var(--green-600)' },
  { anim: 'eq1', dur: '0.85s', d: '0.15s', c: 'var(--yellow-400)' },
  { anim: 'eq3', dur: '1.05s', d: '0.25s', c: 'var(--green-600)' },
  { anim: 'eq4', dur: '0.9s',  d: '0.35s', c: 'var(--green-600)' },
];

export default function SpeechWave({ active = false, size = 'sm' }) {
  return (
    <div className={`wave wave--${size}${active ? ' wave--active' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="wave__icon" fill="none"
           stroke="var(--green-icon)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 L6.5 9 H3.5 a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5H6.5L11 19Z" />
        <path d="M15 9.5a4 4 0 0 1 0 5" /><path d="M17.5 7a7.5 7.5 0 0 1 0 10" />
      </svg>
      <div className="wave__bars">
        {BARS.map((b, i) => (
          <div key={i} className="wave__bar"
               style={{ background: b.c, animationName: b.anim,
                        animationDuration: b.dur, animationDelay: b.d }} />
        ))}
      </div>
    </div>
  );
}
