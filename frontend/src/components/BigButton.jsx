import './BigButton.css';

/**
 * 주 액션 버튼 (그라데이션) / variant="secondary" 는 흰 배경 보조 버튼.
 * - 터치 최소 64px, 라벨 23px+ (tokens.css)
 * - 탭 시 짧은 진동 피드백 (수행일지 결정 #6, 안드로이드 크롬 지원)
 */
export default function BigButton({ children, onClick, variant = 'primary', disabled, ...rest }) {
  const handleClick = (e) => {
    navigator.vibrate?.(15);
    onClick?.(e);
  };
  return (
    <button
      className={`big-btn big-btn--${variant}`}
      onClick={handleClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
