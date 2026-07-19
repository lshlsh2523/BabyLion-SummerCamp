import './illustrations.css';

/** P3 · 말하고 있는 할머니 + 점 3개 말풍선 (시안 ⑤ 이식) */
export default function GrandmaTalking() {
  return (
    <div className="illust-talking">
      <svg viewBox="0 0 110 120" width="140" height="153" role="img" aria-label="말하고 있는 할머니">
        <ellipse cx="55" cy="114" rx="40" ry="6" fill="#EDF7DF" />
        <path d="M 25 113 Q 22 74 55 71 Q 88 74 85 113 Z" fill="#7CC544" />
        <path d="M 25 113 Q 22 74 55 71 L 55 113 Z" fill="#8BD553" />
        <circle cx="55" cy="42" r="30" fill="#FFE3C9" />
        <path d="M 27 37 Q 24 11 55 8 Q 86 11 83 37 Q 80 24 66 21 Q 52 18 40 23 Q 30 26 27 37 Z" fill="#DCDCDC" />
        <circle cx="55" cy="8" r="9" fill="#CFCFCF" /><circle cx="55" cy="8" r="4" fill="#E8E8E8" />
        <circle cx="44" cy="43" r="8.5" fill="none" stroke="#8A6B4F" strokeWidth="2.8" />
        <circle cx="66" cy="43" r="8.5" fill="none" stroke="#8A6B4F" strokeWidth="2.8" />
        <path d="M 52 43 Q 55 40 58 43" fill="none" stroke="#8A6B4F" strokeWidth="2.8" />
        <circle cx="44" cy="43" r="2.2" fill="#5B4632" /><circle cx="66" cy="43" r="2.2" fill="#5B4632" />
        <circle cx="35" cy="55" r="5" fill="#FFC1A1" /><circle cx="75" cy="55" r="5" fill="#FFC1A1" />
        <path d="M 47 59 Q 55 68 63 59 Q 60 72 51 68 Z" fill="#C9573F" />
        <path d="M 33 84 Q 18 88 16 100" fill="none" stroke="#7CC544" strokeWidth="11" strokeLinecap="round" />
        <path d="M 77 84 Q 92 88 94 100" fill="none" stroke="#7CC544" strokeWidth="11" strokeLinecap="round" />
        <circle cx="16" cy="103" r="6" fill="#FFE3C9" /><circle cx="94" cy="103" r="6" fill="#FFE3C9" />
      </svg>
      <div className="illust-talking__bubble" aria-hidden="true">
        <span /><span /><span />
      </div>
    </div>
  );
}
