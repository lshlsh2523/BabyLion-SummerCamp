import './illustrations.css';

/** P4 · 흔들의자에서 쉬는 할머니 + 반짝이 (시안 ⑥ 이식) */
export default function GrandmaRocking() {
  return (
    <div className="illust-rocking">
      <svg viewBox="0 0 170 160" width="216" height="203" role="img"
           aria-label="흔들의자에 앉아 쉬는 할머니" className="illust-rocking__chair">
        <path d="M 25 143 Q 85 165 145 143" fill="none" stroke="#B08558" strokeWidth="7" strokeLinecap="round" />
        <path d="M 45 62 Q 38 58 39 78 L 43 122" fill="none" stroke="#C69A66" strokeWidth="9" strokeLinecap="round" />
        <rect x="38" y="118" width="94" height="12" rx="6" fill="#C69A66" />
        <path d="M 47 128 L 41 146 M 123 128 L 129 146" stroke="#B08558" strokeWidth="8" strokeLinecap="round" />
        <path d="M 40 92 Q 28 92 30 108" fill="none" stroke="#C69A66" strokeWidth="8" strokeLinecap="round" />
        <path d="M 128 92 Q 140 92 138 108" fill="none" stroke="#C69A66" strokeWidth="8" strokeLinecap="round" />
        <path d="M 55 120 Q 50 82 84 79 Q 118 82 113 120 Z" fill="#7CC544" />
        <path d="M 55 120 Q 50 82 84 79 L 84 120 Z" fill="#8BD553" />
        <path d="M 66 120 L 66 138 M 102 120 L 102 138" stroke="#5E8A2E" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="64" cy="142" rx="9" ry="5" fill="#8A6B4F" /><ellipse cx="104" cy="142" rx="9" ry="5" fill="#8A6B4F" />
        <circle cx="84" cy="52" r="27" fill="#FFE3C9" />
        <path d="M 59 48 Q 56 24 84 21 Q 112 24 109 48 Q 106 36 94 34 Q 82 31 71 36 Q 62 39 59 48 Z" fill="#DCDCDC" />
        <circle cx="84" cy="20" r="8" fill="#CFCFCF" /><circle cx="84" cy="20" r="3.5" fill="#E8E8E8" />
        <path d="M 67 51 Q 71 48 76 51" fill="none" stroke="#8A6B4F" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M 92 51 Q 96 48 101 51" fill="none" stroke="#8A6B4F" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="63" cy="62" r="4.5" fill="#FFC1A1" /><circle cx="105" cy="62" r="4.5" fill="#FFC1A1" />
        <path d="M 77 66 Q 84 71 91 66" fill="none" stroke="#C9573F" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M 62 90 Q 55 100 66 106" fill="none" stroke="#7CC544" strokeWidth="10" strokeLinecap="round" />
        <path d="M 106 90 Q 113 100 102 106" fill="none" stroke="#7CC544" strokeWidth="10" strokeLinecap="round" />
        <circle cx="70" cy="107" r="6" fill="#FFE3C9" /><circle cx="98" cy="107" r="6" fill="#FFE3C9" />
      </svg>
      <div className="illust-rocking__spark illust-rocking__spark--star" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 3 L13.5 9 L19 10.5 L13.5 12 L12 18 L10.5 12 L5 10.5 L10.5 9 Z" fill="#FFE97A" /></svg>
      </div>
      <div className="illust-rocking__spark illust-rocking__spark--dot" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="6" fill="#C9F14E" /></svg>
      </div>
    </div>
  );
}
