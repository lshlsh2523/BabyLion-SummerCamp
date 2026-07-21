import './illustrations.css';

/** ROLE · 벽을 끼고 손을 흔들며 인사하는 할머니 */
export default function GrandmaGreeting() {
  return (
    <svg viewBox="0 0 168 128" width="196" height="149" role="img" aria-label="벽을 끼고 인사하는 할머니">
      {/* 벽 */}
      <rect x="0" y="10" width="66" height="112" rx="8" fill="#DDD0AF" />
      <line x1="0" y1="42" x2="66" y2="42" stroke="#C7B78D" strokeWidth="2" />
      <line x1="0" y1="72" x2="66" y2="72" stroke="#C7B78D" strokeWidth="2" />
      <line x1="0" y1="100" x2="66" y2="100" stroke="#C7B78D" strokeWidth="2" />
      <line x1="60" y1="10" x2="60" y2="122" stroke="#C9BA90" strokeWidth="3" />

      {/* 몸 */}
      <ellipse cx="97" cy="116" rx="36" ry="6" fill="#EDF7DF" />
      <path d="M 67 113 Q 64 74 97 71 Q 130 74 127 113 Z" fill="#7CC544" />
      <path d="M 67 113 Q 64 74 97 71 L 97 113 Z" fill="#8BD553" />

      {/* 얼굴 */}
      <circle cx="97" cy="42" r="30" fill="#FFE3C9" />
      <path d="M 69 37 Q 66 11 97 8 Q 128 11 125 37 Q 122 24 108 21 Q 94 18 82 23 Q 72 26 69 37 Z" fill="#DCDCDC" />
      <circle cx="97" cy="8" r="9" fill="#CFCFCF" /><circle cx="97" cy="8" r="4" fill="#E8E8E8" />
      <circle cx="86" cy="43" r="8.5" fill="none" stroke="#8A6B4F" strokeWidth="2.8" />
      <circle cx="108" cy="43" r="8.5" fill="none" stroke="#8A6B4F" strokeWidth="2.8" />
      <path d="M 94 43 Q 97 40 100 43" fill="none" stroke="#8A6B4F" strokeWidth="2.8" />
      <circle cx="86" cy="43" r="2.2" fill="#5B4632" /><circle cx="108" cy="43" r="2.2" fill="#5B4632" />
      <circle cx="77" cy="55" r="5" fill="#FFC1A1" /><circle cx="117" cy="55" r="5" fill="#FFC1A1" />
      <path d="M 89 59 Q 97 68 105 59 Q 102 72 93 68 Z" fill="#C9573F" />

      {/* 흔드는 손 */}
      <g className="illust-greeting__arm">
        <path d="M 127 84 Q 146 68 142 46" fill="none" stroke="#7CC544" strokeWidth="11" strokeLinecap="round" />
        <circle cx="142" cy="46" r="6" fill="#FFE3C9" />
        <path d="M 150 34 Q 156 32 158 38" fill="none" stroke="#8BD543" strokeWidth="3" strokeLinecap="round" />
        <path d="M 152 44 Q 160 44 162 50" fill="none" stroke="#FFE94A" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
