import './BackButton.css';

/** '이전' 버튼 — 아이콘+텍스트 병행 (아이콘 단독 금지 원칙) */
export default function BackButton({ onClick }) {
  const handleClick = () => {
    navigator.vibrate?.(10);
    onClick?.();
  };
  return (
    <button className="back-btn" onClick={handleClick} aria-label="이전 단계로">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
      </svg>
      <span>이전</span>
    </button>
  );
}
