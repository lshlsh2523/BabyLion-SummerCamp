import './ProgressBar.css';

/**
 * 글자 없는 분할 진행 바 (수행일지 결정 #4).
 * current 는 1부터 시작. 스크린리더용으로만 텍스트 제공.
 */
export default function ProgressBar({ total, current }) {
  return (
    <div className="progress" role="progressbar"
         aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}
         aria-label={`${total}단계 중 ${current}단계`}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`progress__seg${i < current ? ' progress__seg--done' : ''}`} />
      ))}
    </div>
  );
}
